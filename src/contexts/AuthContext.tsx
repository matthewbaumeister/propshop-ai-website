'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: { message: string } }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0]
        }
        setUser(userData)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0]
          }
          setUser(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: { message: error.message } }
      }

      if (data.user) {
        // Check if the account has been soft deleted
        try {
          const response = await fetch('/api/auth/check-deleted', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          })

          const checkResult = await response.json()
          
          if (checkResult.deleted) {
            // Sign out the user immediately if account is deleted
            await supabase.auth.signOut()
            return { 
              error: { 
                message: 'This account has been deleted and cannot be accessed. To create a new account, please use the Sign Up option below.',
                requiresSignUp: true
              } 
            }
          }
        } catch (checkError) {
          console.error('Error checking account status:', checkError)
          // Continue with login if we can't check (fallback)
        }

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split('@')[0]
        }
        setUser(userData)
      }

      return {}
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name
          }
        }
      })

      if (error) {
        return { error: { message: error.message } }
      }

      // If signup is successful and we have user data, set the user immediately
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || name
        })
      }

      return {}
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a default context during build/prerender
    return {
      user: null,
      signIn: async () => ({ error: { message: 'Not available during build' } }),
      signUp: async () => ({ error: { message: 'Not available during build' } }),
      signOut: async () => {},
      loading: false
    }
  }
  return context
}
