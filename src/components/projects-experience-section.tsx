import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, Github, Users } from "lucide-react"

interface Project {
  title: string
  type: "project" | "experience"
  date: string
  description: string
  details: string[]
  skills: string[]
  links: {
    github?: string
    external?: string
    demo?: string
  }
  logo?: string
  company?: string
}

const projects: Project[] = [
  {
    title: "Database Management System Project",
    type: "project",
    date: "Mar 2024 – May 2024",
    description: "Implemented a complete database management system in OCaml with full CRUD operations and query processing.",
    details: [
      "Built comprehensive parser and lexer for SQL-like query language",
      "Designed and implemented database structure representation with efficient data storage",
      "Created intuitive user interface for database interactions",
      "Implemented query optimization and indexing for improved performance"
    ],
    skills: ["OCaml", "Functional Programming", "Parser Design", "Database Systems", "UI Development"],
    links: {
      github: "https://github.com/cejiogu/dbms_project"
    }
  },
  {
    title: "Cornell Blockchain Website",
    type: "project", 
    date: "Nov 2023 – Jan 2024",
    description: "Developed a responsive website from scratch for Cornell Blockchain with modern UI components and mobile-first design.",
    details: [
      "Built responsive website using HTML, CSS, and JavaScript with no frameworks",
      "Implemented interactive modals, dropdowns, and carousel elements",
      "Focused on mobile-first design approach for optimal user experience",
      "Collaborated with design team to create cohesive brand experience"
    ],
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design", "Mobile-First", "UI/UX"],
    links: {
      github: "https://github.com/Ilanklim/Cornell-Blockchain-Website"
    }
  },
  {
    title: "Associate Product Manager Intern",
    type: "experience",
    company: "Coinbase",
    date: "May – Aug 2025",
    description: "Selected as 1 of 17 from 10,000+ applicants for Coinbase's prestigious APM internship program.",
    details: [
      "Chosen from highly competitive pool of 10,000+ applicants",
      "Working with product teams at the largest American crypto exchange",
      "Gaining experience in product strategy and cryptocurrency markets"
    ],
    skills: ["Product Management", "Cryptocurrency", "Strategy", "Market Analysis"],
    links: {
      external: "https://www.coinbase.com"
    }
  },
  {
    title: "Founder",
    type: "experience",
    company: "KBCrypto",
    date: "Feb 2025 – Present",
    description: "Founded blockchain and crypto consulting firm educating high-net-worth individuals.",
    details: [
      "Generated $10,000+ in revenue through crypto education services",
      "Optimized SEO with internal links and Google Tag Manager integration",
      "Led marketing campaigns resulting in 1,000+ monthly website viewers",
      "Developed educational content for blockchain and cryptocurrency concepts"
    ],
    skills: ["Entrepreneurship", "Blockchain Consulting", "SEO", "Content Marketing", "Google Analytics"],
    links: {
      external: "https://www.kbcrypto.io/"
    }
  },
  {
    title: "Co-Founder & Product Manager",
    type: "experience", 
    company: "Silicore.io",
    date: "Jun 2024 – Present",
    description: "Co-founded cryptocurrency exchange directory focused on building trust in the crypto ecosystem.",
    details: [
      "Secured $32,000 in funding from Stellar Community Fund",
      "Developed comprehensive go-to-market strategy and pricing model",
      "Selected as speaker for Stellar Meridian 2024 conference in London",
      "Pivoted into Cornell Blockchain project team based on market insights"
    ],
    skills: ["Product Management", "Fundraising", "Public Speaking", "Go-to-Market Strategy", "Blockchain"],
    links: {
      external: "https://www.silicore.io/"
    }
  },
  {
    title: "Finance & Data Analytics Intern",
    type: "experience",
    company: "ARB Interactive", 
    date: "May – Aug 2024",
    description: "Built data analytics infrastructure and conducted market analysis at unicorn iGaming startup.",
    details: [
      "Built SQL dashboard in Metabase for financial KPIs with automated reporting",
      "Wrote 30+ SQL queries leading to 22% increase in company Metabase traffic",
      "Optimized frontend structure reducing onboarding time by 40%",
      "Conducted acquisition analysis leading to 6-figure gaming company purchase"
    ],
    skills: ["SQL", "Data Analytics", "Metabase", "Frontend Architecture", "Market Analysis"],
    links: {
      external: "https://www.arbinteractive.com/"
    }
  }
]

export function ProjectsExperienceSection() {
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Section>
      <div id="experience">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Projects & Experience</h2>
        <p className="text-lg text-muted-foreground">Key projects and professional experiences</p>
      </div>

      <div className="space-y-8">
        {projects.map((project, index) => (
          <Card 
            key={index} 
            className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Header Info */}
              <div className="lg:w-1/3">
                <div className="flex items-start gap-3 mb-4">
                  {project.type === "experience" && (
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {project.company?.charAt(0) || project.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {project.title}
                    </h3>
                    {project.company && (
                      <p className="text-lg text-primary font-semibold">{project.company}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{project.date}</span>
                </div>
                
                <p className="text-sm text-muted-foreground italic mb-4">
                  {project.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {project.links.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkClick(project.links.github!)}
                      className="hover:shadow-card transition-all duration-300"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                  {project.links.external && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkClick(project.links.external!)}
                      className="hover:shadow-card transition-all duration-300"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Site
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:w-2/3">
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Key Achievements:</h4>
                  <ul className="space-y-2">
                    {project.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-muted-foreground leading-relaxed">{detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Technologies Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, skillIndex) => (
                      <Badge 
                        key={skillIndex}
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      </div>
    </Section>
  )
}