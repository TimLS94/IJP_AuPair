import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Role = 'aupair' | 'family' | 'admin'

export interface Profile {
  id: string
  role: Role
  name: string
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ session: null, profile: null, loading: true })

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('id, role, name').eq('id', userId).maybeSingle()
  return data as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, profile: null, loading: true })

  useEffect(() => {
    let active = true

    const apply = async (session: Session | null) => {
      const profile = session ? await loadProfile(session.user.id) : null
      if (active) setState({ session, profile, loading: false })
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session))

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase-Callbacks dürfen nicht direkt weitere Supabase-Aufrufe awaiten.
      setTimeout(() => apply(session), 0)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export function signUp(email: string, password: string, role: 'aupair' | 'family', name: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name }, emailRedirectTo: `${window.location.origin}/login` },
  })
}

export function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/passwort` })
}

export function updatePassword(password: string) {
  return supabase.auth.updateUser({ password })
}

export function authErrorText(message: string) {
  if (/invalid login credentials/i.test(message)) return 'E-Mail oder Passwort ist falsch.'
  if (/email not confirmed/i.test(message)) return 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.'
  if (/already registered/i.test(message)) return 'Diese E-Mail-Adresse ist bereits registriert.'
  if (/password should be at least/i.test(message)) return 'Das Passwort muss mindestens 8 Zeichen haben.'
  if (/rate limit/i.test(message)) return 'Zu viele Versuche. Bitte später erneut versuchen.'
  return 'Das hat nicht geklappt. Bitte erneut versuchen.'
}
