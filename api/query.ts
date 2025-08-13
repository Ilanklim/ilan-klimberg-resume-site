import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEmbeddings } from '../lib/gemini-embeddings.js';
import { supabase } from '../lib/supabase.js';
import { querySchema } from '../lib/validation.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Validate and sanitize input
    const validation = querySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: ' + validation.error.errors.map(e => e.message).join(', ')
      });
    }

    const { question } = validation.data;
    const sanitizedQuestion = sanitizeInput(question);
    
    if (!sanitizedQuestion) {
      return res.status(400).json({
        success: false,
        error: 'Question cannot be empty after sanitization'
      });
    }

    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization required'
      });
    }

    // Get user session to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    console.log(`🔍 Processing query for user ${user.id}: "${sanitizedQuestion}"`);

    // Check daily query limit using Supabase function
    const { data: canQuery, error: limitError } = await supabase
      .rpc('can_make_query', { target_user_id: user.id });

    if (limitError) {
      console.error('Error checking query limit:', limitError);
      return res.status(500).json({
        success: false,
        error: 'Unable to verify query limit'
      });
    }

    if (!canQuery) {
      // Get current count for user feedback
      const { data: dailyCount } = await supabase
        .rpc('get_daily_query_count', { target_user_id: user.id });

      return res.status(429).json({
        success: false,
        error: `Daily query limit reached (${dailyCount}/10). Try again tomorrow!`,
        dailyCount,
        maxQueries: 10
      });
    }

    // Check for Google AI API key
    const googleAIKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleAIKey) {
      console.error('Missing GOOGLE_AI_API_KEY environment variable');
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error'
      });
    }
    
    // 1. Embed the question (for future vector search - simplified for now)
    const embeddings = new GeminiEmbeddings(googleAIKey);
    
    // 2. For now, we'll use the question directly without vector search
    // In production, you'd search for similar documents here
    const context = "This is Ilan Klimberg's resume information. He is a data scientist and software engineer with experience in machine learning, web development, and blockchain technology.";
    
    // 3. Generate response using Gemini
    const genAI = new GoogleGenerativeAI(googleAIKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI assistant helping to answer questions about Ilan Klimberg's resume and experience. 

Context: ${context}

Question: ${sanitizedQuestion}

Please provide a helpful, accurate answer based on the context above. Be conversational and professional. If the context doesn't contain enough information to fully answer the question, acknowledge what you can answer and suggest reaching out to Ilan directly.

Answer:`;
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // 4. Store the query and response in database
    const { error: logError } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        message: sanitizedQuestion,
        response: answer
      });
    
    if (logError) {
      console.error('Error logging chat:', logError);
      // Continue anyway - don't fail the request if logging fails
    }

    // Get updated query count for response
    const { data: updatedCount } = await supabase
      .rpc('get_daily_query_count', { target_user_id: user.id });
    
    // 5. Return response
    res.status(200).json({
      success: true,
      answer: answer,
      question: sanitizedQuestion,
      dailyCount: updatedCount || 0,
      maxQueries: 10,
      remainingQueries: Math.max(0, 10 - (updatedCount || 0))
    });
    
  } catch (error: any) {
    console.error('Query processing error:', error);
    
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction 
      ? 'An error occurred while processing your request. Please try again later.'
      : `Error: ${error.message}`;
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}