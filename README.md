# Ilan Klimberg Resume RAG System

A production-ready RAG (Retrieval-Augmented Generation) Q&A system for my personal resume site, built with Vercel Serverless Functions, Google Gemini AI, and Supabase PostgreSQL with pgvector.

## 🚀 Features

- **RAG Q&A System**: Ask questions about my resume and get AI-powered answers
- **Vector Search**: Semantic search using Google Gemini embeddings (768 dimensions)
- **Rate Limiting**: Per-user daily query limits with Supabase RLS
- **Streaming Support**: Server-Sent Events (SSE) for real-time responses
- **CORS Protection**: Whitelisted origins for security
- **TypeScript**: Fully typed with Zod validation
- **Testing**: Comprehensive test suite with Vitest

## 🏗️ Architecture

- **Frontend**: React + Vite (existing)
- **Backend**: Vercel Serverless Functions (`/api/*.ts`)
- **AI Models**: 
  - LLM: Google Gemini 1.5 Flash
  - Embeddings: Google Gemini text-embedding-004
- **Vector Database**: Supabase PostgreSQL with pgvector extension
- **Authentication**: Supabase anonymous auth with JWT validation

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account with PostgreSQL database
- Google AI API key
- Vercel account (for deployment)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Google AI API Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# CORS Configuration
CORS_ALLOW_ORIGINS=https://ilanklimberg.com,http://localhost:8080

# Rate Limiting
DAILY_QUERY_CAP=10
```

### 3. Database Setup

Since you're using Supabase directly, run the following SQL in your Supabase SQL editor:

```sql
-- Enable required extensions
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Documents table for storing resume chunks with 768-dimensional embeddings
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(768) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- HNSW index for fast similarity search
create index if not exists documents_embedding_hnsw
  on public.documents using hnsw (embedding vector_cosine_ops);

-- Rate limit tracking table
create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now()
);

-- Index for efficient rate limit queries
create index if not exists queries_user_created_idx
  on public.queries (user_id, created_at);

-- Daily cap enforcement function
create or replace function public.enforce_daily_cap_for_caller(p_cap int default 10)
returns void language plpgsql security definer as $$
declare today_count int; caller uuid;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select count(*) into today_count
  from public.queries
  where user_id = caller
    and created_at::date = now()::date;

  if today_count >= p_cap then
    raise exception 'DAILY_CAP_REACHED';
  end if;

  insert into public.queries(user_id) values (caller);
end;
$$;

-- Enable Row Level Security
alter table public.queries enable row level security;

-- RLS policies
create policy queries_owner_read
  on public.queries for select using (auth.uid() = user_id);

create policy queries_owner_insert
  on public.queries for insert with check (auth.uid() = user_id);

-- Similarity search function for 768-dimensional vectors
create or replace function public.match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 4. Ingest Resume Data

Place your `resumeData.json` file in the project root, then run:

```bash
npm run ingest
```

This will:
- Load and validate your resume data
- Chunk it into sections (About, Education, Experience, Projects, Skills, Organizations)
- Generate embeddings for each chunk
- Store everything in the vector database

### 5. Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint
```

## 🚀 Usage

### API Endpoint

**POST** `/api/rag-query`

#### Headers
```
Authorization: Bearer <SUPABASE_JWT>
Content-Type: application/json
```

#### Request Body
```json
{
  "query": "What are my core strengths?",
  "stream": false
}
```

#### Response (JSON)
```json
{
  "answer": "Based on your resume, your core strengths include...",
  "retrieve_ms": 150,
  "llm_ms": 800,
  "total_ms": 950
}
```

#### Streaming Response (SSE)
```
data: Based on your resume
data: , your core strengths include
data: product management, blockchain expertise
data: [DONE]
```

### Example cURL Commands

#### JSON Response
```bash
curl -X POST http://localhost:3000/api/rag-query \
  -H "content-type: application/json" \
  -H "authorization: Bearer <SUPABASE_JWT>" \
  -d '{"query":"Summarize my experience for a recruiter."}'
```

#### Streaming Response
```bash
curl -N -X POST http://localhost:3000/api/rag-query \
  -H "content-type: application/json" \
  -H "authorization: Bearer <SUPABASE_JWT>" \
  -d '{"query":"What are my core strengths?","stream":true}'
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test tests/unit/chunking.test.ts
```

## 📁 Project Structure

```
├── api/
│   └── rag-query.ts          # Main RAG API endpoint
├── src/
│   ├── lib/
│   │   ├── env.ts            # Environment validation
│   │   ├── cors.ts           # CORS handling
│   │   ├── chunking.ts       # Resume data chunking
│   │   ├── embeddings/       # Gemini embeddings
│   │   ├── llm/             # Gemini LLM
│   │   └── vectordb/        # Vector database interfaces
│   ├── ingest/              # Data ingestion CLI
│   └── rag.ts               # RAG prompt assembly
├── tests/                   # Test suite
├── resumeData.json          # Your resume data
└── package.json
```

## 🔒 Security Features

- **CORS Protection**: Only allows specified origins
- **Rate Limiting**: Per-user daily query caps
- **Authentication**: JWT validation via Supabase
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries

## 📊 Performance

- **Embeddings**: 768-dimensional vectors for semantic search
- **Context Limit**: ~2400 tokens for retrieved context
- **Output Limit**: ~350 tokens for LLM responses
- **Search**: Top-6 results with 0.7 similarity threshold
- **Connection Pooling**: Optimized for serverless environment

## 🚀 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

Ensure all required environment variables are set in your deployment platform.

## 🐛 Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**: Check your daily query cap setting
2. **CORS Errors**: Verify your origin is in the allowlist
3. **Authentication Failed**: Ensure valid Supabase JWT token

### Logs

Check Vercel function logs for detailed error information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.