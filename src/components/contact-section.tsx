import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Calendar, Github, Linkedin, Download, Users, MessageSquare, Briefcase, Target } from "lucide-react"

const contactMethods = [
  {
    id: "calendar",
    title: "Schedule a Meeting",
    description: "Book a time that works for you",
    icon: Calendar,
    isPrimary: true,
    action: () => window.open("https://cal.com/ilan-klim", "_blank")
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    description: "Connect professionally",
    icon: Linkedin,
    action: () => window.open("https://linkedin.com/in/ilan-klim", "_blank")
  },
  {
    id: "github",
    title: "GitHub",
    description: "View my repositories",
    icon: Github,
    action: () => window.open("https://github.com/Ilanklim", "_blank")
  },
  {
    id: "email",
    title: "Email",
    description: "Send me a message",
    icon: Mail,
    action: () => window.open("mailto:idk7@cornell.edu", "_blank")
  }
]

const productSkills = [
  {
    icon: Users,
    title: "Leadership",
    description: "Led cross-functional teams and managed stakeholder relationships"
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Excellent written and verbal communication with technical and business teams"
  },
  {
    icon: Briefcase,
    title: "Strategy",
    description: "Developed go-to-market strategies and product roadmaps"
  },
  {
    icon: Target,
    title: "Execution",
    description: "Delivered products from concept to launch with measurable impact"
  }
]

export function ContactSection() {
  return (
    <Section className="bg-gradient-subtle">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
          Let's Connect
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ready to discuss opportunities, collaborations, and how I can drive impact at your organization
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-16">
        <Button 
          size="lg" 
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-3"
          onClick={() => window.open("mailto:idk7@cornell.edu", "_blank")}
        >
          <Mail className="mr-3 h-5 w-5" />
          Email Me
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="hover:shadow-card transition-all duration-300 text-lg px-8 py-3 border-primary/20 hover:border-primary/40"
          onClick={() => window.open("https://linkedin.com/in/ilan-klim", "_blank")}
        >
          <Linkedin className="mr-3 h-5 w-5" />
          LinkedIn
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="hover:shadow-card transition-all duration-300 text-lg px-8 py-3 border-primary/20 hover:border-primary/40"
          onClick={() => window.open("#", "_blank")}
        >
          <Download className="mr-3 h-5 w-5" />
          Download Resume
        </Button>
      </div>

      {/* Contact Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {contactMethods.map((method) => {
          const Icon = method.icon
          return (
            <Card 
              key={method.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 ${
                method.isPrimary 
                  ? 'ring-2 ring-primary/30 bg-gradient-card shadow-elegant' 
                  : 'hover:shadow-card bg-card/80 backdrop-blur-sm'
              }`}
              onClick={method.action}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-full mb-4 transition-all duration-300 ${
                  method.isPrimary 
                    ? 'bg-gradient-primary text-primary-foreground group-hover:shadow-glow' 
                    : 'bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
                <CardDescription className="text-sm">{method.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Product Management Skills */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-8 text-foreground">
          Product Management Excellence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productSkills.map((skill, index) => {
            const Icon = skill.icon
            return (
              <Card key={index} className="text-center bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{skill.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {skill.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Contact Info Footer */}
      <div className="text-center pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent">
              <Phone className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-medium">+1 305-502-0995</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent">
              <Mail className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-medium">idk7@cornell.edu</span>
          </div>
        </div>
      </div>
    </Section>
  )
}