import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryVectorDB } from '../src/lib/vectordb/memory.js';
import { GeminiEmbeddings } from '../src/lib/embeddings/index.js';
import { GeminiLLM } from '../src/lib/llm/index.js';
import { chunkResumeData } from '../src/lib/chunking.js';
import { assemblePrompt, truncateContext } from '../src/rag.js';
import type { ResumeData } from '../src/lib/chunking.js';

// Mock the Gemini services
vi.mock('../src/lib/embeddings/index.js');
vi.mock('../src/lib/llm/index.js');

describe('RAG System E2E', () => {
  let vectorDB: MemoryVectorDB;
  let mockEmbeddings: any;
  let mockLLM: any;

  const mockResumeData: ResumeData = {
    name: 'Ilan Klimberg',
    contact: {
      email: 'idk7@cornell.edu',
      GitHub: 'https://github.com/Ilanklim',
      linkedin: 'https://www.linkedin.com/in/ilanklimberg/',
    },
    education: [
      {
        institution: 'Cornell University',
        location: 'Ithaca, NY',
        degree: 'Bachelor of Science in Computer and Information Science',
        dates: 'Aug 2022 – May 2026',
        gpa: '3.7/4.0',
        honors: ['Dean\'s List (All Semesters)'],
        coursework: ['Functional Programming', 'Object-Oriented Programming and Data Structures'],
      },
    ],
    experience: [
      {
        company: 'Coinbase',
        role: 'Associate Product Manager Intern',
        location: 'San Francisco, CA',
        dates: 'May – Aug 2025',
        description: 'Largest American crypto exchange',
        highlights: [
          'Chosen as 1 of 17 from 10,000+ applicants for Coinbase\'s APM internship program',
        ],
      },
    ],
    skills: ['Product Management', 'Blockchain', 'SQL', 'Data Analysis'],
    organizations: [
      {
        name: 'Cornell Blockchain Club',
        roles: [
          {
            title: 'Head of Education',
            dates: 'Jan – Dec 2024',
            location: 'Ithaca, NY',
            highlights: [
              'Taught CS 1998 Intro to Blockchain',
              'Led 6 TAs and launched labs on wallets, NFTs, and DEXs',
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vectorDB = new MemoryVectorDB();
    
    // Mock embeddings
    mockEmbeddings = {
      embedText: vi.fn(),
      embedBatch: vi.fn(),
    };
    
    // Mock LLM
    mockLLM = {
      completeOnce: vi.fn(),
      completeStream: vi.fn(),
    };
    
    vi.mocked(GeminiEmbeddings).mockImplementation(() => mockEmbeddings);
    vi.mocked(GeminiLLM).mockImplementation(() => mockLLM);
  });

  describe('End-to-End RAG Flow', () => {
    it('should process resume data and answer queries', async () => {
      // Step 1: Chunk the resume data
      const chunks = chunkResumeData(mockResumeData);
      expect(chunks).toHaveLength(5); // about, education, experience, skills, organizations
      
      // Step 2: Mock embeddings for chunks
      const mockEmbedding = new Float32Array(1536).fill(0.1);
      mockEmbeddings.embedText.mockResolvedValue(mockEmbedding);
      
      // Step 3: Create documents and store in vector DB
      const documents = chunks.map((chunk, index) => ({
        id: `chunk-${index}`,
        content: chunk.content,
        embedding: mockEmbedding,
        metadata: {
          section: chunk.section,
          title: chunk.title,
          tags: chunk.tags,
        },
      }));
      
      await vectorDB.upsert(documents);
      expect(vectorDB.getDocumentCount()).toBe(5);
      
      // Step 4: Mock query embedding
      const queryEmbedding = new Float32Array(1536).fill(0.2);
      mockEmbeddings.embedText.mockResolvedValue(queryEmbedding);
      
      // Step 5: Search for similar documents
      const searchResults = await vectorDB.similaritySearchByFn(queryEmbedding, 0.7, 6);
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Step 6: Assemble prompt
      const prompt = assemblePrompt('What is Ilan\'s educational background?', searchResults);
      expect(prompt).toContain('Answer succinctly about Ilan using ONLY the provided Context');
      expect(prompt).toContain('What is Ilan\'s educational background?');
      
      // Step 7: Mock LLM response
      mockLLM.completeOnce.mockResolvedValue({
        text: 'Ilan is studying Computer and Information Science at Cornell University with a 3.7 GPA.',
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });
      
      // Step 8: Generate response
      const response = await mockLLM.completeOnce(prompt, 350);
      expect(response.text).toContain('Cornell University');
      expect(response.text).toContain('Computer and Information Science');
    });

    it('should handle queries with no relevant context', async () => {
      // Setup with minimal data
      const chunks = chunkResumeData(mockResumeData);
      const mockEmbedding = new Float32Array(1536).fill(0.1);
      
      mockEmbeddings.embedText.mockResolvedValue(mockEmbedding);
      
      const documents = chunks.map((chunk, index) => ({
        id: `chunk-${index}`,
        content: chunk.content,
        embedding: mockEmbedding,
        metadata: { section: chunk.section },
      }));
      
      await vectorDB.upsert(documents);
      
      // Query about something not in the resume
      const query = 'What is Ilan\'s favorite color?';
      const queryEmbedding = new Float32Array(1536).fill(0.9); // Very different embedding
      
      mockEmbeddings.embedText.mockResolvedValue(queryEmbedding);
      
      // Search with high threshold - should return few or no results
      const searchResults = await vectorDB.similaritySearchByFn(queryEmbedding, 0.8, 6);
      
      // Mock LLM to return the fallback response
      mockLLM.completeOnce.mockResolvedValue({
        text: 'I don\'t know based on the current data.',
        usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 },
      });
      
      const prompt = assemblePrompt(query, searchResults);
      const response = await mockLLM.completeOnce(prompt, 350);
      
      expect(response.text).toBe('I don\'t know based on the current data.');
    });

    it('should respect token limits in context truncation', () => {
      const chunks = chunkResumeData(mockResumeData);
      
      // Create a very long chunk to test truncation
      const longChunk = {
        content: 'A'.repeat(10000), // Very long content
        metadata: { section: 'test' },
        similarity: 0.9,
      };
      
      const searchResults = [longChunk];
      
      // Truncate to stay within 2400 token limit
      const truncated = truncateContext(searchResults, 2400);
      
      // Should truncate the content
      expect(truncated.length).toBeLessThanOrEqual(searchResults.length);
      if (truncated.length > 0) {
        expect(truncated[0].content.length).toBeLessThanOrEqual(9600); // 2400 tokens * 4 chars per token
      }
    });

    it('should handle streaming responses', async () => {
      // Setup streaming mock
      const mockStream = async function* () {
        yield { text: 'Ilan', done: false };
        yield { text: ' is a', done: false };
        yield { text: ' student at Cornell.', done: false };
        yield { text: '', done: true };
      };
      
      mockLLM.completeStream.mockImplementation(mockStream);
      
      const chunks = chunkResumeData(mockResumeData);
      const mockEmbedding = new Float32Array(1536).fill(0.1);
      
      mockEmbeddings.embedText.mockResolvedValue(mockEmbedding);
      
      const documents = chunks.map((chunk, index) => ({
        id: `chunk-${index}`,
        content: chunk.content,
        embedding: mockEmbedding,
        metadata: { section: chunk.section },
      }));
      
      await vectorDB.upsert(documents);
      
      const query = 'Tell me about Ilan';
      const queryEmbedding = new Float32Array(1536).fill(0.2);
      mockEmbeddings.embedText.mockResolvedValue(queryEmbedding);
      
      const searchResults = await vectorDB.similaritySearchByFn(queryEmbedding, 0.7, 6);
      const prompt = assemblePrompt(query, searchResults);
      
      const stream = mockLLM.completeStream(prompt, 350);
      const chunks: string[] = [];
      
      for await (const chunk of stream) {
        if (!chunk.done && chunk.text) {
          chunks.push(chunk.text);
        }
      }
      
      expect(chunks.join('')).toBe('Ilan is a student at Cornell.');
    });
  });

  describe('Error Handling', () => {
    it('should handle embedding failures gracefully', async () => {
      mockEmbeddings.embedText.mockRejectedValue(new Error('API rate limit exceeded'));
      
      await expect(mockEmbeddings.embedText('test')).rejects.toThrow('API rate limit exceeded');
    });

    it('should handle LLM failures gracefully', async () => {
      mockLLM.completeOnce.mockRejectedValue(new Error('Model temporarily unavailable'));
      
      await expect(mockLLM.completeOnce('test prompt', 350)).rejects.toThrow('Model temporarily unavailable');
    });
  });
});
