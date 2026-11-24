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
import { Datenschutz, Impressum } from './pages/Legal'
import { AuthProvider } from './lib/auth'
import { isConfigured } from './lib/supabase'

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
        <h1 className="text-3xl">Supabase fehlt noch</h1>
        <p className="mt-3 text-sm text-ink/70">
          Bitte <code>.env.example</code> nach <code>.env</code> kopieren, <code>VITE_SUPABASE_URL</code> und{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> eintragen und den Dev-Server neu starten.
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
