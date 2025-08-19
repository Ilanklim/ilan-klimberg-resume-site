# 🚀 RAG System Setup Guide

This guide will walk you through setting up a complete RAG (Retrieval-Augmented Generation) system for your resume website using Gemini AI and Supabase.

## 📋 Prerequisites

1. **Google AI API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Supabase Account** - Create at [supabase.com](https://supabase.com)
3. **Node.js** (v18+) and npm/yarn

## 🛠️ Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Fill in your environment variables:

```env
# Google AI API Key (Get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration (Get from your Supabase project settings)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here


# Optional: Enable detailed logging
DEBUG=true
```

### 3. Supabase Setup

#### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### 3.2 Enable pgvector Extension
In your Supabase SQL editor, run:

```sql
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
```

Your RAG-powered resume website is now running at `http://localhost:5173`!

## 🔧 API Endpoints

### Query Endpoint
- **POST** `/api/query`
- **Body**: `{ "question": "What is your experience with blockchain?" }`
- **Response**: `{ "success": true, "answer": "...", "relevantDocuments": [...] }`

### Setup Endpoints
- **POST** `/api/setup/init` - Initialize the RAG system
- **GET** `/api/setup/status` - Check system status

### Analytics Endpoint
- **GET** `/api/query/analytics` - Get chat analytics

## 🧠 How It Works

1. **Resume Chunking**: Your `resumeData.json` is automatically chunked into meaningful sections
2. **Embedding**: Each chunk is embedded using Gemini's `embedding-001` model
3. **Vector Storage**: Embeddings are stored in Supabase with pgvector
4. **Query Processing**: 
   - User question is embedded
   - Similar documents are retrieved using vector similarity
   - Context is passed to Gemini Pro for answer generation
5. **Analytics**: All queries are logged for insights

## 📊 Features

- ✅ **Smart Search**: Ask questions about your experience
- ✅ **Source Attribution**: See which resume sections were used
- ✅ **Section Highlighting**: Relevant sections are highlighted on the page
- ✅ **Analytics**: Track popular questions and usage
- ✅ **Error Handling**: Graceful fallbacks for API issues
- ✅ **Real-time Responses**: No more hardcoded answers!

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to connect to AI service"**
   - Check your `GOOGLE_AI_API_KEY` is correct
   - Verify the API key has access to Gemini models

2. **"Vector search error"**
   - Ensure pgvector extension is enabled in Supabase
   - Check the `match_documents` function exists

3. **"No documents found"**
   - Run the setup initialization again
   - Check Supabase logs for embedding errors

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your `.env` file.

## 🔒 Security Notes

- Never commit your `.env` file
- Use environment variables for all secrets
- Consider rate limiting for production
- Monitor API usage to stay within free tiers

## 📈 Production Deployment

For production deployment:

1. **Vercel**: Deploy the backend as serverless functions
2. **Supabase**: Use production database
3. **Environment**: Set production environment variables
4. **Monitoring**: Add logging and analytics

## 🎯 Next Steps

- Add streaming responses
- Implement conversation history
- Add more sophisticated chunking strategies
- Create admin dashboard for analytics
- Add user feedback collection

---

**🎉 Congratulations!** Your resume now has AI-powered intelligence! 