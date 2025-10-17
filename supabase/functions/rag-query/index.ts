import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini embeddings helper
class GeminiEmbeddings {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] }
        })
      }
    );

    const data = await response.json();
    return data.embedding.values;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, anonymousId } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ success: false, error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!anonymousId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Anonymous ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🔍 Processing query: "${question}"`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize Gemini
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')!;
    
    // 1. Embed the question
    const embeddings = new GeminiEmbeddings(googleApiKey);
    const questionEmbedding = await embeddings.embedQuery(question);
    console.log(`📊 Question embedding created (${questionEmbedding.length} dimensions)`);
    
    // 2. Find similar documents using vector similarity
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
      return new Response(
        JSON.stringify({
          success: true,
          answer: "I don't have specific information about that in my resume. Please feel free to reach out to me directly for more details!",
          relevantDocuments: [],
          question: question
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 3. Prepare context for LLM
    const context = similarDocs.map(doc => doc.content).join('\n\n');
    
    // 4. Generate response using Gemini
    const prompt = `You are an AI assistant helping to answer questions about Ilan Klimberg's resume and experience. 

Context from Ilan's resume:
${context}

Question: ${question}

Please provide a helpful, accurate answer based on the context above. Be conversational and professional. If the context doesn't contain enough information to fully answer the question, acknowledge what you can answer and suggest reaching out to Ilan directly.

Answer:`;
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    
    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates[0].content.parts[0].text;
    
    // 5. Log the interaction to questions table
    const { error: logError } = await supabase
      .from('questions')
      .insert({
        anonymous_id: anonymousId,
        question_text: question,
        answer_text: answer,
        relevant_documents: similarDocs.map(doc => ({
          content: doc.content,
          metadata: doc.metadata
        }))
      });
    
    if (logError) {
      console.error('Error logging question:', logError);
    }
    
    // 6. Return response
    return new Response(
      JSON.stringify({
        success: true,
        answer: answer,
        relevantDocuments: similarDocs.map(doc => ({
          content: doc.content,
          metadata: doc.metadata
        })),
        question: question
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Query processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
