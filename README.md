# 🔍 Anonymous AI Search App

A modern, secure web application with anonymous authentication and rate-limited AI search capabilities. Built with React 18, TypeScript, Tailwind CSS, Supabase, and deployed on Vercel.

## ✨ Features

- **🔐 Anonymous Authentication**: Automatic anonymous user creation with Supabase - no signup required
- **🤖 AI-Powered Search**: Ask questions and get intelligent responses using Google Gemini AI
- **📊 Rate Limiting**: 10 queries per day per anonymous user with secure tracking
- **🛡️ Row Level Security**: All user data is isolated using Supabase RLS policies
- **⚡ Real-time Updates**: Live query count tracking and instant feedback
- **🎨 Beautiful UI**: Clean, responsive design with loading states and error handling
- **🔒 Enterprise Security**: Input validation, XSS protection, and secure API handling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Functions (Node.js)
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: Google Gemini API
- **Authentication**: Supabase Anonymous Auth
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI API key

### Environment Variables

Create a `.env` file:

```env
# Google AI API Key (Get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration (Get from your Supabase project settings)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Installation

```bash
# Clone and install
git clone <repository-url>
cd ai-search-app
npm install

# Start development server
npm run dev

# Or use Vercel CLI (recommended)
vercel dev
```

## 🏗️ Architecture

### Database Schema

```sql
-- Chats table for storing user queries
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security policies
CREATE POLICY "Users can view their own chats"
ON public.chats FOR SELECT TO anon, authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
ON public.chats FOR INSERT TO anon, authenticated
WITH CHECK (auth.uid() = user_id);
```

### Rate Limiting Functions

```sql
-- Check if user can make another query
CREATE FUNCTION public.can_make_query(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.chats
    WHERE user_id = target_user_id
    AND created_at >= CURRENT_DATE
  ) < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📡 API Endpoints

### `/api/query` (POST)

Process AI queries with rate limiting and user authentication.

**Headers:**
```
Authorization: Bearer <anonymous_session_token>
Content-Type: application/json
```

**Body:**
```json
{
  "question": "What is your experience in data science?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Based on my experience...",
  "question": "What is your experience in data science?",
  "dailyCount": 1,
  "maxQueries": 10,
  "remainingQueries": 9
}
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "Daily query limit reached (10/10). Try again tomorrow!",
  "dailyCount": 10,
  "maxQueries": 10
}
```

## 🔒 Security Features

### Anonymous Authentication
- Automatic anonymous user creation on app load
- Secure session management with Supabase
- No login/signup UI required

### Row Level Security (RLS)
```sql
-- Users can only access their own chat records
CREATE POLICY "Users can view their own chats"
ON public.chats FOR SELECT TO anon, authenticated
USING (auth.uid() = user_id);
```

### Input Validation & Sanitization
```typescript
// Zod schema validation
const querySchema = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question too long (max 500 characters)')
    .trim()
});

// XSS protection
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}
```

### Rate Limiting
- 10 queries per day per anonymous user
- Database-enforced limits using PostgreSQL functions
- Real-time query count tracking
- Graceful error handling when limit reached

## 🎨 Frontend Components

### AnonymousSearchBar
The main search interface with:
- Automatic anonymous authentication
- Real-time query count display
- Loading states and error handling
- Input validation and sanitization
- Responsive design

```typescript
// Automatic anonymous auth initialization
useEffect(() => {
  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      // Handle auth...
    }
  };
  
  initializeAuth();
}, []);
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Environment Variables**
   Set in Vercel dashboard:
   - `GOOGLE_AI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. **Supabase Configuration**
   - Enable anonymous authentication
   - Configure RLS policies
   - Set up rate limiting functions

### Supabase Setup

1. **Enable Anonymous Auth**
   ```bash
   # In Supabase dashboard > Authentication > Settings
   Enable "Allow anonymous sign-ins"
   ```

2. **Run Database Migrations**
   ```sql
   -- Create chats table and RLS policies
   -- (See Architecture section above)
   ```

## 🔧 Configuration

### Anonymous Authentication Setup
```typescript
// Supabase client configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Rate Limiting Configuration
```typescript
// Configurable limits
const DAILY_QUERY_LIMIT = 10;
const MAX_QUESTION_LENGTH = 500;
```

## 🐛 Troubleshooting

### Common Issues

1. **Anonymous Auth Not Working**
   - Verify anonymous authentication is enabled in Supabase
   - Check `SUPABASE_ANON_KEY` is correct
   - Ensure RLS policies allow anonymous users

2. **Rate Limiting Issues**
   - Verify database functions are created correctly
   - Check RLS policies for function access
   - Ensure user sessions are properly maintained

3. **AI Queries Failing**
   - Verify `GOOGLE_AI_API_KEY` is valid
   - Check API quotas and rate limits
   - Ensure network connectivity

### Debug Mode
```env
DEBUG=true
NODE_ENV=development
```

## 📊 Analytics & Monitoring

Track user engagement with built-in analytics:
- Daily query counts per user
- Popular questions and responses
- Error rates and patterns
- Authentication success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Vercel Documentation](https://vercel.com/docs)

---

**🎉 Ready to deploy! Anonymous authentication + AI search with enterprise-level security.**