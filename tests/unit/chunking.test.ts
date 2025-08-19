import { describe, it, expect } from 'vitest';
import { chunkResumeData, hashContent, type ResumeData } from '../../src/lib/chunking.js';

describe('Chunking', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
    },
    education: [
      {
        institution: 'Test University',
        location: 'Test City',
        degree: 'Bachelor of Science',
        dates: '2020-2024',
        gpa: '3.8/4.0',
        honors: ['Dean\'s List'],
        coursework: ['Computer Science', 'Mathematics'],
      },
    ],
    experience: [
      {
        company: 'Test Company',
        role: 'Software Engineer',
        location: 'Test City',
        dates: '2024-Present',
        description: 'Building software',
        highlights: ['Developed feature X', 'Improved performance Y'],
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React'],
    organizations: [
      {
        name: 'Test Club',
        roles: [
          {
            title: 'President',
            dates: '2023-2024',
            location: 'Test City',
            highlights: ['Led team of 10', 'Organized events'],
          },
        ],
      },
    ],
  };

  describe('hashContent', () => {
    it('should generate consistent hashes for same content', () => {
      const content = 'test content';
      const hash1 = hashContent(content);
      const hash2 = hashContent(content);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate different hashes for different content', () => {
      const hash1 = hashContent('content 1');
      const hash2 = hashContent('content 2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('chunkResumeData', () => {
    it('should create one chunk per section', () => {
      const chunks = chunkResumeData(mockResumeData);
      
      // Should have exactly 5 chunks: about, education, experience, skills, organizations
      expect(chunks).toHaveLength(5);
      
      const sections = chunks.map(chunk => chunk.section);
      expect(sections).toEqual(['about', 'education', 'experience', 'skills', 'organizations']);
    });

    it('should include all required fields in each chunk', () => {
      const chunks = chunkResumeData(mockResumeData);
      
      chunks.forEach(chunk => {
        expect(chunk).toHaveProperty('section');
        expect(chunk).toHaveProperty('content');
        expect(chunk).toHaveProperty('title');
        expect(chunk).toHaveProperty('tags');
        expect(typeof chunk.content).toBe('string');
        expect(chunk.content.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing optional sections gracefully', () => {
      const minimalData: ResumeData = {
        name: 'Jane Doe',
        contact: { email: 'jane@example.com' },
        education: [
          {
            institution: 'Test University',
            location: 'Test City',
            degree: 'Bachelor',
            dates: '2020-2024',
            highlights: [],
          },
        ],
        experience: [
          {
            company: 'Test Company',
            role: 'Developer',
            location: 'Test City',
            dates: '2024-Present',
            description: 'Development work',
            highlights: [],
          },
        ],
      };

      const chunks = chunkResumeData(minimalData);
      
      // Should have exactly 3 chunks: about, education, experience
      expect(chunks).toHaveLength(3);
      expect(chunks.map(c => c.section)).toEqual(['about', 'education', 'experience']);
    });

    it('should format education section correctly', () => {
      const chunks = chunkResumeData(mockResumeData);
      const educationChunk = chunks.find(c => c.section === 'education');
      
      expect(educationChunk).toBeDefined();
      expect(educationChunk!.content).toContain('Institution: Test University');
      expect(educationChunk!.content).toContain('Degree: Bachelor of Science');
      expect(educationChunk!.content).toContain('GPA: 3.8/4.0');
      expect(educationChunk!.content).toContain('Honors: Dean\'s List');
      expect(educationChunk!.content).toContain('Coursework: Computer Science, Mathematics');
    });

    it('should format experience section correctly', () => {
      const chunks = chunkResumeData(mockResumeData);
      const experienceChunk = chunks.find(c => c.section === 'experience');
      
      expect(experienceChunk).toBeDefined();
      expect(experienceChunk!.content).toContain('Company: Test Company');
      expect(experienceChunk!.content).toContain('Role: Software Engineer');
      expect(experienceChunk!.content).toContain('Highlights:');
      expect(experienceChunk!.content).toContain('• Developed feature X');
      expect(experienceChunk!.content).toContain('• Improved performance Y');
    });

    it('should format skills section correctly', () => {
      const chunks = chunkResumeData(mockResumeData);
      const skillsChunk = chunks.find(c => c.section === 'skills');
      
      expect(skillsChunk).toBeDefined();
      expect(skillsChunk!.content).toContain('Skills: JavaScript, TypeScript, React');
    });

    it('should format organizations section correctly', () => {
      const chunks = chunkResumeData(mockResumeData);
      const organizationsChunk = chunks.find(c => c.section === 'organizations');
      
      expect(organizationsChunk).toBeDefined();
      expect(organizationsChunk!.content).toContain('Organization: Test Club');
      expect(organizationsChunk!.content).toContain('Title: President');
      expect(organizationsChunk!.content).toContain('• Led team of 10');
      expect(organizationsChunk!.content).toContain('• Organized events');
    });
  });
});
