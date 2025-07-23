import { GeminiEmbeddings } from './gemini-embeddings';
import { supabase } from './supabase';

export interface RAGResult {
  answer: string;
  relevantDocuments: Array<{
    content: string;
    metadata: any;
  }>;
  question: string;
}

export class RAGService {
  private embeddings: GeminiEmbeddings;

  constructor(apiKey: string) {
    this.embeddings = new GeminiEmbeddings(apiKey);
  }

  async search(query: string, threshold = 0.3, maxResults = 5) {
    // Embed the query
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    // Search for similar documents
    const { data: similarDocs, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: maxResults
    });

    if (error) {
      throw new Error(`Vector search failed: ${error.message}`);
    }

    return similarDocs || [];
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    // This would typically use a language model
    // For now, returning a simple response
    return `Based on the available information: ${context}`;
  }

  async query(question: string): Promise<RAGResult> {
    const similarDocs = await this.search(question);
    
    if (similarDocs.length === 0) {
      return {
        answer: "I don't have specific information about that in my resume. Please feel free to reach out to me directly for more details!",
        relevantDocuments: [],
        question
      };
    }

    const context = similarDocs.map(doc => doc.content).join('\n\n');
    const answer = await this.generateAnswer(question, context);

    return {
      answer,
      relevantDocuments: similarDocs.map(doc => ({
        content: doc.content,
        metadata: doc.metadata
      })),
      question
    };
  }
}