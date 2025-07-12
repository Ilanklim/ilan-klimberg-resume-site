import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Languages, Heart } from "lucide-react"

export function InterestsSection() {
  const interests = [
    "Miami Heat", "Catan", "Ping Pong", "Podcasts", "FIFA", "Fencing"
  ]

  const languages = [
    { name: "Spanish", level: "Native" },
    { name: "Hebrew", level: "Intermediate" }
  ]

  return (
    <Section variant="card">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Beyond Work</h2>
        <p className="text-lg text-muted-foreground">Personal interests and languages</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Interests</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-2 px-3 hover:bg-accent transition-colors cursor-default">
                {interest}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Languages className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Languages</h3>
          </div>
          
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-foreground">{lang.name}</span>
                <Badge variant="outline" className="text-primary border-primary">
                  {lang.level}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  )
}