import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SearchResponse {
  question: string
  answer: string
  relevantSections: string[]
}

const searchResponses: Record<string, SearchResponse> = {
  "data science": {
    question: "What is your experience in data science?",
    answer: "I have extensive experience in data science through my coursework in Causal Inference and practical applications at ARB Interactive, where I built SQL dashboards for financial KPIs and wrote 30+ SQL queries for data analytics.",
    relevantSections: ["experience", "skills", "education"]
  },
  "sql": {
    question: "Have you worked with SQL?",
    answer: "Yes, I have significant SQL experience. At ARB Interactive, I built SQL dashboards in Metabase for financial KPIs and wrote 30+ SQL queries across all company teams, leading to a 22% increase in Metabase traffic.",
    relevantSections: ["experience", "skills"]
  },
  "ocaml": {
    question: "Tell me about your projects involving OCaml.",
    answer: "I implemented a complete Database Management System in OCaml (Mar 2024 – May 2024), including parser, lexer, UI, and database structure representation. This project demonstrates my functional programming skills and understanding of database systems.",
    relevantSections: ["experience", "skills", "education"]
  },
  "blockchain": {
    question: "What's your blockchain experience?",
    answer: "I'm deeply involved in blockchain: Co-founded Silicore.io (secured $32K funding), founded KBCrypto (generated $10K+ revenue), spoke at Stellar Meridian 2024, and led Cornell Blockchain website development.",
    relevantSections: ["experience", "skills"]
  },
  "web development": {
    question: "What web development experience do you have?",
    answer: "I have full-stack experience including developing responsive websites from scratch with HTML, CSS, JavaScript, optimizing frontend structures, and working with frameworks. I reduced onboarding time by 40% through better code organization.",
    relevantSections: ["experience", "skills"]
  }
}

export function SmartSearchBar() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    // Simulate AI processing delay
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase()
      let foundResponse: SearchResponse | null = null
      
      // Find matching response based on keywords
      for (const [keyword, resp] of Object.entries(searchResponses)) {
        if (normalizedQuery.includes(keyword)) {
          foundResponse = resp
          break
        }
      }
      
      if (!foundResponse) {
        foundResponse = {
          question: query,
          answer: "I'd be happy to discuss this further! Please feel free to reach out via email or LinkedIn for more specific questions about my experience and projects.",
          relevantSections: ["contact"]
        }
      }
      
      setResponse(foundResponse)
      setIsSearching(false)
      
      // Highlight relevant sections
      foundResponse.relevantSections.forEach(sectionId => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('highlight-section')
          setTimeout(() => element.classList.remove('highlight-section'), 3000)
        }
      })
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Ask me anything... e.g., 'What is your experience in data science?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {response && (
          <Card className="mt-4 p-6 bg-gradient-card border-primary/20 shadow-elegant animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-primary p-2 rounded-full flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{response.question}</h4>
                <p className="text-muted-foreground leading-relaxed">{response.answer}</p>
                {response.relevantSections.length > 0 && (
                  <div className="mt-3 text-xs text-primary">
                    Highlighted sections: {response.relevantSections.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}