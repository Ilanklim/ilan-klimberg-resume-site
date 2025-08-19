import { readFileSync } from 'fs';
import { join } from 'path';
import type { ResumeData } from '../lib/chunking.js';

export function loadResumeData(filePath?: string): ResumeData {
  const path = filePath || join(process.cwd(), 'resumeData.json');
  
  try {
    const fileContent = readFileSync(path, 'utf-8');
    const data = JSON.parse(fileContent) as ResumeData;
    
    // Validate required fields
    if (!data.name || !data.contact || !data.education || !data.experience) {
      throw new Error('Missing required fields in resume data');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error(`Resume data file not found: ${path}`);
    }
    if (error instanceof Error && error.message.includes('Unexpected token')) {
      throw new Error(`Invalid JSON in resume data file: ${path}`);
    }
    throw error;
  }
}

export function validateResumeData(data: ResumeData): void {
  const errors: string[] = [];
  
  if (!data.name) errors.push('Missing name');
  if (!data.contact || Object.keys(data.contact).length === 0) {
    errors.push('Missing contact information');
  }
  if (!data.education || data.education.length === 0) {
    errors.push('Missing education information');
  }
  if (!data.experience || data.experience.length === 0) {
    errors.push('Missing experience information');
  }
  
  if (errors.length > 0) {
    throw new Error(`Resume data validation failed: ${errors.join(', ')}`);
  }
}
