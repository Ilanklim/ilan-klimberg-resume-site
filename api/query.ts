import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEmbeddings } from '../lib/gemini-embeddings';
import { supabase } from '../lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
    const embeddings = new GeminiEmbeddings(process.env.GOOGLE_AI_API_KEY!);
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
}