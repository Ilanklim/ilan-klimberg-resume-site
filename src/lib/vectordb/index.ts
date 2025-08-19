export interface Document {
  id: string;
  content: string;
  embedding: Float32Array;
  metadata: Record<string, any>;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export interface VectorDB {
  upsert(documents: Document[]): Promise<void>;
  similaritySearchByFn(
    queryEmbedding: Float32Array,
    threshold: number,
    k: number
  ): Promise<SearchResult[]>;
}
