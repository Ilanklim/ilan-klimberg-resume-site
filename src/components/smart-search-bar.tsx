import { useState } from "react"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api";

interface SearchResponse {
  question: string
  answer: string
  relevantDocuments?: Array<{
    content: string
    metadata: any
  }>
  success: boolean
}

export function SmartSearchBar() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setError(null)
    setResponse(null)
    
    try {
      console.log('🔍 Sending query to:', `${API_BASE_URL}/api/query`)
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Response data:', data)
      
      if (data.success) {
        setResponse({
          question: query,
          answer: data.answer,
          relevantDocuments: data.relevantDocuments || [],
          success: true
        })
        
        // Highlight relevant sections if metadata contains section info
        if (data.relevantDocuments && data.relevantDocuments.length > 0) {
          const sections = data.relevantDocuments
            .map(doc => doc.metadata?.section)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index)
          
          sections.forEach(sectionId => {
            const element = document.getElementById(sectionId)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              element.classList.add('highlight-section')
              setTimeout(() => element.classList.remove('highlight-section'), 3000)
            }
          })
        }
      } else {
        console.error('❌ API error:', data.error)
        setError(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(`Failed to connect to the AI service: ${error.message}`)
      }
    } finally {
      setIsSearching(false)
    }
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
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-full px-6 py-3 rounded-lg"
            style={{ minHeight: '48px' }}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {error && (
          <Card className="mt-4 p-6 bg-red-50 border-red-200 shadow-elegant animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 p-2 rounded-full flex-shrink-0">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Error</h4>
                <p className="text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          </Card>
        )}
        
        {response && (
          <Card className="mt-4 p-6 bg-gradient-card border-primary/20 shadow-elegant animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-primary p-2 rounded-full flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">{response.question}</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">{response.answer}</p>
                
                {response.relevantDocuments && response.relevantDocuments.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      📄 Sources: {response.relevantDocuments.length} relevant sections
                    </p>
                    <div className="space-y-2">
                      {response.relevantDocuments.slice(0, 2).map((doc, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            {doc.metadata?.type || 'Section'}:
                          </span>{' '}
                          {doc.content.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
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