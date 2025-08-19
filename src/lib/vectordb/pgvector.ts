import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';
import type { Document, SearchResult, VectorDB } from './index.js';

export class PgVectorDB implements VectorDB {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }

  async upsert(documents: Document[]): Promise<void> {
    if (documents.length === 0) return;

    for (const doc of documents) {
      const { error } = await this.supabase
        .from('documents')
        .upsert({
          id: doc.id,
          content: doc.content,
          embedding: Array.from(doc.embedding),
          metadata: doc.metadata,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error upserting document:', error);
        throw new Error(`Failed to upsert document: ${error.message}`);
      }
    }
  }

  async similaritySearchByFn(
    queryEmbedding: Float32Array,
    threshold: number,
    k: number
  ): Promise<SearchResult[]> {
    const embeddingArray = Array.from(queryEmbedding);
    
    // Call the match_documents function via Supabase RPC
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: embeddingArray,
      match_threshold: threshold,
      match_count: k
    });

    if (error) {
      console.error('Error calling match_documents:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((row: any) => ({
      content: row.content,
      metadata: row.metadata,
      similarity: row.similarity,
    }));
  }

  async close(): Promise<void> {
    // No need to close Supabase client
  }
}
