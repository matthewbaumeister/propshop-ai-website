'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name?: string
}

interface ProfileData {
  first_name?: string
  last_name?: string
  company?: string
  role?: string
  phone?: string
  bio?: string
  theme_preference?: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<{ error?: { message: string; requiresSignUp?: boolean; requiresVerification?: boolean } }>
  signUp: (email: string, password: string, firstName: string, profileData?: ProfileData) => Promise<{ error?: { message: string } }>
  signOut: () => Promise<void>
  loading: boolean
  saveProfileAfterVerification: (profileData: ProfileData) => Promise<void>
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
      if (session?.user && session.user.email_confirmed_at) {
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
        if (session?.user && session.user.email_confirmed_at) {
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
        // Check if the account has been marked as deleted
        try {
          const { data: deletionCheck, error: checkError } = await supabase
            .rpc('check_user_deletion_status', { user_uuid: data.user.id })
          
          if (checkError) {
            console.error('Error checking deletion status:', checkError)
          } else if (deletionCheck) {
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

        // Only set user if email is confirmed
        if (data.user.email_confirmed_at) {
          const userData = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split('@')[0]
          }
          setUser(userData)
        } else {
          // Email not confirmed - sign them out and show error
          await supabase.auth.signOut()
          return { 
            error: { 
              message: 'Please check your email and click the verification link before signing in.',
              requiresVerification: true
            } 
          }
        }
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, profileData?: ProfileData) => {
    try {
      // First, clean up any deleted user data for this email
      // This ensures new signups work even if there was a previous deleted account
      try {
        const { data: cleanupResult, error: cleanupError } = await supabase
          .rpc('cleanup_deleted_user_data', { user_email: email })
        
        if (cleanupError) {
          console.error('Error cleaning up deleted user data:', cleanupError)
        } else if (cleanupResult) {
          console.log('Cleaned up deleted user data for email:', email)
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError)
        // Continue with signup even if cleanup fails
      }

      // Debug: Log what we're sending
      const userData = {
        name: firstName,
        full_name: firstName,
        first_name: profileData?.first_name || firstName,
        last_name: profileData?.last_name || '',
        company: profileData?.company || '',
        role: profileData?.role || 'user',
        phone: profileData?.phone || '',
        bio: profileData?.bio || ''
      };
      
      console.log('SignUp - Sending data to Supabase:', userData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) {
        console.error('SignUp - Supabase error:', error);
        return { error: { message: error.message } }
      }

      // Debug: Log what Supabase returned
      console.log('SignUp - Supabase response:', data);
      if (data.user) {
        console.log('SignUp - User metadata:', data.user.user_metadata);
      }

      // Don't set user immediately - they need to verify email first
      // The user will only be set after email verification is complete
      // This prevents them from being "logged in" before verification

      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const saveProfileAfterVerification = async (profileData: ProfileData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        console.error('Failed to save profile after verification:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving profile after verification:', error)
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
    loading,
    saveProfileAfterVerification
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
      loading: false,
      saveProfileAfterVerification: async () => {}
    }
  }
  return context
}
