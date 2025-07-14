import { Section } from "@/components/ui/section"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Calendar, Github, Linkedin } from "lucide-react"

const contactMethods = [
  {
    id: "calendar",
    title: "Schedule a Meeting",
    description: "Book a time that works for you",
    icon: Calendar,
    isPrimary: true,
    action: () => window.open("https://cal.com/ilan-klimberg", "_blank")
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    description: "Connect professionally",
    icon: Linkedin,
    action: () => window.open("https://linkedin.com/in/ilan-klimberg", "_blank")
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
    action: () => window.open("mailto:ilanklimberg@gmail.com", "_blank")
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


    </Section>
  )
}