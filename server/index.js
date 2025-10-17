import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { queryRouter } from './routes/query.js';
import { setupRouter } from './routes/setup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/query', queryRouter);
app.use('/api/setup', setupRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 RAG Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Query endpoint: http://localhost:${PORT}/api/query`);
}); 