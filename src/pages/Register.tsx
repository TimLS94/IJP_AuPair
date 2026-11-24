import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, Car, Check, Clock, Loader2, PartyPopper, PawPrint, Waves } from 'lucide-react'
import { COUNTRIES, DIETS, EXPERIENCE, LANGUAGES, LEVELS, type AuPair, type Diet, type Level } from '../data/aupairs'
import { AREAS } from '../data/families'
import { fetchOwnAuPair, formatMonth, nextMonths, removePhoto, saveOwnAuPair, uploadPhoto } from '../lib/store'
import { useAuth } from '../lib/auth'
import { images, languageSchool } from '../data/site'
import { Chip, Img } from '../components/ui'
import { AuPairDetails, AuPairPhoto } from '../components/AuPairCard'
import { OwnProfile } from '../components/OwnProfile'

const STEPS = ['Über dich', 'Sprache & Erfahrung', 'Was dir wichtig ist', 'Dein Jahr']
const MAX_CHILDREN = [1, 2, 3, 4, 5, 6]
const DURATIONS = [6, 10, 12]
const MAX_PHOTO = 5 * 1024 * 1024

const STATUS_TEXT: Record<NonNullable<AuPair['status']>, string> = {
  pending: 'Wird von IJP geprüft – danach ist dein Profil für Familien sichtbar.',
  approved: 'Freigegeben – Familien sehen dein Profil.',
  rejected: 'Nicht freigegeben. Bitte melde dich bei IJP.',
}

export default function Register() {
  const { session, profile, loading } = useAuth()
  const userId = profile?.role === 'aupair' ? session?.user.id : undefined

  const months = useMemo(() => nextMonths(12), [])
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [editing, setEditing] = useState(false)
  const [existing, setExisting] = useState<AuPair | null>(null)
  const [loadingOwn, setLoadingOwn] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    age: '',
    country: '',
    german: 'A2' as Level,
    languages: [] as string[],
    experience: [] as string[],
    license: false,
    availableFrom: months[2],
    duration: 12,
    about: '',
    swims: false,
    smoker: false,
    petsOk: true,
    specialNeedsExperience: false,
    maxChildren: 3,
    areas: [] as string[],
    diet: 'Alles' as Diet,
    consent: false,
  })

  useEffect(() => {
    if (!userId) return
    setLoadingOwn(true)
    fetchOwnAuPair(userId)
      .then((own) => {
        setExisting(own)
        if (own) {
          setForm({
            name: own.name,
            age: String(own.age),
            country: own.country,
            german: own.german,
            languages: own.languages,
            experience: own.experience,
            license: own.license,
            availableFrom: own.availableFrom,
            duration: own.duration,
            about: own.about,
            swims: own.swims,
            smoker: own.smoker,
            petsOk: own.petsOk,
            specialNeedsExperience: own.specialNeedsExperience,
            maxChildren: own.maxChildren,
            areas: own.areas,
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

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const toggleIn = (key: 'languages' | 'experience' | 'areas', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    if (!userId) return
    setBusy(true)
    setError('')
    try {
      let photoPath = existing?.photoPath ?? null
      if (photo) {
        const newPath = await uploadPhoto(userId, photo)
        if (photoPath) await removePhoto(photoPath)
        photoPath = newPath
      }
      const country = COUNTRIES.find((c) => c.name === form.country)
      await saveOwnAuPair(userId, {
        name: form.name.trim(),
        age: Number(form.age),
        country: form.country,
        flag: country?.flag ?? '🌍',
        languages: form.languages,
        german: form.german,
        experience: form.experience,
        license: form.license,
        availableFrom: form.availableFrom,
        duration: form.duration,
        about: form.about.trim(),
        swims: form.swims,
        smoker: form.smoker,
        petsOk: form.petsOk,
        specialNeedsExperience: form.specialNeedsExperience,
        maxChildren: form.maxChildren,
        areas: form.areas,
        diet: form.diet,
        photoPath,
      })
      setExisting(await fetchOwnAuPair(userId))
      setPhoto(null)
      setEditing(false)
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError('Speichern hat nicht geklappt. Bitte versuche es erneut.')
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
          <h1 className="mt-6 text-4xl sm:text-5xl">
            {existing ? 'Gespeichert!' : `Willkommen, ${form.name.trim()}!`}
          </h1>
          <p className="mt-4 text-ink/60">
            IJP prüft dein Profil kurz. Danach ist es für Familien sichtbar, und wir melden uns, sobald eine Familie
            Interesse hat.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/gastfamilien" className="btn-coral">
              Familien ansehen <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(false)
                setStep(0)
              }}
              className="btn-ghost"
            >
              Mein Profil ansehen
            </button>
            <Link to="/#sprachschule" className="btn-ghost">
              Mehr zur Sprachschule
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (userId && existing && !editing && !loadingOwn) {
    return (
      <OwnProfile
        eyebrow="Für Au-pairs"
        status={existing.status ?? 'pending'}
        statusText={STATUS_TEXT}
        previewLabel="So sehen Familien dein Profil"
        photo={<AuPairPhoto aupair={existing} className="h-72 w-full md:h-full" />}
        onEdit={() => {
          setStep(0)
          setEditing(true)
        }}
        actions={
          <Link to="/gastfamilien" className="btn-coral">
            Familien ansehen <ArrowRight size={16} />
          </Link>
        }
      >
        <AuPairDetails aupair={existing} />
      </OwnProfile>
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
          Mit deinem Konto kannst du dein Profil jederzeit bearbeiten. Deine E-Mail sieht nur IJP.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login?modus=registrieren&rolle=aupair&next=/aupair" className="btn-coral">
            Konto erstellen <ArrowRight size={16} />
          </Link>
          <Link to="/login?next=/aupair" className="btn-ghost">
            Ich habe schon ein Konto
          </Link>
        </div>
      </div>
    ) : !userId ? (
      <div className="card p-6 sm:p-10">
        <h2 className="text-3xl">Sie sind als Gastfamilie angemeldet.</h2>
        <p className="mt-3 text-ink/60">Au-pair-Profile können nur mit einem Au-pair-Konto angelegt werden.</p>
        <Link to="/familien" className="btn-primary mt-8">
          Au-pairs ansehen <ArrowRight size={16} />
        </Link>
      </div>
    ) : null

  return (
    <div className="container-x grid gap-12 py-12 md:grid-cols-[5fr_6fr] md:py-16">
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="eyebrow">Für Au-pairs</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Werde Au-pair in Deutschland.</h1>
        <p className="mt-4 max-w-md text-ink/60">
          Konto erstellen, drei kurze Schritte ausfüllen – nach einer kurzen Prüfung sehen Familien dein Profil. IJP
          begleitet dich – vom ersten Gespräch bis zum Deutschkurs vor Ort.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {[
            'Kostenlos registrieren',
            'Persönliche Ansprechperson bei IJP',
            `Deutschkurs an der ${languageSchool.name}`,
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
          src={images.heroFriends}
          alt="Au-pairs gemeinsam unterwegs"
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
                <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                  <div>
                    <label className="label" htmlFor="r-name">
                      Vorname
                    </label>
                    <input
                      id="r-name"
                      required
                      autoFocus
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Wie heißt du?"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="r-age">
                      Alter
                    </label>
                    <input
                      id="r-age"
                      required
                      type="number"
                      min={18}
                      max={30}
                      value={form.age}
                      onChange={(e) => set('age', e.target.value)}
                      placeholder="18–30"
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="r-country">
                    Herkunftsland
                  </label>
                  <select
                    id="r-country"
                    required
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    className="input"
                  >
                    <option value="" disabled>
                      Bitte wählen
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="label">Foto</p>
                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-ink/20 bg-white p-3 transition hover:border-ink/50">
                    {previewUrl || existing?.photo ? (
                      <Img src={previewUrl ?? existing?.photo} alt="Dein Foto" className="h-16 w-16 rounded-xl" />
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
                  <p className="mt-1.5 text-xs text-ink/50">Ein freundliches Foto erhöht deine Chancen deutlich.</p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <p className="label">Dein Deutsch</p>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <Chip key={l} active={form.german === l} onClick={() => set('german', l)}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-ink/50">
                    Noch nicht perfekt? Kein Problem – dafür gibt es die {languageSchool.name}.
                  </p>
                </div>
                <div>
                  <p className="label">Weitere Sprachen</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <Chip key={l} active={form.languages.includes(l)} onClick={() => toggleIn('languages', l)}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Erfahrung mit</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map((t) => (
                      <Chip key={t} active={form.experience.includes(t)} onClick={() => toggleIn('experience', t)}>
                        {t}
                      </Chip>
                    ))}
                    <Chip active={form.license} onClick={() => set('license', !form.license)}>
                      <Car size={14} /> Führerschein
                    </Chip>
                    <Chip active={form.swims} onClick={() => set('swims', !form.swims)}>
                      <Waves size={14} /> Kann schwimmen
                    </Chip>
                    <Chip
                      active={form.specialNeedsExperience}
                      onClick={() => set('specialNeedsExperience', !form.specialNeedsExperience)}
                    >
                      Kinder mit besonderem Förderbedarf
                    </Chip>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <p className="label">Höchstens wie viele Kinder?</p>
                  <div className="flex flex-wrap gap-2">
                    {MAX_CHILDREN.map((n) => (
                      <Chip key={n} active={form.maxChildren === n} onClick={() => set('maxChildren', n)}>
                        {n === 6 ? '6+' : n}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Wo möchtest du am liebsten wohnen?</p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map((a) => (
                      <Chip key={a} active={form.areas.includes(a)} onClick={() => toggleIn('areas', a)}>
                        {a}
                      </Chip>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-ink/50">Nichts gewählt heißt: Ist mir egal.</p>
                </div>
                <div>
                  <p className="label">Ernährung</p>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <Chip key={d} active={form.diet === d} onClick={() => set('diet', d)}>
                        {d === 'Alles' ? 'Ich esse alles' : d}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Haushalt</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={form.petsOk} onClick={() => set('petsOk', !form.petsOk)}>
                      <PawPrint size={14} /> Haustiere sind okay
                    </Chip>
                    <Chip active={form.smoker} onClick={() => set('smoker', !form.smoker)}>
                      Ich rauche
                    </Chip>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="r-from">
                      Start ab
                    </label>
                    <select
                      id="r-from"
                      value={form.availableFrom}
                      onChange={(e) => set('availableFrom', e.target.value)}
                      className="input"
                    >
                      {months.map((m) => (
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
                  <label className="label" htmlFor="r-about">
                    Erzähl von dir
                  </label>
                  <textarea
                    id="r-about"
                    required
                    minLength={30}
                    rows={5}
                    value={form.about}
                    onChange={(e) => set('about', e.target.value)}
                    placeholder="Was machst du gern? Warum möchtest du Au-pair werden?"
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
                    Ich bin einverstanden, dass IJP mein Profil (Vorname, Alter, Land, Foto, Angaben und Profiltext)
                    nach Prüfung auf dieser Website öffentlich sichtbar macht. Widerruf jederzeit per E-Mail möglich.
                    Mehr in der{' '}
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
            ) : existing ? (
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                Abbrechen
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
