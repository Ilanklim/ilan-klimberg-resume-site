import { Section } from "@/components/ui/section"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Code, Database, Palette, Globe, Blocks, TrendingUp } from "lucide-react"

interface SkillCategory {
  title: string
  icon: React.ElementType
  color: string
  skills: string[]
}

const skillCategories: SkillCategory[] = [
  {
    title: "Languages & Tools",
    icon: Code,
    color: "bg-blue-500",
    skills: ["Java", "TypeScript", "SQL", "Python", "OCaml", "HTML", "CSS", "JavaScript", "Figma"]
  },
  {
    title: "Data Science",
    icon: Database,
    color: "bg-green-500",
    skills: ["SQL Analytics", "Metabase", "Data Visualization", "Causal Inference"]
  },
  {
    title: "UI/UX",
    icon: Palette,
    color: "bg-purple-500",
    skills: ["Responsive Design", "Mobile-First", "User Experience", "Frontend Optimization", "Figma"]
  },
  {
    title: "Web Development",
    icon: Globe,
    color: "bg-orange-500",
    skills: ["React", "AngularJS", "C#", "API Development", "SEO Optimization", "Google Tag Manager"]
  },
  {
    title: "Blockchain",
    icon: Blocks,
    color: "bg-indigo-500",
    skills: ["Cryptocurrency", "Liquidity Pools", "Cryptocurrency", "DeFi", "Education"]
  },
  {
    title: "Business",
    icon: TrendingUp,
    color: "bg-pink-500",
    skills: ["Product Management", "Go-to-Market Strategy", "Fundraising", "Market Analysis", "Public Speaking"]
  }
]

export function SkillsSection() {
  return (
    <Section>
      <div id="skills">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Skills & Expertise</h2>
        <p className="text-lg text-muted-foreground">Technical stack and domain knowledge</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((category, index) => (
          <Card 
            key={index} 
            className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill, skillIndex) => (
                <Badge 
                  key={skillIndex}
                  variant="secondary"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
      </div>
    </Section>
  )
}