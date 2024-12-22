import { User as SupabaseUser } from '@supabase/supabase-js'
import { ReactNode } from 'react'

export type User = SupabaseUser

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export interface AuthProviderProps {
  children: ReactNode
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationData extends LoginCredentials {
  passwordConfirm: string
}