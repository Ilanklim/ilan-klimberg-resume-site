import { NextApiRequest, NextApiResponse } from 'next';
import { setupDatabase, supabase } from '../lib/supabase';
import { GeminiEmbeddings } from '../lib/gemini-embeddings';
import { chunkResume, getResumeStats } from '../lib/resume-chunker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleInit(req, res);
  } else if (req.method === 'GET') {
    return handleStatus(req, res);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleInit(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🚀 Starting RAG system initialization...');
    
    // Setup database schema
    await setupDatabase();
    
    // Initialize embeddings
    const embeddings = new GeminiEmbeddings(process.env.GOOGLE_AI_API_KEY!);
    
    // Chunk resume data
    const chunks = await chunkResume();
    console.log(`📄 Created ${chunks.length} resume chunks`);
    
    // Clear existing documents
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.log('Error clearing documents:', deleteError.message);
    }
    
    // Embed and store chunks
    const documentsToInsert = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🔍 Embedding chunk ${i + 1}/${chunks.length}: ${chunk.content.substring(0, 50)}...`);
      
      try {
        const embedding = await embeddings.embedQuery(chunk.content);
        console.log(`✅ Chunk ${i + 1} embedded successfully (${embedding.length} dimensions)`);
        
        documentsToInsert.push({
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: embedding
        });
        
        // Add small delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error embedding chunk ${i + 1}:`, error.message);
      }
    }
    
    // Insert documents in batches
    const batchSize = 10;
    for (let i = 0; i < documentsToInsert.length; i += batchSize) {
      const batch = documentsToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('documents')
        .insert(batch);
      
      if (insertError) {
        console.error('Error inserting batch:', insertError);
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documentsToInsert.length / batchSize)}`);
      }
    }
    
    const stats = await getResumeStats();
    
    res.json({
      success: true,
      message: 'RAG system initialized successfully',
      stats: {
        documentsInserted: documentsToInsert.length,
        totalChunks: chunks.length,
        resumeStats: stats
      }
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handleStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check document count
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    // Check chat count
    const { count: chatCount, error: chatError } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });
    
    if (chatError) {
      throw chatError;
    }
    
    const stats = await getResumeStats();
    
    res.json({
      success: true,
      status: {
        documentsCount: count,
        chatsCount: chatCount,
        resumeStats: stats,
        expectedChunks: stats.totalChunks
      }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}