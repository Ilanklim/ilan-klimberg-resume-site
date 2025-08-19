import type { SearchResult } from './lib/vectordb/index.js';

export function assemblePrompt(query: string, retrievedChunks: SearchResult[]): string {
  const systemPrompt = `Answer succinctly about Ilan using ONLY the provided Context from his résumé.  
If info isn't present, reply exactly: "I don't know based on the current data."  
Be concise; prefer short paragraphs or 3–6 bullets. No citations, footnotes, or URLs.`;

  const contextSections = retrievedChunks
    .map((chunk, index) => `<S${index + 1}>${chunk.content}</S${index + 1}>`)
    .join('\n');

  const userPrompt = query;

  return `${systemPrompt}

Context:
${contextSections}

User: ${userPrompt}`;
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export function truncateContext(chunks: SearchResult[], maxTokens: number = 2400): SearchResult[] {
  let totalTokens = 0;
  const truncated: SearchResult[] = [];

  for (const chunk of chunks) {
    const chunkTokens = estimateTokens(chunk.content);
    if (totalTokens + chunkTokens <= maxTokens) {
      truncated.push(chunk);
      totalTokens += chunkTokens;
    } else {
      break;
    }
  }

  return truncated;
}
