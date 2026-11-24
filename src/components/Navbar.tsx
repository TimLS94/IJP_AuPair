import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { signOut, useAuth } from '../lib/auth'

const links = [
  { to: '/familien', label: 'Au-pair finden' },
  { to: '/aupair', label: 'Au-pair werden' },
  { to: '/#sprachschule', label: 'Sprachschule' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  const account = !session
    ? { to: '/login', label: 'Anmelden' }
    : profile?.role === 'admin'
      ? { to: '/admin', label: 'Admin' }
      : profile?.role === 'aupair'
        ? { to: '/aupair', label: 'Mein Profil' }
        : { to: '/familien', label: 'Merkliste' }

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/80 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-coral font-display text-sm font-semibold text-white">
            ij
          </span>
          <span className="font-display text-lg font-medium">
            IJP <span className="text-ink/50">Au-pair</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm transition hover:text-coral ${isActive && !l.to.includes('#') ? 'text-coral' : 'text-ink/70'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to={account.to} className="text-sm text-ink/70 transition hover:text-coral">
            {account.label}
          </Link>
          {session && (
            <button type="button" onClick={logout} aria-label="Abmelden" className="text-ink/60 hover:text-coral">
              <LogOut size={18} />
            </button>
          )}
          <Link to="/kontakt" className="btn-primary !px-5 !py-2.5">
            IJP kontaktieren
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="container-x flex animate-pop flex-col gap-1 pb-5 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-2xl px-3 py-3 text-lg font-display hover:bg-sand">
              {l.label}
            </Link>
          ))}
          <Link to={account.to} className="rounded-2xl px-3 py-3 text-lg font-display hover:bg-sand">
            {account.label}
          </Link>
          {session && (
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl px-3 py-3 text-left text-lg font-display hover:bg-sand"
            >
              Abmelden
            </button>
          )}
          <Link to="/kontakt" className="btn-primary mt-2">
            IJP kontaktieren
          </Link>
        </nav>
      )}
    </header>
  )
}
