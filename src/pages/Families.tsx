import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Car, Heart, Loader2, PawPrint, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import { LEVELS, type Level } from '../data/aupairs'
import { AREAS, CHILD_AGES, type Family } from '../data/families'
import { formatMonth, nextMonths } from '../lib/store'
import { fetchApprovedFamilies, useFamilyLikes, useMatches } from '../lib/families'
import { useAuth } from '../lib/auth'
import { FamilyCard, FamilyModal } from '../components/FamilyCard'
import { Chip } from '../components/ui'

export default function Families() {
  const { session, profile, loading: authLoading } = useAuth()
  const canView = profile?.role === 'aupair' || profile?.role === 'admin'

  const [all, setAll] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!canView) return
    fetchApprovedFamilies()
      .then(setAll)
      .catch((err) => {
        console.error(err)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }, [canView])

  const months = useMemo(() => nextMonths(12), [])
  const states = useMemo(() => [...new Set(all.map((f) => f.state))].sort(), [all])

  const { likes, toggle: toggleLike, canLike } = useFamilyLikes()
  const { matches, reload: reloadMatches } = useMatches()
  const [newMatch, setNewMatch] = useState('')

  const [q, setQ] = useState('')
  const [state, setState] = useState('')
  const [area, setArea] = useState('')
  const [startFrom, setStartFrom] = useState('')
  const [myGerman, setMyGerman] = useState<Level | ''>('')
  const [ages, setAges] = useState<string[]>([])
  const [noPets, setNoPets] = useState(false)
  const [noLicense, setNoLicense] = useState(false)
  const [onlyLikes, setOnlyLikes] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<Family | null>(null)

  const isMatch = (id: string) => matches.some((m) => m.familyId === id)

  const toggle = async (family: Family) => {
    if (!canLike) return
    const had = isMatch(family.id)
    await toggleLike(family.id)
    const now = await reloadMatches()
    if (!had && now.some((m) => m.familyId === family.id)) setNewMatch(family.name)
  }

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all.filter((f) => {
      if (needle && !`${f.name} ${f.city} ${f.state} ${f.about}`.toLowerCase().includes(needle)) return false
      if (state && f.state !== state) return false
      if (area && f.area !== area) return false
      if (startFrom && f.startFrom < startFrom) return false
      if (myGerman && LEVELS.indexOf(f.minGerman) > LEVELS.indexOf(myGerman)) return false
      if (noPets && f.pets) return false
      if (noLicense && f.needsLicense) return false
      if (onlyLikes && !likes.includes(f.id)) return false
      return ages.every((a) => f.childAges.includes(a))
    })
  }, [all, q, state, area, startFrom, myGerman, ages, noPets, noLicense, onlyLikes, likes])

  const activeCount =
    [state, area, startFrom, myGerman].filter(Boolean).length + ages.length + (noPets ? 1 : 0) + (noLicense ? 1 : 0)

  const reset = () => {
    setQ('')
    setState('')
    setArea('')
    setStartFrom('')
    setMyGerman('')
    setAges([])
    setNoPets(false)
    setNoLicense(false)
    setOnlyLikes(false)
  }

  const toggleAge = (a: string) => setAges((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))

  const gate = authLoading ? (
    <div className="mt-10 grid place-items-center py-24">
      <Loader2 className="animate-spin text-ink/40" />
    </div>
  ) : !session ? (
    <div className="card mt-10 max-w-xl p-6 sm:p-10">
      <h2 className="text-3xl">Zuerst ein kostenloses Konto.</h2>
      <p className="mt-3 text-ink/60">
        Zum Schutz der Familien und ihrer Kinder sind Familienprofile nur für angemeldete Au-pairs sichtbar.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/login?modus=registrieren&rolle=aupair&next=/gastfamilien" className="btn-coral">
          Konto erstellen <ArrowRight size={16} />
        </Link>
        <Link to="/login?next=/gastfamilien" className="btn-ghost">
          Ich habe schon ein Konto
        </Link>
      </div>
    </div>
  ) : !canView ? (
    <div className="card mt-10 max-w-xl p-6 sm:p-10">
      <h2 className="text-3xl">Sie sind als Gastfamilie angemeldet.</h2>
      <p className="mt-3 text-ink/60">Familienprofile sind nur für Au-pairs sichtbar.</p>
      <Link to="/familien" className="btn-primary mt-8">
        Au-pairs ansehen <ArrowRight size={16} />
      </Link>
    </div>
  ) : null

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow">Für Au-pairs</p>
      <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">Finde deine Gastfamilie.</h1>
      <p className="mt-4 max-w-xl text-ink/60">
        Stöbere durch die Familien und merke dir, wer zu dir passt. Merkt die Familie dich auch, ist es ein Match – und
        IJP bringt euch zusammen.
      </p>

      {gate ?? (
        <>
          {newMatch && (
            <p className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-coral px-5 py-4 text-sm text-white">
              Match mit {newMatch}!
              <Link to="/matches" className="underline underline-offset-4">
                Matches ansehen
              </Link>
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, Ort oder Stichwort …"
                aria-label="Suche"
                className="input !rounded-full !py-3.5 !pl-11"
              />
            </div>
            <button
              type="button"
              aria-expanded={showFilters}
              onClick={() => setShowFilters((s) => !s)}
              className={`btn ${showFilters ? 'bg-ink text-cream' : 'border border-ink/15 bg-white'}`}
            >
              <SlidersHorizontal size={16} /> Filter
              {activeCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-coral text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>
            {canLike && (
              <button
                type="button"
                aria-pressed={onlyLikes}
                onClick={() => setOnlyLikes((s) => !s)}
                className={`btn ${onlyLikes ? 'bg-coral text-white' : 'border border-ink/15 bg-white'}`}
              >
                <Heart size={16} className={onlyLikes ? 'fill-white' : ''} /> Merkliste
                {likes.length > 0 && <span className="text-xs opacity-70">{likes.length}</span>}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="card mt-4 animate-pop p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="label" htmlFor="g-state">
                    Bundesland
                  </label>
                  <select id="g-state" value={state} onChange={(e) => setState(e.target.value)} className="input">
                    <option value="">Alle</option>
                    {states.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="g-area">
                    Wohnlage
                  </label>
                  <select id="g-area" value={area} onChange={(e) => setArea(e.target.value)} className="input">
                    <option value="">Egal</option>
                    {AREAS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="g-german">
                    Mein Deutsch
                  </label>
                  <select
                    id="g-german"
                    value={myGerman}
                    onChange={(e) => setMyGerman(e.target.value as Level | '')}
                    className="input"
                  >
                    <option value="">Egal</option>
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="g-start">
                    Start frühestens
                  </label>
                  <select
                    id="g-start"
                    value={startFrom}
                    onChange={(e) => setStartFrom(e.target.value)}
                    className="input"
                  >
                    <option value="">Egal</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {formatMonth(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <p className="label">Kinder & Rahmen</p>
                <div className="flex flex-wrap gap-2">
                  {CHILD_AGES.map((a) => (
                    <Chip key={a} active={ages.includes(a)} onClick={() => toggleAge(a)}>
                      {a}
                    </Chip>
                  ))}
                  <Chip active={noPets} onClick={() => setNoPets((p) => !p)}>
                    <PawPrint size={14} /> Ohne Haustiere
                  </Chip>
                  <Chip active={noLicense} onClick={() => setNoLicense((l) => !l)}>
                    <Car size={14} /> Ohne Führerschein
                  </Chip>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between text-sm text-ink/60">
            <span>
              {results.length} {results.length === 1 ? 'Familie' : 'Familien'}
            </span>
            {(activeCount > 0 || q || onlyLikes) && (
              <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-coral">
                Zurücksetzen
              </button>
            )}
          </div>

          {loading ? (
            <div className="mt-5 grid place-items-center py-24">
              <Loader2 className="animate-spin text-ink/40" />
            </div>
          ) : loadError ? (
            <div className="card mt-5 px-6 py-16 text-center text-ink/60">
              Die Familien konnten gerade nicht geladen werden. Bitte versuche es später erneut.
            </div>
          ) : results.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((f) => (
                <FamilyCard
                  key={f.id}
                  family={f}
                  liked={likes.includes(f.id)}
                  match={isMatch(f.id)}
                  onLike={() => toggle(f)}
                  onOpen={() => setSelected(f)}
                />
              ))}
            </div>
          ) : (
            <div className="card mt-5 px-6 py-16 text-center">
              <h2 className="text-2xl">Keine passende Familie dabei?</h2>
              <p className="mx-auto mt-2 max-w-sm text-ink/60">
                Passe die Filter an – oder schreib uns. IJP kennt viele Familien, die hier noch nicht zu sehen sind.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={reset} className="btn-ghost">
                  Filter zurücksetzen
                </button>
                <Link to="/kontakt" className="btn-coral">
                  IJP kontaktieren <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <FamilyModal
          family={selected}
          liked={likes.includes(selected.id)}
          match={isMatch(selected.id)}
          canLike={canLike}
          onLike={() => toggle(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
