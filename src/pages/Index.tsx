import { HeroSection } from "@/components/hero-section"
import { EducationSection } from "@/components/education-section"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsSection } from "@/components/projects-section"
import { ExperienceSection } from "@/components/experience-section"
import { OrganizationsSection } from "@/components/organizations-section"
import { InterestsSection } from "@/components/interests-section"
import { ContactSection } from "@/components/contact-section"
import { SEOStructuredData } from "@/components/seo-structured-data"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOStructuredData />
      <HeroSection />
      <section id="education">
        <EducationSection />
      </section>
      <section id="skills">
        <SkillsSection />
      </section>
      <section id="experience">
        <ExperienceSection />
      </section>
      <section id="projects">
        <ProjectsSection />
      </section>
      <section id="organizations">
        <OrganizationsSection />
      </section>
      <section id="interests">
        <InterestsSection />
      </section>
      <section id="contact">
        <ContactSection />
      </section>
    </div>
  );
};

export default Index;
