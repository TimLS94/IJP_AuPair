import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Camera,
  Car,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  PartyPopper,
  PawPrint,
  Ticket,
  Waves,
} from 'lucide-react'
import { DIETS, LANGUAGES, LEVELS, type Diet, type Level } from '../data/aupairs'
import { AREAS, CHILD_AGES, STATES, TASKS, type Area, type Family } from '../data/families'
import { formatMonth, nextMonths, removePhoto, uploadPhoto } from '../lib/store'
import { fetchOwnFamily, saveOwnFamily } from '../lib/families'
import { useAuth } from '../lib/auth'
import { images } from '../data/site'
import { Chip, Img } from '../components/ui'

const STEPS = ['Ihre Familie', 'Kinder & Alltag', 'Ihr Angebot', 'Zeitraum & Vorstellung']
const DURATIONS = [6, 10, 12]
const MAX_PHOTO = 5 * 1024 * 1024

const STATUS_TEXT: Record<NonNullable<Family['status']>, string> = {
  pending: 'Wird von IJP geprüft – danach ist Ihr Profil für Au-pairs sichtbar.',
  approved: 'Freigegeben – angemeldete Au-pairs sehen Ihr Profil.',
  rejected: 'Nicht freigegeben. Bitte melden Sie sich bei IJP.',
}

export default function FamilyProfile() {
  const { session, profile, loading } = useAuth()
  const userId = profile?.role === 'family' ? session?.user.id : undefined

  const months = useMemo(() => nextMonths(12), [])
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [existing, setExisting] = useState<Family | null>(null)
  const [loadingOwn, setLoadingOwn] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    area: 'Großstadt' as Area,
    children: '1',
    childAges: [] as string[],
    languages: [] as string[],
    tasks: [] as string[],
    minGerman: 'A2' as Level,
    needsLicense: false,
    pets: false,
    startFrom: months[2],
    duration: 12,
    about: '',
    hoursPerWeek: '30',
    pocketMoney: '280',
    courseSupport: true,
    ownBathroom: false,
    carPrivate: false,
    transitTicket: false,
    singleParent: false,
    specialNeeds: false,
    needsSwimming: false,
    nonsmokerRequired: true,
    diet: 'Alles' as Diet,
    consent: false,
  })

  useEffect(() => {
    if (!userId) return
    setLoadingOwn(true)
    fetchOwnFamily(userId)
      .then((own) => {
        setExisting(own)
        if (own) {
          setForm({
            name: own.name,
            city: own.city,
            state: own.state,
            area: own.area,
            children: String(own.children),
            childAges: own.childAges,
            languages: own.languages,
            tasks: own.tasks,
            minGerman: own.minGerman,
            needsLicense: own.needsLicense,
            pets: own.pets,
            startFrom: own.startFrom,
            duration: own.duration,
            about: own.about,
            hoursPerWeek: String(own.hoursPerWeek),
            pocketMoney: String(own.pocketMoney),
            courseSupport: own.courseSupport,
            ownBathroom: own.ownBathroom,
            carPrivate: own.carPrivate,
            transitTicket: own.transitTicket,
            singleParent: own.singleParent,
            specialNeeds: own.specialNeeds,
            needsSwimming: own.needsSwimming,
            nonsmokerRequired: own.nonsmokerRequired,
            diet: own.diet,
            consent: true,
          })
        } else {
          setForm((f) => ({ ...f, name: profile?.name ?? '' }))
        }
      })
      .catch((err) => {
        console.error(err)
        setError('Profil konnte nicht geladen werden.')
      })
      .finally(() => setLoadingOwn(false))
  }, [userId, profile?.name])

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : undefined), [photo])
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const startOptions = months.includes(form.startFrom) ? months : [form.startFrom, ...months]

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const toggleIn = (key: 'childAges' | 'languages' | 'tasks', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (step === 1 && form.childAges.length === 0) {
      setError('Bitte wählen Sie mindestens eine Altersgruppe.')
      return
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    if (!userId) return
    setBusy(true)
    try {
      let photoPath = existing?.photoPath ?? null
      if (photo) {
        const newPath = await uploadPhoto(userId, photo)
        if (photoPath) await removePhoto(photoPath)
        photoPath = newPath
      }
      await saveOwnFamily(userId, {
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state,
        area: form.area,
        children: Number(form.children),
        childAges: form.childAges,
        languages: form.languages,
        tasks: form.tasks,
        minGerman: form.minGerman,
        needsLicense: form.needsLicense,
        pets: form.pets,
        startFrom: form.startFrom,
        duration: form.duration,
        about: form.about.trim(),
        hoursPerWeek: Number(form.hoursPerWeek),
        pocketMoney: Number(form.pocketMoney),
        courseSupport: form.courseSupport,
        ownBathroom: form.ownBathroom,
        carPrivate: form.carPrivate,
        transitTicket: form.transitTicket,
        singleParent: form.singleParent,
        specialNeeds: form.specialNeeds,
        needsSwimming: form.needsSwimming,
        nonsmokerRequired: form.nonsmokerRequired,
        diet: form.diet,
        photoPath,
      })
      setExisting(await fetchOwnFamily(userId))
      setPhoto(null)
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError('Speichern hat nicht geklappt. Bitte versuchen Sie es erneut.')
    } finally {
      setBusy(false)
    }
  }

  const onPhoto = (file?: File) => {
    if (!file) return
    if (file.size > MAX_PHOTO) {
      setError('Das Foto ist zu groß (max. 5 MB).')
      return
    }
    setError('')
    setPhoto(file)
  }

  if (done) {
    return (
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-lg animate-pop text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sun">
            <PartyPopper size={26} />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl">Gespeichert!</h1>
          <p className="mt-4 text-ink/60">
            IJP prüft Ihr Profil kurz. Danach ist es für angemeldete Au-pairs sichtbar. Merken Sie sich in der
            Zwischenzeit gern passende Au-pairs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/familien" className="btn-primary">
              Au-pairs ansehen <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(false)
                setStep(0)
              }}
              className="btn-ghost"
            >
              Profil bearbeiten
            </button>
          </div>
        </div>
      </div>
    )
  }

  const gate =
    loading || loadingOwn ? (
      <div className="card grid place-items-center p-16">
        <Loader2 className="animate-spin text-ink/40" />
      </div>
    ) : !session ? (
      <div className="card p-6 sm:p-10">
        <h2 className="text-3xl">Zuerst ein kostenloses Konto.</h2>
        <p className="mt-3 text-ink/60">
          Mit Ihrem Konto können Sie Ihr Profil jederzeit bearbeiten. Ihre E-Mail-Adresse sieht nur IJP.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login?modus=registrieren&rolle=family&next=/familie" className="btn-coral">
            Konto erstellen <ArrowRight size={16} />
          </Link>
          <Link to="/login?next=/familie" className="btn-ghost">
            Ich habe schon ein Konto
          </Link>
        </div>
      </div>
    ) : !userId ? (
      <div className="card p-6 sm:p-10">
        <h2 className="text-3xl">Kein Gastfamilien-Konto.</h2>
        <p className="mt-3 text-ink/60">Familienprofile können nur mit einem Gastfamilien-Konto angelegt werden.</p>
        <Link to="/gastfamilien" className="btn-primary mt-8">
          Familien ansehen <ArrowRight size={16} />
        </Link>
      </div>
    ) : null

  return (
    <div className="container-x grid gap-12 py-12 md:grid-cols-[5fr_6fr] md:py-16">
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="eyebrow">Für Familien</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Ihr Familienprofil.</h1>
        <p className="mt-4 max-w-md text-ink/60">
          Stellen Sie Ihre Familie vor, damit Au-pairs Sie finden. Merken Sie und ein Au-pair sich gegenseitig, ist es
          ein Match – und IJP stellt den Kontakt her.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {[
            'Nur für angemeldete Au-pairs sichtbar',
            'Von IJP geprüft, bevor es erscheint',
            'Kontaktdaten gibt nur IJP weiter',
          ].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-forest text-cream">
                <Check size={12} />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <Img
          src={images.family}
          alt="Familie unterwegs"
          className="mt-10 hidden aspect-[4/3] w-full rounded-[2rem] rounded-bl-[5rem] md:block"
        />
      </aside>

      {gate ?? (
        <form onSubmit={onSubmit} className="card p-6 sm:p-10">
          {existing?.status && (
            <p
              className={`mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${existing.status === 'approved' ? 'bg-forest/10 text-forest' : existing.status === 'rejected' ? 'bg-coral/10 text-coral' : 'bg-sun/40'}`}
            >
              {existing.status === 'approved' ? (
                <Check size={16} className="mt-0.5 shrink-0" />
              ) : (
                <Clock size={16} className="mt-0.5 shrink-0" />
              )}
              {STATUS_TEXT[existing.status]}
            </p>
          )}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-coral' : 'bg-sand'}`} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-ink/50">
            Schritt {step + 1} von {STEPS.length}
          </p>
          <h2 className="mt-1 text-3xl">{STEPS[step]}</h2>

          <div key={step} className="mt-8 animate-pop space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="label" htmlFor="fp-name">
                    Anzeigename
                  </label>
                  <input
                    id="fp-name"
                    required
                    autoFocus
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="z. B. Familie Müller"
                    className="input"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="fp-city">
                      Wohnort
                    </label>
                    <input
                      id="fp-city"
                      required
                      maxLength={100}
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      placeholder="Stadt oder Gemeinde"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="fp-state">
                      Bundesland
                    </label>
                    <select
                      id="fp-state"
                      required
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                      className="input"
                    >
                      <option value="" disabled>
                        Bitte wählen
                      </option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="label">Wohnlage</p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map((a) => (
                      <Chip key={a} active={form.area === a} onClick={() => set('area', a)}>
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Foto (optional)</p>
                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-ink/20 bg-white p-3 transition hover:border-ink/50">
                    {previewUrl || existing?.photo ? (
                      <Img src={previewUrl ?? existing?.photo} alt="Ihr Foto" className="h-16 w-16 rounded-xl" />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-xl bg-sand">
                        <Camera size={20} className="text-ink/50" />
                      </span>
                    )}
                    <span className="text-sm text-ink/60">
                      {photo ? photo.name : existing?.photo ? 'Foto ändern' : 'Foto hochladen (JPG, PNG, max. 5 MB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => onPhoto(e.target.files?.[0])}
                    />
                  </label>
                  <p className="mt-1.5 text-xs text-ink/50">
                    Zum Beispiel Ihr Zuhause oder die Umgebung. Fotos von Kindern empfehlen wir nicht.
                  </p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <label className="label" htmlFor="fp-children">
                      Anzahl Kinder
                    </label>
                    <input
                      id="fp-children"
                      required
                      type="number"
                      min={1}
                      max={10}
                      value={form.children}
                      onChange={(e) => set('children', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <p className="label">Altersgruppen</p>
                    <div className="flex flex-wrap gap-2">
                      {CHILD_AGES.map((a) => (
                        <Chip key={a} active={form.childAges.includes(a)} onClick={() => toggleIn('childAges', a)}>
                          {a}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="label">Aufgaben neben der Kinderbetreuung</p>
                  <div className="flex flex-wrap gap-2">
                    {TASKS.map((t) => (
                      <Chip key={t} active={form.tasks.includes(t)} onClick={() => toggleIn('tasks', t)}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Sprachen zu Hause (außer Deutsch)</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <Chip key={l} active={form.languages.includes(l)} onClick={() => toggleIn('languages', l)}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Gewünschtes Deutsch (mindestens)</p>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <Chip key={l} active={form.minGerman === l} onClick={() => set('minGerman', l)}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Rahmen</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={form.needsLicense} onClick={() => set('needsLicense', !form.needsLicense)}>
                      <Car size={14} /> Führerschein nötig
                    </Chip>
                    <Chip active={form.pets} onClick={() => set('pets', !form.pets)}>
                      <PawPrint size={14} /> Haustiere im Haushalt
                    </Chip>
                    <Chip active={form.needsSwimming} onClick={() => set('needsSwimming', !form.needsSwimming)}>
                      <Waves size={14} /> Au-pair muss schwimmen können
                    </Chip>
                    <Chip
                      active={form.nonsmokerRequired}
                      onClick={() => set('nonsmokerRequired', !form.nonsmokerRequired)}
                    >
                      Nur Nichtraucher
                    </Chip>
                    <Chip active={form.specialNeeds} onClick={() => set('specialNeeds', !form.specialNeeds)}>
                      Kind mit besonderem Förderbedarf
                    </Chip>
                    <Chip active={form.singleParent} onClick={() => set('singleParent', !form.singleParent)}>
                      Alleinerziehend
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="label">Ernährung im Haushalt</p>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <Chip key={d} active={form.diet === d} onClick={() => set('diet', d)}>
                        {d === 'Alles' ? 'Keine Besonderheiten' : d}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="fp-hours">
                      Stunden pro Woche
                    </label>
                    <input
                      id="fp-hours"
                      required
                      type="number"
                      min={1}
                      max={30}
                      value={form.hoursPerWeek}
                      onChange={(e) => set('hoursPerWeek', e.target.value)}
                      className="input"
                    />
                    <p className="mt-1.5 text-xs text-ink/50">Höchstens 30 Stunden pro Woche.</p>
                  </div>
                  <div>
                    <label className="label" htmlFor="fp-money">
                      Taschengeld (€ pro Monat)
                    </label>
                    <input
                      id="fp-money"
                      required
                      type="number"
                      min={0}
                      max={2000}
                      value={form.pocketMoney}
                      onChange={(e) => set('pocketMoney', e.target.value)}
                      className="input"
                    />
                    <p className="mt-1.5 text-xs text-ink/50">
                      Bitte den aktuellen gesetzlichen Mindestbetrag beachten.
                    </p>
                  </div>
                </div>
                <div>
                  <p className="label">Das bieten Sie zusätzlich (neben Zimmer und Verpflegung)</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={form.courseSupport} onClick={() => set('courseSupport', !form.courseSupport)}>
                      <GraduationCap size={14} /> Zuschuss zum Deutschkurs
                    </Chip>
                    <Chip active={form.ownBathroom} onClick={() => set('ownBathroom', !form.ownBathroom)}>
                      <Bath size={14} /> Eigenes Bad
                    </Chip>
                    <Chip active={form.carPrivate} onClick={() => set('carPrivate', !form.carPrivate)}>
                      <Car size={14} /> Auto auch privat
                    </Chip>
                    <Chip active={form.transitTicket} onClick={() => set('transitTicket', !form.transitTicket)}>
                      <Ticket size={14} /> ÖPNV-Ticket
                    </Chip>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="fp-from">
                      Start ab
                    </label>
                    <select
                      id="fp-from"
                      value={form.startFrom}
                      onChange={(e) => set('startFrom', e.target.value)}
                      className="input"
                    >
                      {startOptions.map((m) => (
                        <option key={m} value={m}>
                          {formatMonth(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="label">Dauer</p>
                    <div className="flex gap-2">
                      {DURATIONS.map((d) => (
                        <Chip key={d} active={form.duration === d} onClick={() => set('duration', d)}>
                          {d} Monate
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="fp-about">
                    Stellen Sie Ihre Familie vor
                  </label>
                  <textarea
                    id="fp-about"
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    value={form.about}
                    onChange={(e) => set('about', e.target.value)}
                    placeholder="Wie sieht Ihr Alltag aus? Was unternehmen Sie gern? Was erwartet das Au-pair bei Ihnen (Zimmer, Umgebung, Aufgaben)?"
                    className="input resize-none"
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-coral"
                  />
                  <span>
                    Ich bin einverstanden, dass IJP unser Familienprofil nach Prüfung für angemeldete Au-pairs auf
                    dieser Website sichtbar macht
                    {form.specialNeeds && ' – ausdrücklich auch die freiwillige Angabe, dass ein Kind Förderbedarf hat'}
                    . Widerruf jederzeit per E-Mail möglich. Mehr in der{' '}
                    <Link to="/datenschutz" target="_blank" className="underline underline-offset-4">
                      Datenschutzerklärung
                    </Link>
                    .
                  </span>
                </label>
              </>
            )}
          </div>

          {error && <p className="mt-6 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}

          <div className="mt-10 flex items-center justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                <ArrowLeft size={16} /> Zurück
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={busy} className={step === STEPS.length - 1 ? 'btn-coral' : 'btn-primary'}>
              {step < STEPS.length - 1 ? 'Weiter' : existing ? 'Änderungen speichern' : 'Profil erstellen'}
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
