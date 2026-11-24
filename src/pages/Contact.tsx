import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Clock, Loader2, Mail } from 'lucide-react'
import { site } from '../data/site'
import { saveMessage } from '../lib/store'
import { Chip } from '../components/ui'

const ROLES = ['Familie', 'Au-pair', 'Sprachschule', 'Sonstiges']

export default function Contact() {
  const [params] = useSearchParams()
  const aupair = params.get('aupair')
  const family = params.get('familie')
  const topic = params.get('thema')

  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    role: topic === 'sprachschule' ? 'Sprachschule' : family ? 'Au-pair' : 'Familie',
    name: '',
    email: '',
    phone: '',
    message: aupair
      ? `Hallo IJP-Team,\n\nwir interessieren uns für das Profil von ${aupair} und würden sie/ihn gern kennenlernen.\n\n`
      : family
        ? `Hallo IJP-Team,\n\nich interessiere mich für ${family} und würde die Familie gern kennenlernen.\n\n`
        : topic === 'sprachschule'
          ? 'Hallo IJP-Team,\n\nich möchte mehr über die Sprachschule erfahren.\n\n'
          : '',
  })

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveMessage(form)
      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError(`Senden hat nicht geklappt. Bitte schreiben Sie uns direkt an ${site.email}.`)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-lg animate-pop text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-cream">
            <Check size={26} />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl">Danke, {form.name.trim()}!</h1>
          <p className="mt-4 text-ink/60">Ihre Nachricht ist bei uns. Wir melden uns so schnell wie möglich.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/familien" className="btn-primary">
              Profile ansehen <ArrowRight size={16} />
            </Link>
            <Link to="/" className="btn-ghost">
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x grid gap-12 py-12 md:grid-cols-[5fr_6fr] md:py-16">
      <aside>
        <p className="eyebrow">Kontakt</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Sprechen wir miteinander.</h1>
        <p className="mt-4 max-w-md text-ink/60">
          Ob Sie ein Au-pair suchen, selbst eines werden möchten oder Fragen zur Sprachschule haben – das IJP-Team ist
          für Sie da.
        </p>

        <ul className="mt-10 space-y-4">
          <li className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sand">
              <Mail size={18} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/50">E-Mail</p>
              <a href={`mailto:${site.email}`} className="hover:text-coral">
                {site.email}
              </a>
            </div>
          </li>
          <li className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sand">
              <Clock size={18} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/50">Erreichbar</p>
              <p>{site.hours}</p>
            </div>
          </li>
        </ul>
      </aside>

      <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-10">
        {(aupair || family) && (
          <p className="rounded-2xl bg-sun/40 px-4 py-3 text-sm">
            Anfrage zum Profil von <strong>{aupair ?? family}</strong>
          </p>
        )}
        <div>
          <p className="label">Ich bin / es geht um</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Chip key={r} active={form.role === r} onClick={() => set('role', r)}>
                {r}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="c-name">
              Name
            </label>
            <input
              id="c-name"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="c-email">
              E-Mail
            </label>
            <input
              id="c-email"
              required
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            Telefon (optional)
          </label>
          <input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="c-message">
            Nachricht
          </label>
          <textarea
            id="c-message"
            required
            rows={6}
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Erzählen Sie uns kurz, worum es geht …"
            className="input resize-none"
          />
        </div>
        <p className="text-xs text-ink/50">
          Wir verwenden Ihre Angaben nur zur Bearbeitung Ihrer Anfrage. Mehr in der{' '}
          <Link to="/datenschutz" className="underline underline-offset-4">
            Datenschutzerklärung
          </Link>
          .
        </p>
        {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
        <button type="submit" disabled={busy} className="btn-coral w-full">
          Nachricht senden {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  )
}
