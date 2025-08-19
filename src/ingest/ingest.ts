#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import { loadResumeData, validateResumeData } from './loaders.js';
import { chunkResumeData, hashContent } from '../lib/chunking.js';
import { GeminiEmbeddings } from '../lib/embeddings/index.js';
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env.js';
import type { Document } from '../lib/vectordb/index.js';

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      path: {
        type: 'string',
        short: 'p',
        default: './resumeData.json'
      },
      help: {
        type: 'boolean',
        short: 'h'
      }
    }
  });

  if (values.help) {
    console.log(`
Usage: npm run ingest [options]

Options:
  -p, --path <file>  Path to resume data JSON file (default: ./resumeData.json)
  -h, --help         Show this help message

Example:
  npm run ingest -- --path ./custom-resume.json
    `);
    process.exit(0);
  }

  try {
    console.log('🚀 Starting resume data ingestion...');
    
    // Load and validate resume data
    console.log(`📖 Loading resume data from: ${values.path}`);
    const resumeData = loadResumeData(values.path);
    validateResumeData(resumeData);
    console.log(`✅ Resume data loaded successfully for: ${resumeData.name}`);
    
    // Chunk the resume data
    console.log('✂️  Chunking resume data into sections...');
    const chunks = chunkResumeData(resumeData);
    console.log(`✅ Created ${chunks.length} chunks`);
    
    // Initialize embeddings with 768 dimensions
    console.log('🔧 Initializing Gemini embeddings (768-dim)...');
    const embeddings = new GeminiEmbeddings();
    
    // Initialize Supabase client with service role key for ingestion
    console.log('🗄️  Connecting to Supabase with service role key...');
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for ingestion');
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Generate embeddings for each chunk
    console.log('🧠 Generating 768-dimensional embeddings for chunks...');
    const documents: Document[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  Processing chunk ${i + 1}/${chunks.length}: ${chunk.section}`);
      
      const embedding = await embeddings.embedText(chunk.content);
      const contentHash = hashContent(chunk.content);
      
      // Verify embedding dimensions
      if (embedding.length !== 768) {
        throw new Error(`Expected 768 dimensions, got ${embedding.length} for chunk ${i + 1}`);
      }
      
      documents.push({
        id: contentHash,
        content: chunk.content,
        embedding,
        metadata: {
          section: chunk.section,
          title: chunk.title,
          tags: chunk.tags,
          originalIndex: i,
        }
      });
    }
    
    // Store documents in Supabase
    console.log('💾 Storing documents in Supabase...');
    
    for (const doc of documents) {
      const { error } = await supabase
        .from('documents')
        .upsert({
          id: doc.id,
          content: doc.content,
          embedding: Array.from(doc.embedding), // Convert Float32Array to regular array
          metadata: doc.metadata,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error upserting document:', error);
        throw new Error(`Failed to upsert document: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully stored ${documents.length} documents with 768-dim embeddings`);
    
    console.log('🎉 Resume data ingestion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total chunks: ${chunks.length}`);
    console.log(`   - Sections: ${chunks.map(c => c.section).join(', ')}`);
    console.log(`   - Documents stored: ${documents.length}`);
    console.log(`   - Embedding dimensions: 768`);
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}