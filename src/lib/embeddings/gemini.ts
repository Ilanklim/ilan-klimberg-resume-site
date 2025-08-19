import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env.js';

export class GeminiEmbeddings {
  private genAI: GoogleGenerativeAI;
  private model: string = 'text-embedding-004';

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
  }

  async embedText(text: string): Promise<Float32Array> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.embedContent(text);
      const embedding = await result.embedding;
      
      // Convert to Float32Array with 1536 dimensions
      const values = embedding.values;
      if (values.length !== 1536) {
        throw new Error(`Expected 1536 dimensions, got ${values.length}`);
      }
      
      return new Float32Array(values);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    const embeddings: Float32Array[] = [];
    
    for (const text of texts) {
      const embedding = await this.embedText(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}
