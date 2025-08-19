import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env.js';

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamResponse {
  text: string;
  done: boolean;
}

export class GeminiLLM {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
  }

  async completeOnce(prompt: string, maxOutputTokens: number = 350): Promise<LLMResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0,
        }
      };
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *completeStream(prompt: string, maxOutputTokens: number = 350): AsyncGenerator<LLMStreamResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      });

      const result = await model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield {
            text,
            done: false
          };
        }
      }

      yield {
        text: '',
        done: true
      };
    } catch (error) {
      console.error('Error generating streaming completion:', error);
      throw new Error(`Failed to generate streaming completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
