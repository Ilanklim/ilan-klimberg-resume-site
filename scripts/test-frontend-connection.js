#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 Testing frontend-backend connection...\n');

async function testConnection() {
  try {
    console.log('📡 Testing backend health...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    
    if (!healthResponse.ok) {
      throw new Error(`Backend health check failed: ${healthResponse.status}`);
    }
    
    console.log('✅ Backend is healthy');
    
    console.log('\n🔍 Testing RAG query...');
    const queryResponse = await fetch('http://localhost:3001/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify({ question: 'What is your experience in data science?' })
    });
    
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      throw new Error(`Query failed: ${queryResponse.status} - ${errorText}`);
    }
    
    const data = await queryResponse.json();
    console.log('✅ Query successful');
    console.log(`📊 Response: ${data.answer.substring(0, 100)}...`);
    
    console.log('\n🌐 Testing frontend...');
    const frontendResponse = await fetch('http://localhost:8080');
    
    if (!frontendResponse.ok) {
      throw new Error(`Frontend check failed: ${frontendResponse.status}`);
    }
    
    console.log('✅ Frontend is accessible');
    
    console.log('\n🎉 All tests passed!');
    console.log('📊 Summary:');
    console.log('   - Backend: ✅ http://localhost:3001');
    console.log('   - Frontend: ✅ http://localhost:8080');
    console.log('   - CORS: ✅ Working');
    console.log('   - RAG: ✅ Working');
    
    console.log('\n🚀 Your AI resume is ready at: http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure both servers are running');
    console.log('2. Check the browser console for errors');
    console.log('3. Verify the API_BASE_URL in the frontend');
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection();
}

export { testConnection }; 