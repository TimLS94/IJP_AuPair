import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { authErrorText, sendPasswordReset, updatePassword, useAuth } from '../lib/auth'

/** Ohne Login: Link anfordern. Mit Login (auch über den Link aus der E-Mail): neues Passwort setzen. */
export default function Password() {
  const { session, loading } = useAuth()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = session ? await updatePassword(value) : await sendPasswordReset(value.trim())
    setBusy(false)
    if (error) setError(authErrorText(error.message))
    else setDone(true)
  }

  if (loading) return null

  return (
    <div className="container-x py-12 md:py-20">
      <div className="card mx-auto max-w-md p-6 sm:p-10">
        <h1 className="text-3xl">{session ? 'Neues Passwort' : 'Passwort vergessen?'}</h1>

        {done ? (
          <div className="mt-6 animate-pop">
            <p className="flex items-start gap-3 text-ink/70">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-cream">
                <Check size={14} />
              </span>
              {session
                ? 'Ihr Passwort wurde geändert.'
                : 'Falls ein Konto mit dieser E-Mail existiert, haben wir Ihnen einen Link geschickt.'}
            </p>
            <Link to="/" className="btn-ghost mt-6">
              Zur Startseite
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label className="label" htmlFor="p-value">
                {session ? 'Neues Passwort' : 'E-Mail'}
              </label>
              <input
                id="p-value"
                required
                type={session ? 'password' : 'email'}
                minLength={session ? 8 : undefined}
                autoComplete={session ? 'new-password' : 'email'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input"
              />
            </div>
            {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
            <button type="submit" disabled={busy} className="btn-coral w-full">
              {session ? 'Passwort speichern' : 'Link senden'} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
