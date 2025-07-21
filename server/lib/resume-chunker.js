import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the resume data with error handling
let resumeData;
try {
  const resumeDataPath = join(__dirname, '../../resumeData.json');
  const resumeDataContent = readFileSync(resumeDataPath, 'utf8');
  resumeData = JSON.parse(resumeDataContent);
} catch (error) {
  console.error('Error reading resumeData.json:', error.message);
  throw new Error('Failed to load resume data. Make sure resumeData.json exists in the root directory.');
}

export function chunkResume() {
  const chunks = [];
  
  // Helper function to create chunks with metadata
  function createChunk(content, metadata) {
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
    `Name: ${resumeData.name}\nContact: ${resumeData.contact.email}\nGitHub: ${resumeData.contact.GitHub}\nLinkedIn: ${resumeData.contact.linkedin}`,
    { type: 'personal_info', section: 'contact' }
  ));

  // Education chunks
  resumeData.education.forEach((edu, index) => {
    const educationText = `Education: ${edu.institution}, ${edu.location}\nDegree: ${edu.degree}\nDates: ${edu.dates}\nGPA: ${edu.gpa}\nHonors: ${edu.honors.join(', ')}\nCoursework: ${edu.coursework.join(', ')}`;
    
    chunks.push(createChunk(educationText, {
      type: 'education',
      section: 'education',
      index
    }));
  });

  // Experience chunks - each job gets its own chunk
  resumeData.experience.forEach((exp, index) => {
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
  resumeData.organizations.forEach((org, index) => {
    const orgText = `Organization: ${org.name}\nRoles: ${org.roles ? org.roles.map(role => `${role.title} (${role.dates})`).join(', ') : org.title}\nDates: ${org.dates || org.roles?.[0]?.dates}\nLocation: ${org.location || org.roles?.[0]?.location}\nHighlights: ${org.highlights ? org.highlights.join(' ') : org.roles?.[0]?.highlights?.join(' ')}`;
    
    chunks.push(createChunk(orgText, {
      type: 'organization',
      section: 'organizations',
      organization: org.name,
      index
    }));
  });

  // Additional information chunks
  if (resumeData.additional_information) {
    const interestsText = `Interests: ${resumeData.additional_information.interests.join(', ')}`;
    chunks.push(createChunk(interestsText, {
      type: 'interests',
      section: 'additional_information'
    }));

    const languagesText = `Languages: ${Object.entries(resumeData.additional_information.languages).map(([lang, level]) => `${lang} (${level})`).join(', ')}`;
    chunks.push(createChunk(languagesText, {
      type: 'languages',
      section: 'additional_information'
    }));
  }

  // Create a comprehensive summary chunk
  const summaryText = `Professional Summary: ${resumeData.name} is a Computer Science student at Cornell University with experience in blockchain, crypto, and software development. Key experiences include founding KBCrypto, co-founding Silicore.io, interning at Coinbase and ARB Interactive, and leading Cornell Blockchain Club.`;
  
  chunks.push(createChunk(summaryText, {
    type: 'summary',
    section: 'overview'
  }));

  return chunks;
}

export function getResumeStats() {
  return {
    totalChunks: chunkResume().length,
    educationCount: resumeData.education.length,
    experienceCount: resumeData.experience.length,
    organizationsCount: resumeData.organizations.length,
    skills: [
      'Blockchain', 'Cryptocurrency', 'Product Management', 'Software Development',
      'SQL', 'Data Analytics', 'Web Development', 'JavaScript', 'React',
      'Python', 'C#', 'AngularJS', 'Metabase', 'Google Tag Manager', 'SEO'
    ]
  };
} 