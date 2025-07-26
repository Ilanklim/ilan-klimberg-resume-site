# Ilan Klimberg's AI-Powered Resume

A modern, interactive resume website with AI-powered search capabilities, built with React, TypeScript, Tailwind CSS, and deployed on Vercel with Supabase backend.

## 🚀 Features

- **AI-Powered Search**: Ask questions about experience, skills, and background using natural language
- **Vector Search**: Uses Google Gemini embeddings for semantic document similarity
- **Authentication**: Secure user authentication with Supabase Auth
- **Row Level Security**: Properly secured database with RLS policies
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Real-time Updates**: Live chat functionality with conversation history
- **Input Validation**: Comprehensive validation and sanitization using Zod
- **Rate Limiting**: Protection against abuse with request throttling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Functions (Node.js), Supabase
- **Database**: PostgreSQL with pgvector extension
- **AI**: Google Gemini API for embeddings and chat completion
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Validation**: Zod for schema validation

## 🔧 Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google AI API Key (Get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration (Get from your Supabase project settings)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Enable detailed logging
DEBUG=true
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   The database tables and RLS policies are automatically created via Supabase migrations.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start with Vercel CLI (Recommended)**
   For the most accurate local development environment:
   ```bash
   # Install Vercel CLI globally
   npm install -g vercel

   # Start development server
   vercel dev
   ```

The application will be available at `http://localhost:3000` (Vercel) or `http://localhost:5173` (Vite).

## 🏗️ Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── health.ts          # Health check endpoint
│   ├── query.ts           # AI query processing
│   ├── setup.ts           # Database setup and content embedding
│   └── analytics.ts       # Usage analytics
├── lib/                   # Shared utilities
│   ├── supabase.ts        # Supabase client and database functions
│   ├── gemini-embeddings.ts # Google AI embeddings wrapper
│   ├── resume-chunker.ts  # Resume content chunking logic
│   ├── langchain.ts       # RAG service implementation
│   └── validation.ts      # Zod validation schemas
├── src/
│   ├── components/        # React components
│   ├── pages/            # Application pages
│   ├── lib/              # Frontend utilities
│   └── integrations/     # Supabase integration
├── resumeData.json       # Resume content data
└── supabase/            # Supabase configuration
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables protected with RLS policies
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: API endpoint protection against abuse
- **Content Sanitization**: XSS protection for user inputs
- **Authentication Required**: Secure endpoints require valid authentication
- **Environment Variables**: Sensitive data stored securely

## 📡 API Endpoints

### `/api/health`
- **Method**: GET
- **Description**: Health check endpoint
- **Response**: Server status and timestamp

### `/api/query`
- **Method**: POST
- **Description**: Process AI queries about resume content
- **Body**: `{ "question": "string" }`
- **Features**: Rate limiting, input validation, vector search
- **Response**: AI-generated answer with relevant document excerpts

### `/api/setup`
- **Method**: POST
- **Description**: Initialize database and embed resume content
- **Authentication**: Required (admin only)
- **Body**: `{ "content": "string" }`

### `/api/analytics`
- **Method**: GET
- **Description**: Get usage analytics and chat history
- **Authentication**: Required
- **Response**: Chat statistics and recent conversations

## 🚀 Deployment

The application is configured for seamless deployment on Vercel:

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Environment Variables**
   Set the following in your Vercel dashboard:
   - `GOOGLE_AI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. **Automatic Deployments**
   Vercel will automatically deploy on every push to the main branch.

## 🔧 Configuration

### Database Setup
The application automatically sets up the required database tables:
- `documents`: Stores resume content with vector embeddings
- `chats`: Stores user conversations and analytics
- `profiles`: User profile information

### Authentication Setup
1. Enable email authentication in Supabase
2. Configure email templates (optional)
3. Set up redirect URLs in Supabase dashboard

### AI Service Setup
1. Get Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the key to your environment variables
3. The application uses Gemini 1.5 Flash for chat and embedding-001 for vectors

## 🎨 Customization

### Resume Content
Update `resumeData.json` with your own resume information. The format includes:
- Personal information
- Work experience
- Projects
- Education
- Skills
- Interests

### Styling
The application uses Tailwind CSS with a custom design system defined in `src/index.css` and `tailwind.config.ts`.

### AI Behavior
Modify the system prompt in `api/query.ts` to customize how the AI responds to questions.

## 🐛 Troubleshooting

### Common Issues

1. **API Routes Not Working**
   - Ensure you're using `vercel dev` for local development
   - Check that environment variables are properly set

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies in Supabase dashboard

3. **AI Queries Failing**
   - Confirm Google AI API key is valid
   - Check API quotas and rate limits

4. **Authentication Problems**
   - Set correct redirect URLs in Supabase dashboard
   - Verify email confirmation settings

### Logs and Debugging
- Check Vercel function logs in the dashboard
- Use browser dev tools for frontend debugging
- Enable `DEBUG=true` for detailed logging

## 🔒 Security Measures Implemented

✅ **Emergency Database Security**
- RLS enabled on all tables (documents, chats, profiles)
- Default-deny policies implemented
- User-scoped access controls

✅ **Authentication System**
- Supabase email/password authentication
- User profiles with role-based access
- Automatic profile creation on signup

✅ **Input Validation & Security**
- Zod schema validation on all inputs
- XSS protection with content sanitization
- Rate limiting (10 requests/minute per IP)
- Request timeout handling

✅ **API Security**
- CORS headers properly configured
- Error messages sanitized in production
- Environment variables secured
- Function search paths secured

✅ **Database Hardening**
- Security definer functions with proper search paths
- Admin-only document access
- User-scoped chat access

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, TypeScript, Tailwind CSS, Supabase, and Vercel.