import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, User, LogIn } from "lucide-react"
import type { User as SupabaseUser, Session } from "@supabase/supabase-js"

export function AuthStatus() {
  const navigate = useNavigate()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSignIn = () => {
    navigate("/auth")
  }

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    )
  }

  if (!user || !session) {
    return (
      <Button 
        onClick={handleSignIn}
        variant="outline"
        className="bg-gradient-card border-primary/20 hover:shadow-glow transition-all duration-300"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>{user.email}</span>
      </div>
      <Button 
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="bg-gradient-card border-primary/20 hover:shadow-glow transition-all duration-300"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}