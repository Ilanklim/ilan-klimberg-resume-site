#!/usr/bin/env node

import { chunkResume, getResumeStats } from '../server/lib/resume-chunker.js';

console.log('🧪 Testing resume chunker...\n');

try {
  const chunks = chunkResume();
  const stats = getResumeStats();
  
  console.log('✅ Resume chunker working!');
  console.log(`📄 Total chunks: ${chunks.length}`);
  console.log(`🎓 Education entries: ${stats.educationCount}`);
  console.log(`💼 Experience entries: ${stats.experienceCount}`);
  console.log(`🏢 Organization entries: ${stats.organizationsCount}`);
  
  console.log('\n📋 Sample chunks:');
  chunks.slice(0, 3).forEach((chunk, index) => {
    console.log(`${index + 1}. ${chunk.metadata.type}: ${chunk.content.substring(0, 50)}...`);
  });
  
} catch (error) {
  console.error('❌ Resume chunker failed:', error.message);
  process.exit(1);
} 