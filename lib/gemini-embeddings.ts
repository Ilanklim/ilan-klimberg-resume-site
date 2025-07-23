import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiEmbeddings {
  private apiKey: string;
  private modelName: string;
  private client: GoogleGenerativeAI;

  constructor(apiKey: string, modelName = 'embedding-001') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      try {
        const model = this.client.getGenerativeModel({ model: this.modelName });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        embeddings.push(embedding);
      } catch (error) {
        console.error('Error embedding document:', error);
        throw error;
      }
    }
    
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error embedding query:', error);
      throw error;
    }
  }
}