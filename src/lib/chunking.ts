import { createHash } from 'crypto';

export interface ResumeSection {
  section: string;
  content: string;
  title?: string;
  tags?: string[];
}

export interface ResumeData {
  name: string;
  contact: Record<string, string>;
  education: Array<{
    institution: string;
    location: string;
    degree: string;
    dates: string;
    gpa?: string;
    honors?: string[];
    coursework?: string[];
  }>;
  experience: Array<{
    company: string;
    role: string;
    location: string;
    dates: string;
    description: string;
    highlights: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    highlights?: string[];
  }>;
  skills?: string[];
  organizations?: Array<{
    name: string;
    roles: Array<{
      title: string;
      dates: string;
      location: string;
      highlights: string[];
    }>;
  }>;
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function chunkResumeData(data: ResumeData): ResumeSection[] {
  const chunks: ResumeSection[] = [];

  // About section (name + contact)
  const aboutContent = `Name: ${data.name}\nContact: ${Object.entries(data.contact)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')}`;
  
  chunks.push({
    section: 'about',
    content: aboutContent,
    title: 'About',
    tags: ['contact', 'personal']
  });

  // Education section
  if (data.education && data.education.length > 0) {
    const educationContent = data.education
      .map(edu => {
        const parts = [
          `Institution: ${edu.institution}`,
          `Location: ${edu.location}`,
          `Degree: ${edu.degree}`,
          `Dates: ${edu.dates}`
        ];
        
        if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
        if (edu.honors && edu.honors.length > 0) {
          parts.push(`Honors: ${edu.honors.join(', ')}`);
        }
        if (edu.coursework && edu.coursework.length > 0) {
          parts.push(`Coursework: ${edu.coursework.join(', ')}`);
        }
        
        return parts.join('\n');
      })
      .join('\n\n');
    
    chunks.push({
      section: 'education',
      content: educationContent,
      title: 'Education',
      tags: ['academic', 'degree']
    });
  }

  // Experience section
  if (data.experience && data.experience.length > 0) {
    const experienceContent = data.experience
      .map(exp => {
        const parts = [
          `Company: ${exp.company}`,
          `Role: ${exp.role}`,
          `Location: ${exp.location}`,
          `Dates: ${exp.dates}`,
          `Description: ${exp.description}`
        ];
        
        if (exp.highlights && exp.highlights.length > 0) {
          parts.push(`Highlights:\n${exp.highlights.map(h => `• ${h}`).join('\n')}`);
        }
        
        return parts.join('\n');
      })
      .join('\n\n');
    
    chunks.push({
      section: 'experience',
      content: experienceContent,
      title: 'Work Experience',
      tags: ['professional', 'career']
    });
  }

  // Projects section
  if (data.projects && data.projects.length > 0) {
    const projectsContent = data.projects
      .map(proj => {
        const parts = [
          `Project: ${proj.name}`,
          `Description: ${proj.description}`
        ];
        
        if (proj.technologies && proj.technologies.length > 0) {
          parts.push(`Technologies: ${proj.technologies.join(', ')}`);
        }
        
        if (proj.highlights && proj.highlights.length > 0) {
          parts.push(`Highlights:\n${proj.highlights.map(h => `• ${h}`).join('\n')}`);
        }
        
        return parts.join('\n');
      })
      .join('\n\n');
    
    chunks.push({
      section: 'projects',
      content: projectsContent,
      title: 'Projects',
      tags: ['development', 'portfolio']
    });
  }

  // Skills section
  if (data.skills && data.skills.length > 0) {
    chunks.push({
      section: 'skills',
      content: `Skills: ${data.skills.join(', ')}`,
      title: 'Skills',
      tags: ['technical', 'competencies']
    });
  }

  // Organizations section
  if (data.organizations && data.organizations.length > 0) {
    const organizationsContent = data.organizations
      .map(org => {
        const parts = [`Organization: ${org.name}`];
        
        if (org.roles && org.roles.length > 0) {
          const rolesContent = org.roles
            .map(role => {
              const roleParts = [
                `Title: ${role.title}`,
                `Dates: ${role.dates}`,
                `Location: ${role.location}`
              ];
              
              if (role.highlights && role.highlights.length > 0) {
                roleParts.push(`Highlights:\n${role.highlights.map(h => `• ${h}`).join('\n')}`);
              }
              
              return roleParts.join('\n');
            })
            .join('\n\n');
          
          parts.push(`Roles:\n${rolesContent}`);
        }
        
        return parts.join('\n');
      })
      .join('\n\n');
    
    chunks.push({
      section: 'organizations',
      content: organizationsContent,
      title: 'Organizations & Leadership',
      tags: ['leadership', 'community']
    });
  }

  return chunks;
}
