import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEmbeddings } from '../lib/gemini-embeddings';
import { supabase } from '../lib/supabase';
import { querySchema } from '../lib/validation';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (current.count >= RATE_LIMIT) {
    return false;
  }
  
  current.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).setHeaders(corsHeaders);
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeaders(corsHeaders).json({ 
      success: false, 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Check rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP;
    
    if (!checkRateLimit(ip)) {
      return res.status(429).setHeaders(corsHeaders).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Validate and sanitize input
    const validation = querySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).setHeaders(corsHeaders).json({
        success: false,
        error: 'Invalid input: ' + validation.error.errors.map(e => e.message).join(', ')
      });
    }

    const { question } = validation.data;
    const sanitizedQuestion = sanitizeInput(question);
    
    if (!sanitizedQuestion) {
      return res.status(400).setHeaders(corsHeaders).json({
        success: false,
        error: 'Question cannot be empty after sanitization'
      });
    }
    
    console.log(`🔍 Processing query: "${sanitizedQuestion}"`);
    
    // Check for Google AI API key
    const googleAIKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleAIKey) {
      console.error('Missing GOOGLE_AI_API_KEY environment variable');
      return res.status(500).setHeaders(corsHeaders).json({
        success: false,
        error: 'AI service configuration error'
      });
    }
    
    // 1. Embed the question
    const embeddings = new GeminiEmbeddings(googleAIKey);
    const questionEmbedding = await embeddings.embedQuery(sanitizedQuestion);
    console.log(`📊 Question embedding created (${questionEmbedding.length} dimensions)`);
    
    // 2. Find similar documents using vector similarity (public access for now)
    const { data: similarDocs, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: questionEmbedding,
      match_threshold: 0.3,
      match_count: 5
    });
    
    if (searchError) {
      console.error('Vector search error:', searchError);
      throw new Error('Failed to search documents');
    }
    
    console.log(`🔍 Vector search completed. Found ${similarDocs?.length || 0} similar documents`);
    
    if (!similarDocs || similarDocs.length === 0) {
      return res.status(200).setHeaders(corsHeaders).json({
        success: true,
        answer: "I don't have specific information about that in my resume. Please feel free to reach out to me directly for more details!",
        relevantDocuments: [],
        question: sanitizedQuestion
      });
    }
    
    // 3. Prepare context for LLM
    const context = similarDocs.map(doc => doc.content).join('\n\n');
    
    // 4. Generate response using Gemini
    const genAI = new GoogleGenerativeAI(googleAIKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI assistant helping to answer questions about Ilan Klimberg's resume and experience. 

Context from Ilan's resume:
${context}

Question: ${sanitizedQuestion}

Please provide a helpful, accurate answer based on the context above. Be conversational and professional. If the context doesn't contain enough information to fully answer the question, acknowledge what you can answer and suggest reaching out to Ilan directly.

Answer:`;
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    // 5. Log the interaction (skip for now due to RLS - will require auth)
    try {
      const { error: logError } = await supabase
        .from('chats')
        .insert({
          question: sanitizedQuestion,
          answer: answer,
          user_id: null, // Will be set after auth is implemented
          relevant_documents: similarDocs.map(doc => ({
            content: doc.content.substring(0, 200) + '...',
            metadata: doc.metadata
          }))
        });
      
      if (logError) {
        console.error('Error logging chat (expected due to RLS):', logError);
      }
    } catch (logError) {
      console.error('Chat logging failed (expected):', logError);
    }
    
    
    // 6. Return response
    res.status(200).setHeaders(corsHeaders).json({
      success: true,
      answer: answer,
      relevantDocuments: similarDocs.map(doc => ({
        content: doc.content,
        metadata: doc.metadata
      })),
      question: sanitizedQuestion
    });
    
  } catch (error) {
    console.error('Query processing error:', error);
    
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction 
      ? 'An error occurred while processing your request. Please try again later.'
      : `Error: ${error.message}`;
    
    res.status(500).setHeaders(corsHeaders).json({
      success: false,
      error: errorMessage
    });
  }
}