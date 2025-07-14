import { Section } from "@/components/ui/section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, TrendingUp, Users, Target, Briefcase, Blocks } from "lucide-react"

interface Experience {
  title: string
  company: string
  location: string
  period: string
  description: string
  highlights: string[]
  skills: string[]
  isUpcoming?: boolean
  companyUrl?: string
  icon: React.ElementType
  color: string
}

const experiences: Experience[] = [
  {
    title: "Founder",
    company: "KBCrypto",
    location: "Madrid, Spain",
    period: "Feb 2025 – Present",
    description: "Blockchain and crypto consulting firm providing education and strategic guidance to high-net-worth individuals",
    highlights: [
      "Founded blockchain consulting firm generating $10,000+ in revenue through educational services",
      "Educated high-net-worth individuals on blockchain technology and cryptocurrency investment strategies",
      "Optimized SEO through internal linking and site architecture, integrating Google Tag Manager for user tracking",
      "Led comprehensive marketing campaign with weekly LinkedIn content and website articles, achieving 1,000+ monthly visitors",
      "Developed personalized content strategies based on user analytics and engagement metrics"
    ],
    skills: ["Blockchain Technology", "SEO Optimization", "Content Marketing", "Business Development", "Analytics"],
    companyUrl: "https://www.kbcrypto.io",
    icon: Blocks,
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Co-Founder & Product Manager",
    company: "Silicore.io",
    location: "Miami, FL",
    period: "Jun 2024 – Present",
    description: "Cryptocurrency exchange directory platform building trust and transparency in the crypto ecosystem",
    highlights: [
      "Secured $32,000 in funding from Stellar Community Fund after successful pitch presentation",
      "Developed comprehensive go-to-market strategy, pricing model, and technical architecture",
      "Created detailed user journey mapping and product roadmap for platform development",
      "Selected as featured speaker at Stellar's flagship conference Meridian 2024 in London",
      "Successfully pivoted Silicore into Cornell Blockchain project team based on market insights from Meridian 2024"
    ],
    skills: ["Product Management", "Fundraising", "Go-to-Market Strategy", "Public Speaking", "Strategic Planning"],
    companyUrl: "https://www.silicore.io",
    icon: Target,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Finance & Data Analytics Intern",
    company: "ARB Interactive",
    location: "Miami, FL",
    period: "May – Aug 2024",
    description: "Unicorn startup focused on iGaming with emphasis on data-driven decision making and financial optimization",
    highlights: [
      "Built comprehensive SQL dashboard in Metabase for financial KPIs with automated daily and weekly email reports to CFO",
      "Wrote 30+ complex SQL queries across all company teams, resulting in 22% increase in Metabase platform usage",
      "Optimized frontend code structure by transitioning from file-type to feature-based folder organization, reducing developer onboarding time by 40%",
      "Conducted market research to identify acquisition targets, mapped competitive landscape, and compiled EBITDA multiples",
      "Analysis directly contributed to successful 6-figure acquisition of gaming company"
    ],
    skills: ["SQL", "Data Analytics", "Financial Modeling", "Market Research", "Frontend Optimization"],
    companyUrl: "https://www.arbinteractive.com",
    icon: Users,
    color: "from-purple-500 to-indigo-600"
  }
]

export function ExperienceSection() {
  return (
    <Section className="bg-gradient-subtle">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Professional Experience
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Building innovative products and driving measurable impact across fintech, 
          blockchain, and data analytics domains
        </p>
      </div>

      <div className="space-y-8">
        {experiences.map((exp, index) => {
          const Icon = exp.icon
          return (
            <Card 
              key={index} 
              className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-gradient-card border border-border/50 rounded-xl"
            >
              <div className="grid lg:grid-cols-4 gap-6 p-6">
                {/* Company Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${exp.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{exp.title}</h3>
                      <p className="text-base text-primary font-semibold">{exp.company}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{exp.period}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{exp.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {exp.description}
                  </p>

                  {/* Company Link */}
                  {exp.companyUrl && (
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-xs px-3 py-1"
                      onClick={() => window.open(exp.companyUrl, "_blank")}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Visit
                    </Button>
                  )}
                </div>

                {/* Skills */}
                <div className="lg:col-span-1">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Key Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {exp.skills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary border-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Achievements */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${exp.color} mt-1.5 flex-shrink-0`}></div>
                        <p className="text-foreground leading-relaxed text-sm">{highlight}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}