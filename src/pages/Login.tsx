import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, MailCheck } from 'lucide-react'
import { authErrorText, signIn, signUp, useAuth } from '../lib/auth'
import { Chip } from '../components/ui'

type Mode = 'login' | 'register'

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  const [mode, setMode] = useState<Mode>(params.get('modus') === 'registrieren' ? 'register' : 'login')
  const [role, setRole] = useState<'aupair' | 'family'>(params.get('rolle') === 'aupair' ? 'aupair' : 'family')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkMail, setCheckMail] = useState(false)

  const next = params.get('next')

  useEffect(() => {
    if (session && profile) {
      const fallback = profile.role === 'aupair' ? '/aupair' : profile.role === 'admin' ? '/admin' : '/familien'
      navigate(next?.startsWith('/') ? next : fallback, { replace: true })
    }
  }, [session, profile, next, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { data, error } =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, role, firstName.trim(), lastName.trim())
    setBusy(false)
    if (error) {
      setError(authErrorText(error.message))
      return
    }
    // Ohne Session nach der Registrierung muss erst die E-Mail bestätigt werden.
    if (mode === 'register' && !data.session) setCheckMail(true)
  }

  if (checkMail) {
    return (
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-lg animate-pop text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sun">
            <MailCheck size={26} />
          </span>
          <h1 className="mt-6 text-4xl">Fast geschafft!</h1>
          <p className="mt-4 text-ink/60">
            Wir haben eine E-Mail an <strong>{email}</strong> geschickt. Bitte klicken Sie auf den Link darin, um Ihr
            Konto zu bestätigen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-12 md:py-20">
      <div className="card mx-auto max-w-md p-6 sm:p-10">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-sand p-1 text-sm">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setError('')
              }}
              className={`rounded-full py-2 transition ${mode === m ? 'bg-white font-medium shadow-sm' : 'text-ink/60'}`}
            >
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        <h1 className="mt-8 text-3xl">{mode === 'login' ? 'Willkommen zurück.' : 'Konto erstellen.'}</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {mode === 'register' && (
            <>
              <div>
                <p className="label">Ich bin</p>
                <div className="flex gap-2">
                  <Chip active={role === 'family'} onClick={() => setRole('family')}>
                    Gastfamilie
                  </Chip>
                  <Chip active={role === 'aupair'} onClick={() => setRole('aupair')}>
                    Au-pair
                  </Chip>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="l-first">
                    Vorname
                  </label>
                  <input
                    id="l-first"
                    required
                    maxLength={100}
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="l-last">
                    Nachname
                  </label>
                  <input
                    id="l-last"
                    required
                    maxLength={100}
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              {role === 'aupair' && <p className="-mt-2 text-xs text-ink/50">Familien sehen nur deinen Vornamen.</p>}
            </>
          )}
          <div>
            <label className="label" htmlFor="l-email">
              E-Mail
            </label>
            <input
              id="l-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="l-password">
              Passwort
            </label>
            <input
              id="l-password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            {mode === 'login' && (
              <Link to="/passwort" className="mt-2 inline-block text-xs text-ink/60 underline underline-offset-4">
                Passwort vergessen?
              </Link>
            )}
          </div>

          {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}

          {mode === 'register' && (
            <p className="text-xs text-ink/50">
              Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer{' '}
              <Link to="/datenschutz" className="underline underline-offset-4">
                Datenschutzerklärung
              </Link>
              .
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-coral w-full">
            {mode === 'login' ? 'Anmelden' : 'Konto erstellen'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
