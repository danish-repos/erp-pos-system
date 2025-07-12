"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {type User, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile} from "firebase/auth"
import { ref, set } from "firebase/database"
import { auth, database } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

const SINGLE_USER_EMAIL = process.env.NEXT_PUBLIC_SINGLE_USER_EMAIL || ""
const SINGLE_USER_PASSWORD = process.env.NEXT_PUBLIC_SINGLE_USER_PASSWORD || ""
const SINGLE_USER_NAME = process.env.NEXT_PUBLIC_SINGLE_USER_NAME || ""

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Check if it's the authorized single user
      if (email.toLowerCase() !== SINGLE_USER_EMAIL.toLowerCase()) {
        console.log(email, SINGLE_USER_EMAIL)
        toast({
          title: "Access Denied",
          description: "This email is not authorized to access the system.",
          variant: "destructive",
        })
        return
      }

      // Check if password matches
      if (password !== SINGLE_USER_PASSWORD) {
        toast({
          title: "Invalid Credentials",
          description: "Email or password is incorrect.",
          variant: "destructive",
        })
        return
      }

      // Check if Firebase is initialized
      if (!auth) {
        toast({
          title: "Service Unavailable",
          description: "Authentication service is not available. Please try again later.",
          variant: "destructive",
        })
        return
      }

      // Sign in with Firebase using the single user credentials
      const userCredential = await signInWithEmailAndPassword(auth, SINGLE_USER_EMAIL, SINGLE_USER_PASSWORD)

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: SINGLE_USER_NAME,
      })

      // Log login attempt
      if (database) {
        const loginLog = {
          email: email,
          name: SINGLE_USER_NAME,
          loginTime: new Date().toISOString(),
          ip: "unknown", // You can get this from request headers in a real app
          userAgent: navigator.userAgent,
        }
        
        const logRef = ref(database, `loginLogs/${Date.now()}`)
        await set(logRef, loginLog)
      }

      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${SINGLE_USER_NAME}.`,
      })
    } catch (error: unknown) {
      let errorMessage = "Failed to sign in"
      const err = error as { code?: string; message?: string }
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later"
          break
        default:
          errorMessage = err.message || errorMessage
      }
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      // Log logout attempt
      if (user && database) {
        const logoutLog = {
          email: user.email,
          name: SINGLE_USER_NAME,
          logoutTime: new Date().toISOString(),
          ip: "unknown",
          userAgent: navigator.userAgent,
        }
        
        const logRef = ref(database, `logoutLogs/${Date.now()}`)
        await set(logRef, logoutLog)
      }

      if (auth) {
        await signOut(auth)
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      })
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast({
        title: "Sign Out Failed",
        description: err.message || "Sign out failed",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
