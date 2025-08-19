import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/lib/env.js';
import { handlePreflight, getCorsHeaders } from '../src/lib/cors.js';
import { GeminiEmbeddings } from '../src/lib/embeddings/index.js';
import { GeminiLLM } from '../src/lib/llm/index.js';
import { PgVectorDB } from '../src/lib/vectordb/pgvector.js';
import { assemblePrompt, truncateContext } from '../src/rag.js';

// Request schema validation
const querySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(512, 'Query cannot exceed 512 characters'),
  stream: z.boolean().optional().default(false),
});

// Error response schema
interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

// Success response schema
interface SuccessResponse {
  answer: string;
  retrieve_ms: number;
  llm_ms: number;
  total_ms: number;
}

// Rate limit response schema
interface RateLimitResponse {
  code: 'RATE_LIMIT';
  message: string;
  remaining: number;
}

export default async function handler(req: Request): Promise<Response> {
  const startTime = Date.now();
  const origin = req.headers.get('origin') || undefined;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    const preflightResponse = handlePreflight(origin);
    if (preflightResponse) return preflightResponse;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
        },
      }
    );
  }

  try {
    // Validate CORS origin
    if (!origin || !getCorsHeaders(origin)['Access-Control-Allow-Origin']) {
      return new Response(
        JSON.stringify({
          code: 'FORBIDDEN',
          message: 'Origin not allowed',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // Extract and validate Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    const token = authHeader.substring(7);
    
    // Initialize Supabase client with user JWT
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // Parse and validate request body
    let body: z.infer<typeof querySchema>;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    const validationResult = querySchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Invalid request body',
          details: validationResult.error.errors.map(e => e.message).join(', '),
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    const { query, stream } = validationResult.data;

    // Check rate limit using stored procedure
    try {
      const { error: rateLimitError } = await supabase.rpc('enforce_daily_cap_for_caller', {
        p_cap: env.DAILY_QUERY_CAP
      });
      
      if (rateLimitError) {
        if (rateLimitError.message.includes('DAILY_CAP_REACHED')) {
          const rateLimitResponse: RateLimitResponse = {
            code: 'RATE_LIMIT',
            message: `Daily query limit of ${env.DAILY_QUERY_CAP} reached`,
            remaining: 0,
          };
          
          return new Response(
            JSON.stringify(rateLimitResponse),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin),
              },
            }
          );
        }
        throw rateLimitError;
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return new Response(
        JSON.stringify({
          code: 'INTERNAL_ERROR',
          message: 'Failed to check rate limit',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // Initialize services
    const embeddings = new GeminiEmbeddings();
    const vectorDB = new PgVectorDB();
    const llm = new GeminiLLM();

    try {
      // Generate query embedding
      const retrieveStart = Date.now();
      const queryEmbedding = await embeddings.embedText(query);
      
      // Search for similar documents using secure RPC
      const embeddingArray = Array.from(queryEmbedding);
      const { data: searchResults, error: searchError } = await supabase.rpc('match_documents_secure', {
        query_embedding: embeddingArray,
        match_threshold: 0.7,
        match_count: 6
      });

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error(`Failed to search documents: ${searchError.message}`);
      }

      const results = (searchResults || []).map((row: any) => ({
        content: row.content,
        metadata: row.metadata,
        similarity: row.similarity,
      }));
      
      // Truncate context to stay within token limits
      const truncatedResults = truncateContext(results, 2400);
      
      const retrieveTime = Date.now() - retrieveStart;

      // Assemble prompt
      const prompt = assemblePrompt(query, truncatedResults);

      if (stream) {
        // Stream response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const llmStart = Date.now();
              
              for await (const chunk of llm.completeStream(prompt, 350)) {
                if (chunk.done) {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  break;
                }
                
                if (chunk.text) {
                  controller.enqueue(new TextEncoder().encode(`data: ${chunk.text}\n\n`));
                }
              }
              
              const llmTime = Date.now() - llmStart;
              const totalTime = Date.now() - startTime;
              
              console.log(`Stream completed - Retrieve: ${retrieveTime}ms, LLM: ${llmTime}ms, Total: ${totalTime}ms`);
              
            } catch (error) {
              console.error('Stream error:', error);
              controller.enqueue(new TextEncoder().encode(`data: [ERROR] ${error instanceof Error ? error.message : 'Unknown error'}\n\n`));
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...getCorsHeaders(origin),
          },
        });
      } else {
        // Single response
        const llmStart = Date.now();
        const llmResponse = await llm.completeOnce(prompt, 350);
        const llmTime = Date.now() - llmStart;
        const totalTime = Date.now() - startTime;

        const response: SuccessResponse = {
          answer: llmResponse.text,
          retrieve_ms: retrieveTime,
          llm_ms: llmTime,
          total_ms: totalTime,
        };

        console.log(`Query completed - Retrieve: ${retrieveTime}ms, LLM: ${llmTime}ms, Total: ${totalTime}ms`);

        return new Response(
          JSON.stringify(response),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(origin),
            },
          }
        );
      }

    } finally {
      // Cleanup
      await vectorDB.close();
    }

  } catch (error) {
    console.error('API error:', error);
    
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
        },
      }
    );
  }
}
