#!/usr/bin/env node

import { supabase } from '../server/lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Supabase connection...\n');

async function testSupabase() {
  try {
    console.log('📡 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      
      if (error.message.includes('relation "documents" does not exist')) {
        console.log('\n🔧 The documents table doesn\'t exist. You need to run the SQL setup in Supabase.');
        console.log('\n📋 Go to your Supabase SQL Editor and run:');
        console.log(`
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the chats table for analytics
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  relevant_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the vector similarity function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
        `);
      }
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Test vector extension
    console.log('\n🔍 Testing pgvector extension...');
    const { data: vectorData, error: vectorError } = await supabase.rpc('match_documents', {
      query_embedding: new Array(768).fill(0.1),
      match_threshold: 0.1,
      match_count: 1
    });
    
    if (vectorError) {
      console.error('❌ Vector search error:', vectorError.message);
      console.log('\n🔧 The pgvector extension or match_documents function is not set up.');
    } else {
      console.log('✅ Vector search working!');
    }
    
    // Check document count
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', countError.message);
    } else {
      console.log(`📊 Documents in database: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabase();
}

export { testSupabase }; 