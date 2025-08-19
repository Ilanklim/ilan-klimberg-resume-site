#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import { loadResumeData, validateResumeData } from './loaders.js';
import { chunkResumeData, hashContent } from '../lib/chunking.js';
import { GeminiEmbeddings } from '../lib/embeddings/index.js';
import { PgVectorDB } from '../lib/vectordb/pgvector.js';
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
    
    // Initialize embeddings and vector DB
    console.log('🔧 Initializing Gemini embeddings...');
    const embeddings = new GeminiEmbeddings();
    
    console.log('🗄️  Connecting to PostgreSQL vector database...');
    const vectorDB = new PgVectorDB();
    
    // Generate embeddings for each chunk
    console.log('🧠 Generating embeddings for chunks...');
    const documents: Document[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  Processing chunk ${i + 1}/${chunks.length}: ${chunk.section}`);
      
      const embedding = await embeddings.embedText(chunk.content);
      const contentHash = hashContent(chunk.content);
      
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
    
    // Store documents in vector database
    console.log('💾 Storing documents in vector database...');
    await vectorDB.upsert(documents);
    console.log(`✅ Successfully stored ${documents.length} documents`);
    
    // Cleanup
    await vectorDB.close();
    console.log('🧹 Cleanup completed');
    
    console.log('🎉 Resume data ingestion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total chunks: ${chunks.length}`);
    console.log(`   - Sections: ${chunks.map(c => c.section).join(', ')}`);
    console.log(`   - Documents stored: ${documents.length}`);
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
