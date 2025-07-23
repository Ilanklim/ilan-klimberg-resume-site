import { readFile } from 'fs/promises';
import { join } from 'path';

interface ResumeData {
  name: string;
  contact: {
    email: string;
    GitHub: string;
    linkedin: string;
  };
  education: Array<{
    institution: string;
    location: string;
    degree: string;
    dates: string;
    gpa: string;
    honors: string[];
    coursework: string[];
  }>;
  experience: Array<{
    company: string;
    role: string;
    location: string;
    dates: string;
    description: string;
    highlights: string[];
  }>;
  organizations: Array<{
    name: string;
    roles?: Array<{
      title: string;
      dates: string;
      location?: string;
      highlights?: string[];
    }>;
    title?: string;
    dates?: string;
    location?: string;
    highlights?: string[];
  }>;
  additional_information?: {
    interests: string[];
    languages: Record<string, string>;
  };
}

interface Chunk {
  content: string;
  metadata: {
    type: string;
    section: string;
    [key: string]: any;
  };
}

let resumeData: ResumeData | null = null;

async function loadResumeData(): Promise<ResumeData> {
  if (resumeData) {
    return resumeData;
  }

  try {
    const resumeDataPath = join(process.cwd(), 'resumeData.json');
    const resumeDataContent = await readFile(resumeDataPath, 'utf8');
    resumeData = JSON.parse(resumeDataContent);
    return resumeData!;
  } catch (error) {
    console.error('Error reading resumeData.json:', error.message);
    throw new Error('Failed to load resume data. Make sure resumeData.json exists in the root directory.');
  }
}

export async function chunkResume(): Promise<Chunk[]> {
  const data = await loadResumeData();
  const chunks: Chunk[] = [];
  
  // Helper function to create chunks with metadata
  function createChunk(content: string, metadata: any): Chunk {
    return {
      content: content.trim(),
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Personal info chunk
  chunks.push(createChunk(
    `Name: ${data.name}\nContact: ${data.contact.email}\nGitHub: ${data.contact.GitHub}\nLinkedIn: ${data.contact.linkedin}`,
    { type: 'personal_info', section: 'contact' }
  ));

  // Education chunks
  data.education.forEach((edu, index) => {
    const educationText = `Education: ${edu.institution}, ${edu.location}\nDegree: ${edu.degree}\nDates: ${edu.dates}\nGPA: ${edu.gpa}\nHonors: ${edu.honors.join(', ')}\nCoursework: ${edu.coursework.join(', ')}`;
    
    chunks.push(createChunk(educationText, {
      type: 'education',
      section: 'education',
      index
    }));
  });

  // Experience chunks - each job gets its own chunk
  data.experience.forEach((exp, index) => {
    const experienceText = `Company: ${exp.company}\nRole: ${exp.role}\nLocation: ${exp.location}\nDates: ${exp.dates}\nDescription: ${exp.description}\nHighlights: ${exp.highlights.join(' ')}`;
    
    chunks.push(createChunk(experienceText, {
      type: 'experience',
      section: 'experience',
      company: exp.company,
      role: exp.role,
      index
    }));
  });

  // Organizations chunks
  data.organizations.forEach((org, index) => {
    const orgText = `Organization: ${org.name}\nRoles: ${org.roles ? org.roles.map(role => `${role.title} (${role.dates})`).join(', ') : org.title}\nDates: ${org.dates || org.roles?.[0]?.dates}\nLocation: ${org.location || org.roles?.[0]?.location}\nHighlights: ${org.highlights ? org.highlights.join(' ') : org.roles?.[0]?.highlights?.join(' ')}`;
    
    chunks.push(createChunk(orgText, {
      type: 'organization',
      section: 'organizations',
      organization: org.name,
      index
    }));
  });

  // Additional information chunks
  if (data.additional_information) {
    const interestsText = `Interests: ${data.additional_information.interests.join(', ')}`;
    chunks.push(createChunk(interestsText, {
      type: 'interests',
      section: 'additional_information'
    }));

    const languagesText = `Languages: ${Object.entries(data.additional_information.languages).map(([lang, level]) => `${lang} (${level})`).join(', ')}`;
    chunks.push(createChunk(languagesText, {
      type: 'languages',
      section: 'additional_information'
    }));
  }

  // Create a comprehensive summary chunk
  const summaryText = `Professional Summary: ${data.name} is a Computer Science student at Cornell University with experience in blockchain, crypto, and software development. Key experiences include founding KBCrypto, co-founding Silicore.io, interning at Coinbase and ARB Interactive, and leading Cornell Blockchain Club.`;
  
  chunks.push(createChunk(summaryText, {
    type: 'summary',
    section: 'overview'
  }));

  return chunks;
}

export async function getResumeStats() {
  const data = await loadResumeData();
  const chunks = await chunkResume();
  
  return {
    totalChunks: chunks.length,
    educationCount: data.education.length,
    experienceCount: data.experience.length,
    organizationsCount: data.organizations.length,
    skills: [
      'Blockchain', 'Cryptocurrency', 'Product Management', 'Software Development',
      'SQL', 'Data Analytics', 'Web Development', 'JavaScript', 'React',
      'Python', 'C#', 'AngularJS', 'Metabase', 'Google Tag Manager', 'SEO'
    ]
  };
}