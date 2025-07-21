#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function setupRAG() {
  console.log('🚀 Setting up RAG system...\n');
  
  try {
    // Check if server is running
    console.log('📡 Checking server status...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Server not responding (${healthResponse.status})`);
    }
    
    console.log('✅ Server is running\n');
    
    // Initialize the RAG system
    console.log('🔧 Initializing RAG system...');
    const initResponse = await fetch(`${API_BASE_URL}/api/setup/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Initialization failed (${initResponse.status})`);
    }
    
    const initData = await initResponse.json();
    
    if (initData.success) {
      console.log('✅ RAG system initialized successfully!');
      console.log(`📊 Documents inserted: ${initData.stats.documentsInserted}`);
      console.log(`📄 Total chunks: ${initData.stats.totalChunks}`);
      console.log(`🎓 Education entries: ${initData.stats.resumeStats.educationCount}`);
      console.log(`💼 Experience entries: ${initData.stats.resumeStats.experienceCount}`);
      console.log(`🏢 Organization entries: ${initData.stats.resumeStats.organizationsCount}`);
    } else {
      throw new Error(initData.error || 'Unknown initialization error');
    }
    
    // Check final status
    console.log('\n📊 Checking system status...');
    const statusResponse = await fetch(`${API_BASE_URL}/api/setup/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ System status:');
      console.log(`   Documents: ${statusData.status.documentsCount}`);
      console.log(`   Chats: ${statusData.status.chatsCount}`);
      console.log(`   Expected chunks: ${statusData.status.expectedChunks}`);
    }
    
    console.log('\n🎉 Setup complete! Your RAG system is ready to use.');
    console.log(`🌐 Frontend: http://localhost:5173`);
    console.log(`🔧 Backend: ${API_BASE_URL}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: npm run dev:server');
    console.log('2. Check your .env file has correct API keys');
    console.log('3. Verify Supabase is properly configured');
    process.exit(1);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupRAG();
}

export { setupRAG }; 