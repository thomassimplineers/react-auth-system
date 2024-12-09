import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        if (error) throw error
        setUser(session?.user ?? null)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) toast.success('Successfully authenticated!')
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}