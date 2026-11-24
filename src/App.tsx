import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Password from './pages/Password'
import Admin from './pages/Admin'
import FamilyProfile from './pages/FamilyProfile'
import Families from './pages/Families'
import Matches from './pages/Matches'
import { Datenschutz, Impressum } from './pages/Legal'
import { AuthProvider } from './lib/auth'
import { configError, isConfigured } from './lib/supabase'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

function SetupNotice() {
  return (
    <div className="container-x py-24">
      <div className="card mx-auto max-w-lg p-8">
        <h1 className="text-3xl">Supabase-Konfiguration prüfen</h1>
        <p className="mt-3 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{configError}</p>
        <p className="mt-4 text-sm text-ink/70">
          Lokal: Werte in <code>.env</code> eintragen und den Dev-Server neu starten. Netlify: unter Environment
          variables korrigieren und neu deployen.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isConfigured) return <SetupNotice />

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollManager />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/familien" element={<Search />} />
            <Route path="/aupair" element={<Register />} />
            <Route path="/familie" element={<FamilyProfile />} />
            <Route path="/gastfamilien" element={<Families />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/passwort" element={<Password />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
