import { Section } from "@/components/ui/section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Calendar, MapPin, Code, Database } from "lucide-react"

interface Project {
  title: string
  description: string
  period: string
  skills: string[]
  highlights: string[]
  links?: {
    github?: string
    demo?: string
  }
  icon: React.ElementType
  color: string
}

const projects: Project[] = [
  {
    title: "Cornell Blockchain Website",
    description: "Designed and implemented a blockchain-focused web infrastructure with secure and scalable system architecture",
    period: "Nov 2023 – Jan 2024",
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design", "UI/UX"],
    highlights: [
      "Developed responsive website from scratch with modals, dropdowns, and carousel elements",
      "Implemented mobile-first design principles for optimal user experience",
      "Collaborated with team to build secure and scalable blockchain-focused infrastructure",
      "Integrated front-end and back-end components ensuring seamless performance"
    ],
    links: {
      github: "https://github.com/Ilanklim/Cornell-Blockchain-Website"
    },
    icon: Code,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Database Management System Project",
    description: "Implemented a comprehensive database management system in OCaml with full CRUD operations and advanced query capabilities",
    period: "Mar 2024 – May 2024",
    skills: ["OCaml", "Parser", "Lexer", "Database Design", "System Architecture"],
    highlights: [
      "Designed and implemented complete database schema with PostgreSQL backend",
      "Developed custom parser and lexer for SQL-like query language",
      "Built intuitive user interface for database operations and administration",
      "Created robust data ingestion pipeline with security and validation features",
      "Implemented advanced query optimization and performance monitoring"
    ],
    links: {
      github: "https://github.com/cejiogu/dbms_project"
    },
    icon: Database,
    color: "from-blue-500 to-cyan-500"
  }
]

export function ProjectsSection() {
  return (
    <Section className="bg-background">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Featured Projects
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Innovative solutions showcasing technical expertise in blockchain technology, 
          database systems, and full-stack development
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          const Icon = project.icon
          return (
            <Card 
              key={index} 
              className="overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-2 bg-gradient-card border-0 h-fit"
            >
              <div className="p-6">
                {/* Project Header */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${project.color} shadow-lg flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-foreground mb-1 leading-tight">{project.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm font-medium">{project.period}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {project.description}
                  </p>
                </div>
                
                {/* Skills */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-foreground text-sm">Technologies</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {project.highlights.slice(0, 3).map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${project.color} mt-1.5 flex-shrink-0`}></div>
                        <p className="text-foreground leading-relaxed text-sm">{highlight}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Links */}
                {project.links && (
                  <div className="flex gap-2 pt-2">
                    {project.links.github && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-xs px-3 py-1"
                        onClick={() => window.open(project.links.github, "_blank")}
                      >
                        <Github className="mr-1 h-3 w-3" />
                        Code
                      </Button>
                    )}
                    {project.links.demo && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:shadow-card transition-all duration-300 text-xs px-3 py-1"
                        onClick={() => window.open(project.links.demo, "_blank")}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Demo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}