import type { Document, SearchResult, VectorDB } from './index.js';

export class MemoryVectorDB implements VectorDB {
  private documents: Document[] = [];

  async upsert(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      const existingIndex = this.documents.findIndex(d => d.id === doc.id);
      if (existingIndex >= 0) {
        this.documents[existingIndex] = doc;
      } else {
        this.documents.push(doc);
      }
    }
  }

  async similaritySearchByFn(
    queryEmbedding: Float32Array,
    threshold: number,
    k: number
  ): Promise<SearchResult[]> {
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Filter by threshold and sort by similarity
    const filtered = similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return filtered.map(item => ({
      content: item.document.content,
      metadata: item.document.metadata,
      similarity: item.similarity,
    }));
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  clear(): void {
    this.documents = [];
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}
