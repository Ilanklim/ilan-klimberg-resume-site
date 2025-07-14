import { Mail, Phone, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartSearchBar } from "./smart-search-bar";
export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-elegant ring-4 ring-primary/20">
              <img src="/lovable-uploads/69da4a92-5c6e-4971-89ae-9185a82ad37f.png" alt="Ilan Klimberg - Professional Photo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4">
              Ilan Klimberg
            </h1>
            <p className="text-xl sm:text-2xl text-primary font-semibold mb-4">
              Computer Science Student & Blockchain Entrepreneur
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">Cornell CIS student passionate about blockchain, fintech, and building innovative solutions. Co-founder with proven track record in fundraising, product management, and technical development.</p>
          </div>

          {/* Smart Search Bar */}
          <SmartSearchBar />
          
          {/* Contact Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-sm">
            <a href="tel:+13055020995" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span>+1 305-502-0995</span>
            </a>
            <a href="mailto:ilanklimberg@gmail.com" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              <span>ilanklimberg@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/ilanklimberg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
            <a href="https://github.com/Ilanklim" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300" onClick={() => scrollToSection('experience')}>
              View My Work
            </Button>
            <Button variant="outline" size="lg" className="hover:shadow-card transition-all duration-300">
              Download Resume
            </Button>
          </div>
        </div>
      </div>
    </section>;
}