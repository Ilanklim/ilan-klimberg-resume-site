import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { GraduationCap, Award, BookOpen } from "lucide-react"

export function EducationSection() {
  return (
    <Section variant="card">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Education</h2>
        
      </div>

      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300">
        <div className="flex items-start gap-6">
          <div className="bg-gradient-primary p-3 rounded-full">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Cornell University</h3>
                <p className="text-lg text-primary">Bachelor of Science in Computer and Information Science</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Aug 2022 – May 2026</p>
                <p className="text-muted-foreground">Ithaca, NY</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">GPA: 3.7/4.0</p>
                  <p className="text-sm text-muted-foreground">Dean's List (All Semesters)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Relevant Coursework</p>
                  <p className="text-sm text-muted-foreground">Functional Programming, OOP & Data Structures, Causal Inference</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Section>
  )
}