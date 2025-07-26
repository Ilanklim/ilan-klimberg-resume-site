import React from "react"
import { HeroSection } from "@/components/hero-section"
import { EducationSection } from "@/components/education-section"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsSection } from "@/components/projects-section"
import { ExperienceSection } from "@/components/experience-section"
import { OrganizationsSection } from "@/components/organizations-section"
import { InterestsSection } from "@/components/interests-section"
import { ContactSection } from "@/components/contact-section"
import { SEOStructuredData } from "@/components/seo-structured-data"
import { AnonymousSearchBar } from "@/components/anonymous-search-bar"
import { Section } from "@/components/ui/section";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOStructuredData />
      <HeroSection />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnonymousSearchBar />
      </div>
      <Section id="education">
        <EducationSection />
      </Section>
      <Section id="skills">
        <SkillsSection />
      </Section>
      <Section id="experience">
        <ExperienceSection />
      </Section>
      <Section id="projects">
        <ProjectsSection />
      </Section>
      <Section id="organizations">
        <OrganizationsSection />
      </Section>
      <Section id="interests">
        <InterestsSection />
      </Section>
      <Section id="contact">
        <ContactSection />
      </Section>
    </div>
  );
};

export default Index;