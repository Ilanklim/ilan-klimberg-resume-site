import express from 'express';
import { setupDatabase, supabase } from '../lib/supabase.js';
import { GeminiEmbeddings } from '../lib/gemini-embeddings.js';
import { chunkResume, getResumeStats } from '../lib/resume-chunker.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/init', async (req, res) => {
  try {
    console.log('🚀 Starting RAG system initialization...');
    
    // Setup database schema
    await setupDatabase();
    
    // Initialize embeddings
    const embeddings = new GeminiEmbeddings(process.env.GOOGLE_AI_API_KEY);
    
    // Chunk resume data
    const chunks = chunkResume();
    console.log(`📄 Created ${chunks.length} resume chunks`);
    
    // Clear existing documents
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy
    
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
          // Continue with other chunks
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
    
    const stats = getResumeStats();
    
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
});

router.get('/status', async (req, res) => {
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
    
    const stats = getResumeStats();
    
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
});

export { router as setupRouter }; 