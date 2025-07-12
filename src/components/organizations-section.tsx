import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, Users, BookOpen, Scale } from "lucide-react"

interface OrganizationItem {
  title: string
  organization: string
  location: string
  period: string
  description: string[]
  icon: React.ReactNode
}

const organizations: OrganizationItem[] = [
  {
    title: "Head of Education",
    organization: "Cornell Blockchain Club",
    location: "Ithaca, NY",
    period: "Jan – Dec 2024",
    description: [
      "Taught Cornell's Intro to Blockchain (CS 1998), lead 6 TAs, and launched first-ever labs on wallets, NFTs, and DEXs"
    ],
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Accelerator Member",
    organization: "Cornell Blockchain Club",
    location: "Ithaca, NY",
    period: "Nov 2023 – May 2024",
    description: [
      "Raised over $3.2 million in funding for incubated companies",
      "Recruited speakers, reviewed pitch decks, and initiated VC meetings for startups",
      "Merged with the Initiative of Cryptocurrencies and Contracts (IC3) as its official accelerator"
    ],
    icon: <Users className="h-6 w-6" />
  },
  {
    title: "Board Member",
    organization: "Cornell CALS Academic Integrity Hearing Board",
    location: "Ithaca, NY",
    period: "Sept 2023 – Present",
    description: [
      "Advise on academic integrity cases recommending action to the dean of College of Agriculture and Life Science (CALS)"
    ],
    icon: <Scale className="h-6 w-6" />
  }
]

export function OrganizationsSection() {
  return (
    <Section variant="gradient">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Organizations & Activities</h2>
        <p className="text-lg text-muted-foreground">Leadership roles and community involvement</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org, index) => (
          <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-primary p-2 rounded-lg text-white">
                {org.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{org.title}</h3>
                <p className="text-sm text-primary font-semibold">{org.organization}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{org.period}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{org.location}</span>
              </div>
            </div>

            <ul className="space-y-2">
              {org.description.map((desc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-foreground leading-relaxed">{desc}</p>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}