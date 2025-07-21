#!/usr/bin/env node

import { GeminiEmbeddings } from '../server/lib/gemini-embeddings.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Gemini embeddings...\n');

async function testEmbeddings() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not found in environment variables');
    }
    
    console.log('✅ API key found');
    
    const embeddings = new GeminiEmbeddings(apiKey);
    console.log('✅ Embeddings instance created');
    
    // Test single query embedding
    const testText = "What is your experience with blockchain?";
    console.log(`📝 Testing query: "${testText}"`);
    
    const queryEmbedding = await embeddings.embedQuery(testText);
    console.log(`✅ Query embedding created (${queryEmbedding?.length || 'unknown'} dimensions)`);
    console.log(`📊 Embedding type: ${typeof queryEmbedding}, isArray: ${Array.isArray(queryEmbedding)}`);
    if (queryEmbedding && queryEmbedding.length > 0) {
      console.log(`📊 First few values: ${queryEmbedding.slice(0, 5).join(', ')}`);
    }
    
    // Test multiple document embeddings
    const testDocs = [
      "I have experience with blockchain technology.",
      "I worked on cryptocurrency projects.",
      "I have SQL and data analytics skills."
    ];
    
    console.log(`📄 Testing ${testDocs.length} documents...`);
    const docEmbeddings = await embeddings.embedDocuments(testDocs);
    console.log(`✅ Document embeddings created (${docEmbeddings.length} documents)`);
    
    console.log('\n🎉 All embedding tests passed!');
    console.log('📊 Summary:');
    console.log(`   - Query embedding: ✅ (${queryEmbedding.length} dimensions)`);
    console.log(`   - Document embeddings: ✅ (${docEmbeddings.length} documents)`);
    
  } catch (error) {
    console.error('❌ Embedding test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your GOOGLE_AI_API_KEY in .env file');
    console.log('2. Make sure the API key has access to Gemini models');
    console.log('3. Verify your internet connection');
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmbeddings();
}

export { testEmbeddings }; 