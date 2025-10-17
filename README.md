# Ilan Klimberg - Portfolio Website

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS, featuring an AI-powered RAG (Retrieval-Augmented Generation) chatbot for interactive resume queries.

## Features

- **Interactive AI Chatbot**: Ask questions about my experience, skills, and background
- **Vector Search**: Powered by Gemini embeddings and Supabase vector database
- **Modern Stack**: React, TypeScript, Tailwind CSS, Vite
- **Responsive Design**: Optimized for all devices
- **SEO Optimized**: Structured data, meta tags, and sitemap

## Development Setup

### Prerequisites

- Node.js 18+ 
- Vercel CLI (for local development)
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google AI API Key (Get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Supabase Configuration (Get from your Supabase project settings)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Enable detailed logging
DEBUG=true
```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

3. **Run with Vercel Dev (Recommended):**
   ```bash
   vercel dev
   ```
   This starts both the frontend and API routes in development mode.

4. **Alternative - Frontend only:**
   ```bash
   npm run dev
   ```
   Note: API routes won't work without Vercel Dev.

### API Endpoints

The application provides several API endpoints:

- `GET /api/health` - Health check endpoint
- `POST /api/query` - Process chatbot queries using RAG
- `POST /api/setup` - Initialize the RAG system and embed resume data
- `GET /api/setup` - Check RAG system status
- `GET /api/analytics` - Get chat analytics and statistics

### Database Setup

The application automatically sets up the required Supabase tables and vector functions when you first run the setup endpoint. Make sure your Supabase project has the pgvector extension enabled.

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # ShadCN UI components
│   │   └── smart-search-bar.tsx  # AI search component
│   ├── pages/              # Page components
│   └── ...
├── server/                 # Backend RAG system
│   ├── lib/                # Utilities and configurations
│   │   ├── gemini-embeddings.js  # Custom Gemini embeddings
│   │   ├── supabase.js     # Database configuration
│   │   └── resume-chunker.js     # Resume chunking logic
│   ├── routes/             # API routes
│   │   ├── query.js        # Main RAG query endpoint
│   │   └── setup.js        # System initialization
│   └── index.js            # Express server
├── resumeData.json         # Resume data in JSON format
├── RAG_SETUP_GUIDE.md     # Detailed setup instructions
└── scripts/
    └── setup-rag.js        # Automated setup script
```

## 🔧 API Endpoints

### RAG Query
- `POST /api/query` - Ask questions about the resume
- `GET /api/query/analytics` - Get usage analytics

### System Management
- `POST /api/setup/init` - Initialize the RAG system
- `GET /api/setup/status` - Check system status
- `GET /api/health` - Health check

## 🎯 Example Queries

Try asking the AI these questions:

- "What internships have you done?"
- "Tell me about your blockchain experience"
- "What's your experience with SQL?"
- "What companies have you worked for?"
- "What's your educational background?"
- "Tell me about your projects"

## 📊 Analytics

The system automatically tracks:
- Questions asked
- Answers generated
- Relevant documents used
- Usage patterns

Access analytics at `/api/query/analytics`

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to connect to AI service"**
   - Check your `GOOGLE_AI_API_KEY` in `.env`
   - Verify the API key has access to Gemini models

2. **"Vector search error"**
   - Ensure pgvector extension is enabled in Supabase
   - Run the SQL setup from the guide

3. **CORS errors**
   - Check `FRONTEND_URL` in your `.env` file
   - Verify the server is running on the correct port

### Debug Mode

Enable detailed logging by setting `DEBUG=true` in your `.env` file.

## 🔒 Security

- All API keys are stored in environment variables
- CORS is properly configured
- Input validation on all endpoints
- Rate limiting recommended for production

## 📈 Production Deployment

### Backend (Vercel)
1. Deploy the `server/` directory as serverless functions
2. Set production environment variables
3. Configure CORS for your domain

### Frontend (Vercel/Netlify)
1. Build with `npm run build`
2. Deploy the `dist/` folder
3. Set `VITE_API_URL` to your backend URL

### Database (Supabase)
- Use production Supabase instance
- Enable row-level security if needed
- Monitor usage and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

- **Email**: idk7@cornell.edu
- **LinkedIn**: [Ilan Klimberg](https://www.linkedin.com/in/ilanklimberg/)
- **GitHub**: [@Ilanklim](https://github.com/Ilanklim)

---

**🎉 Built with modern web technologies and powered by AI!**
