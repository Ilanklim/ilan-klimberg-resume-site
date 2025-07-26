import React, { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Search, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_BASE_URL } from "@/lib/api"
import type { User, Session } from "@supabase/supabase-js"

interface SearchResponse {
  question: string
  answer: string
  dailyCount?: number
  maxQueries?: number
  remainingQueries?: number
  success: boolean
}

export function AnonymousSearchBar() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [dailyQueries, setDailyQueries] = useState(0)

  // Initialize anonymous authentication
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession?.user) {
          if (mounted) {
            setSession(existingSession);
            setUser(existingSession.user);
            await fetchDailyQueryCount(existingSession.user.id);
          }
        } else {
          // Create anonymous user
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.error('Anonymous auth error:', error);
            if (mounted) {
              setError('Failed to initialize. Please refresh the page.');
            }
          } else if (data.session && data.user && mounted) {
            setSession(data.session);
            setUser(data.user);
            await fetchDailyQueryCount(data.user.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError('Failed to initialize. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchDailyQueryCount(session.user.id);
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchDailyQueryCount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_daily_query_count', { target_user_id: userId });
      
      if (!error && typeof data === 'number') {
        setDailyQueries(data);
      }
    } catch (err) {
      console.error('Error fetching daily query count:', err);
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery || !session) return
    
    // Basic client-side validation
    if (trimmedQuery.length > 500) {
      setError('Question is too long (max 500 characters)')
      return
    }

    // Check if user has reached daily limit
    if (dailyQueries >= 10) {
      setError('You have reached your daily limit of 10 queries. Try again tomorrow!')
      return
    }
    
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
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ question: trimmedQuery }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ HTTP error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Response data:', data)
      
      if (data.success) {
        setResponse({
          question: trimmedQuery,
          answer: data.answer,
          dailyCount: data.dailyCount,
          maxQueries: data.maxQueries,
          remainingQueries: data.remainingQueries,
          success: true
        })
        
        // Update local daily count
        setDailyQueries(data.dailyCount || dailyQueries + 1)
        
        // Clear the input
        setQuery("")
      } else {
        console.error('❌ API error:', data.error)
        setError(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      console.error('❌ Search error:', error)
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (error.message.includes('429')) {
        setError('Daily limit reached. Try again tomorrow!')
      } else {
        setError(`Failed to connect to the AI service. Please try again later.`)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  if (isInitializing) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Card className="p-6 bg-gradient-card border-primary/20 shadow-elegant">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Initializing...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!user || !session) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            Failed to initialize. Please refresh the page to try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const remainingQueries = Math.max(0, 10 - dailyQueries)

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Ask me anything about Ilan's experience • {remainingQueries}/10 queries remaining today
        </p>
      </div>
      
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
              disabled={isSearching || remainingQueries === 0}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !query.trim() || remainingQueries === 0}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-full px-6 py-3 rounded-lg disabled:opacity-50"
            style={{ minHeight: '48px' }}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>

        {remainingQueries === 0 && (
          <Alert className="mt-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-700">
              You've reached your daily limit of 10 queries. Come back tomorrow for more!
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Card className="mt-4 p-6 bg-red-50 border-red-200 shadow-elegant animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 p-2 rounded-full flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-white" />
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
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    📊 Query {response.dailyCount || dailyQueries}/{response.maxQueries || 10} • {response.remainingQueries || remainingQueries} remaining today
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}