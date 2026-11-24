import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Car, Heart, Loader2, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import { EXPERIENCE, LEVELS, type AuPair, type Level } from '../data/aupairs'
import { fetchApprovedAuPairs, formatMonth, nextMonths, useFavorites } from '../lib/store'
import { fetchOwnFamily, useMatches } from '../lib/families'
import { useAuth } from '../lib/auth'
import { AuPairCard, AuPairModal } from '../components/AuPairCard'
import { Chip } from '../components/ui'

export default function Search() {
  const navigate = useNavigate()
  const [all, setAll] = useState<AuPair[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetchApprovedAuPairs()
      .then(setAll)
      .catch((err) => {
        console.error(err)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const months = useMemo(() => nextMonths(12), [])
  const countries = useMemo(() => [...new Set(all.map((a) => a.country))].sort(), [all])
  const languages = useMemo(() => [...new Set(all.flatMap((a) => a.languages))].sort(), [all])

  const { favs, toggle: toggleFav, canFavorite } = useFavorites()
  // Merkliste nur mit Familien-Konto – sonst zur Anmeldung.
  const toggle = async (id: string) => {
    if (!canFavorite) {
      navigate('/login?modus=registrieren&rolle=family&next=/familien')
      return
    }
    const had = matches.some((m) => m.aupairId === id)
    await toggleFav(id)
    const now = await reloadMatches()
    if (!had && now.some((m) => m.aupairId === id)) setNewMatch(all.find((a) => a.id === id)?.name ?? '')
  }

  const { session } = useAuth()
  const familyUserId = canFavorite ? session?.user.id : undefined
  const { matches, reload: reloadMatches } = useMatches()
  const [newMatch, setNewMatch] = useState('')
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    if (!familyUserId) return
    fetchOwnFamily(familyUserId)
      .then((f) => setHasProfile(Boolean(f)))
      .catch(console.error)
  }, [familyUserId])

  const [q, setQ] = useState('')
  const [country, setCountry] = useState('')
  const [language, setLanguage] = useState('')
  const [minGerman, setMinGerman] = useState<Level>('A1')
  const [startBy, setStartBy] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [license, setLicense] = useState(false)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<AuPair | null>(null)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all.filter((a) => {
      if (needle && !`${a.name} ${a.country} ${a.about}`.toLowerCase().includes(needle)) return false
      if (country && a.country !== country) return false
      if (language && !a.languages.includes(language)) return false
      if (LEVELS.indexOf(a.german) < LEVELS.indexOf(minGerman)) return false
      if (startBy && a.availableFrom > startBy) return false
      if (license && !a.license) return false
      if (onlyFavs && !favs.includes(a.id)) return false
      return tags.every((t) => a.experience.includes(t))
    })
  }, [all, q, country, language, minGerman, startBy, tags, license, onlyFavs, favs])

  const activeCount =
    [country, language, startBy].filter(Boolean).length + (minGerman !== 'A1' ? 1 : 0) + tags.length + (license ? 1 : 0)

  const reset = () => {
    setQ('')
    setCountry('')
    setLanguage('')
    setMinGerman('A1')
    setStartBy('')
    setTags([])
    setLicense(false)
    setOnlyFavs(false)
  }

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow">Für Familien</p>
      <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">Finden Sie Ihr Au-pair.</h1>
      <p className="mt-4 max-w-xl text-ink/60">
        Stöbern Sie durch die Profile. Wenn jemand passt, fragen Sie über IJP an – wir kümmern uns um das Kennenlernen.
      </p>

      {newMatch && (
        <p className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-coral px-5 py-4 text-sm text-white">
          Match mit {newMatch}!
          <Link to="/matches" className="underline underline-offset-4">
            Matches ansehen
          </Link>
        </p>
      )}
      {canFavorite && !hasProfile && (
        <p className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-sun/40 px-5 py-4 text-sm">
          Sie haben noch kein Familienprofil. Erst damit können Au-pairs Sie finden und ein Match entstehen.
          <Link to="/familie" className="underline underline-offset-4">
            Profil anlegen
          </Link>
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, Land oder Stichwort …"
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
        <button
          type="button"
          aria-pressed={onlyFavs}
          onClick={() =>
            canFavorite ? setOnlyFavs((s) => !s) : navigate('/login?modus=registrieren&rolle=family&next=/familien')
          }
          className={`btn ${onlyFavs ? 'bg-coral text-white' : 'border border-ink/15 bg-white'}`}
        >
          <Heart size={16} className={onlyFavs ? 'fill-white' : ''} /> Merkliste
          {favs.length > 0 && <span className="text-xs opacity-70">{favs.length}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="card mt-4 animate-pop p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label" htmlFor="f-country">
                Herkunft
              </label>
              <select id="f-country" value={country} onChange={(e) => setCountry(e.target.value)} className="input">
                <option value="">Alle Länder</option>
                {countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-language">
                Spricht
              </label>
              <select id="f-language" value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                <option value="">Alle Sprachen</option>
                {languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-german">
                Deutsch mindestens
              </label>
              <select
                id="f-german"
                value={minGerman}
                onChange={(e) => setMinGerman(e.target.value as Level)}
                className="input"
              >
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-start">
                Start spätestens
              </label>
              <select id="f-start" value={startBy} onChange={(e) => setStartBy(e.target.value)} className="input">
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
            <p className="label">Erfahrung & Extras</p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE.map((t) => (
                <Chip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>
                  {t}
                </Chip>
              ))}
              <Chip active={license} onClick={() => setLicense((l) => !l)}>
                <Car size={14} /> Führerschein
              </Chip>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-sm text-ink/60">
        <span>
          {results.length} {results.length === 1 ? 'Profil' : 'Profile'}
        </span>
        {(activeCount > 0 || q || onlyFavs) && (
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
          Die Profile konnten gerade nicht geladen werden. Bitte versuchen Sie es später erneut.
        </div>
      ) : results.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <AuPairCard
              key={a.id}
              aupair={a}
              fav={favs.includes(a.id)}
              match={matches.some((m) => m.aupairId === a.id)}
              onFav={() => toggle(a.id)}
              onOpen={() => setSelected(a)}
            />
          ))}
        </div>
      ) : (
        <div className="card mt-5 px-6 py-16 text-center">
          <h2 className="text-2xl">Kein passendes Profil dabei?</h2>
          <p className="mx-auto mt-2 max-w-sm text-ink/60">
            Passen Sie die Filter an – oder sagen Sie uns, wen Sie suchen. Wir kennen viele Au-pairs, die hier noch
            nicht zu sehen sind.
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

      <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-forest p-8 text-cream sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="text-2xl sm:text-3xl">Keine Zeit zum Suchen?</h2>
          <p className="mt-2 max-w-md text-cream/70">
            Beschreiben Sie uns Ihre Familie. IJP schlägt Ihnen passende Au-pairs vor.
          </p>
        </div>
        <Link to="/kontakt" className="btn-light shrink-0">
          IJP kontaktieren <ArrowRight size={16} />
        </Link>
      </div>

      {selected && (
        <AuPairModal
          aupair={selected}
          fav={favs.includes(selected.id)}
          onFav={() => toggle(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
