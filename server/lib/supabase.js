import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema setup
export async function setupDatabase() {
  console.log('🔧 Setting up database schema...');
  
  // Enable pgvector extension
  const { error: vectorError } = await supabase.rpc('create_extension_if_not_exists', {
    extension_name: 'vector'
  });
  
  if (vectorError) {
    console.log('pgvector extension already exists or error:', vectorError.message);
  }

  // Create documents table
  const { error: documentsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(768),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (documentsError) {
    console.log('Documents table error:', documentsError.message);
  }

  // Create chats table for analytics
  const { error: chatsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chats (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        relevant_documents JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (chatsError) {
    console.log('Chats table error:', chatsError.message);
  }

  console.log('✅ Database schema setup complete');
} 