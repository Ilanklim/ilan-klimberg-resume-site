#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const testQueries = [
  "What internships have you done?",
  "Tell me about your blockchain experience",
  "What's your experience with SQL?",
  "What companies have you worked for?",
  "What's your educational background?"
];

async function testRAG() {
  console.log('🧪 Testing RAG system...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }
    console.log('✅ Health check passed\n');
    
    // Test status endpoint
    console.log('2️⃣ Testing status endpoint...');
    const statusResponse = await fetch(`${API_BASE_URL}/api/setup/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log(`✅ Status: ${statusData.status.documentsCount} documents, ${statusData.status.chatsCount} chats`);
    } else {
      throw new Error('Status check failed');
    }
    console.log('');
    
    // Test queries
    console.log('3️⃣ Testing RAG queries...\n');
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`Query ${i + 1}: "${query}"`);
      
      const queryResponse = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });
      
      if (!queryResponse.ok) {
        throw new Error(`Query ${i + 1} failed: ${queryResponse.status}`);
      }
      
      const queryData = await queryResponse.json();
      
      if (queryData.success) {
        console.log(`✅ Answer: ${queryData.answer.substring(0, 100)}...`);
        console.log(`📄 Sources: ${queryData.relevantDocuments?.length || 0} documents\n`);
      } else {
        throw new Error(`Query ${i + 1} returned error: ${queryData.error}`);
      }
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test analytics
    console.log('4️⃣ Testing analytics endpoint...');
    const analyticsResponse = await fetch(`${API_BASE_URL}/api/query/analytics`);
    const analyticsData = await analyticsResponse.json();
    
    if (analyticsData.success) {
      console.log(`✅ Analytics: ${analyticsData.analytics.totalChats} total chats, ${analyticsData.analytics.totalDocuments} documents`);
    } else {
      throw new Error('Analytics check failed');
    }
    
    console.log('\n🎉 All tests passed! Your RAG system is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`   - Health: ✅`);
    console.log(`   - Status: ✅`);
    console.log(`   - Queries: ✅ (${testQueries.length} tested)`);
    console.log(`   - Analytics: ✅`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: npm run dev:server');
    console.log('2. Check your .env file has correct API keys');
    console.log('3. Verify the RAG system is initialized: npm run setup:rag');
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRAG();
}

export { testRAG }; 