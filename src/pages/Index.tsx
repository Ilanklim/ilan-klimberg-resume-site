import { HeroSection } from "@/components/hero-section"
import { EducationSection } from "@/components/education-section"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsSection } from "@/components/projects-section"
import { ExperienceSection } from "@/components/experience-section"
import { OrganizationsSection } from "@/components/organizations-section"
import { InterestsSection } from "@/components/interests-section"
import { ContactSection } from "@/components/contact-section"
import { SEOStructuredData } from "@/components/seo-structured-data"
import { Section } from "@/components/ui/section";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOStructuredData />
      <HeroSection />
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
