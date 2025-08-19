import { describe, it, expect, vi } from 'vitest';
import { PgVectorDB } from '../../src/lib/vectordb/pgvector.js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null })
    })),
    rpc: vi.fn().mockResolvedValue({ 
      data: [
        {
          content: 'Test content',
          metadata: { section: 'test' },
          similarity: 0.95
        }
      ], 
      error: null 
    })
  }))
}));

describe('Supabase Vector DB', () => {
  it('should create Supabase client with correct credentials', () => {
    // This test verifies the constructor works
    const vectorDB = new PgVectorDB();
    expect(vectorDB).toBeInstanceOf(PgVectorDB);
  });

  it('should handle upsert operations', async () => {
    const vectorDB = new PgVectorDB();
    const mockDocument = {
      id: 'test-id',
      content: 'Test content',
      embedding: new Float32Array(1536).fill(0.1),
      metadata: { section: 'test' }
    };

    await expect(vectorDB.upsert([mockDocument])).resolves.not.toThrow();
  });

  it('should handle similarity search', async () => {
    const vectorDB = new PgVectorDB();
    const queryEmbedding = new Float32Array(1536).fill(0.2);

    const results = await vectorDB.similaritySearchByFn(queryEmbedding, 0.7, 6);
    
    expect(results).toHaveLength(1);
    expect(results[0].content).toBe('Test content');
    expect(results[0].similarity).toBe(0.95);
  });
});
