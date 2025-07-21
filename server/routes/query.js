import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEmbeddings } from '../lib/gemini-embeddings.js';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }
    
    console.log(`🔍 Processing query: "${question}"`);
    
    // 1. Embed the question
    const embeddings = new GeminiEmbeddings(process.env.GOOGLE_AI_API_KEY);
    const questionEmbedding = await embeddings.embedQuery(question);
    console.log(`📊 Question embedding created (${questionEmbedding.length} dimensions)`);
    
    // 2. Find similar documents using vector similarity
    const { data: similarDocs, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: questionEmbedding,
      match_threshold: 0.3, // Lower threshold to get more matches
      match_count: 5
    });
    
    if (searchError) {
      console.error('Vector search error:', searchError);
      throw new Error('Failed to search documents');
    }
    
    console.log(`🔍 Vector search completed. Found ${similarDocs?.length || 0} similar documents`);
    
    if (!similarDocs || similarDocs.length === 0) {
      return res.json({
        success: true,
        answer: "I don't have specific information about that in my resume. Please feel free to reach out to me directly for more details!",
        relevantDocuments: [],
        question: question
      });
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
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    // 5. Log the interaction
    const { error: logError } = await supabase
      .from('chats')
      .insert({
        question: question,
        answer: answer,
        relevant_documents: similarDocs.map(doc => ({
          content: doc.content.substring(0, 200) + '...',
          metadata: doc.metadata
        }))
      });
    
    if (logError) {
      console.error('Error logging chat:', logError);
    }
    
    // 6. Return response
    res.json({
      success: true,
      answer: answer,
      relevantDocuments: similarDocs.map(doc => ({
        content: doc.content,
        metadata: doc.metadata
      })),
      question: question
    });
    
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    // Get recent chats
    const { data: recentChats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (chatsError) {
      throw chatsError;
    }
    
    // Get total counts
    const { count: totalChats, error: countError } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    const { count: totalDocs, error: docsError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (docsError) {
      throw docsError;
    }
    
    res.json({
      success: true,
      analytics: {
        totalChats,
        totalDocuments: totalDocs,
        recentChats: recentChats || []
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as queryRouter }; 