# Ilan Klimberg - Resume Website

A modern, responsive resume website built with React, TypeScript, and Tailwind CSS, featuring an AI-powered smart search system.

## 🚀 Features

- **Modern UI**: Clean, responsive design with smooth animations
- **AI-Powered Search**: Ask questions about my experience using RAG (Retrieval-Augmented Generation)
- **Smart Highlighting**: Relevant sections are highlighted when you ask questions
- **Real-time Responses**: Powered by Google Gemini AI
- **Analytics**: Track popular questions and usage patterns
- **Mobile Optimized**: Works perfectly on all devices

## 🧠 AI Features

The website includes a sophisticated RAG system that allows visitors to ask questions about my experience:

- **Natural Language Queries**: "What's your blockchain experience?" or "Tell me about your internships"
- **Intelligent Responses**: AI generates contextual answers based on my resume
- **Source Attribution**: See which resume sections were used to answer your question
- **Section Highlighting**: Relevant parts of the resume are highlighted automatically

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **ShadCN/UI** for components
- **Radix UI** for accessible primitives

### Backend (RAG System)
- **Node.js** with Express
- **Google Gemini AI** for embeddings and LLM
- **Supabase** with pgvector for vector storage
- **LangChain** for RAG orchestration

### AI/ML
- **Gemini Embedding-001** for text embeddings
- **Gemini Pro** for answer generation
- **Vector Similarity Search** for document retrieval

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google AI API Key
- Supabase Account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ilan-klimberg-resume-site
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL setup from `RAG_SETUP_GUIDE.md`
   - Add your Supabase credentials to `.env`

4. **Initialize the RAG system**
   ```bash
   # Start the backend server
   npm run dev:server
   
   # In another terminal, initialize the RAG system
   npm run setup:rag
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see your AI-powered resume!

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
