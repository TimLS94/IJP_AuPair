import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Car, Clock, Heart, Languages, X } from 'lucide-react'
import type { AuPair } from '../data/aupairs'
import { formatMonth } from '../lib/store'
import { Img, MatchBadge } from './ui'

function Photo({ aupair, className }: { aupair: AuPair; className: string }) {
  if (aupair.photo) {
    return <Img src={aupair.photo} alt={aupair.name} className={className} />
  }
  return (
    <div className={`grid place-items-center bg-gradient-to-br from-sun/70 via-coral/60 to-coral ${className}`}>
      <span className="font-display text-7xl text-white/90">{aupair.name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export function FavButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={active ? 'Von Merkliste entfernen' : 'Auf Merkliste setzen'}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
    >
      <Heart size={18} className={active ? 'fill-coral text-coral' : 'text-ink/70'} />
    </button>
  )
}

export function AuPairCard({
  aupair,
  fav,
  match = false,
  onFav,
  onOpen,
}: {
  aupair: AuPair
  fav: boolean
  match?: boolean
  onFav: () => void
  onOpen: () => void
}) {
  return (
    <article
      onClick={onOpen}
      className="card group cursor-pointer overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Photo aupair={aupair} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute right-3 top-3">
          <FavButton active={fav} onClick={onFav} />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {match && <MatchBadge />}
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur">
            Deutsch {aupair.german}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xl">
            {aupair.name}, {aupair.age}
          </h3>
          <span className="text-sm text-ink/60">
            {aupair.flag} {aupair.country}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{aupair.about}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="tag">
            <Calendar size={12} /> ab {formatMonth(aupair.availableFrom)}
          </span>
          {aupair.experience.slice(0, 2).map((e) => (
            <span key={e} className="tag">
              {e}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function AuPairModal({
  aupair,
  fav,
  onFav,
  onClose,
}: {
  aupair: AuPair
  fav: boolean
  onFav: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Profil von ${aupair.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[92vh] w-full max-w-3xl animate-pop overflow-y-auto rounded-t-3xl bg-cream sm:rounded-3xl md:grid-cols-[2fr_3fr]"
      >
        <div className="relative">
          <Photo aupair={aupair} className="h-64 w-full md:h-full" />
          <div className="absolute left-3 top-3">
            <FavButton active={fav} onClick={onFav} />
          </div>
        </div>

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-white"
          >
            <X size={16} />
          </button>

          <p className="text-sm text-ink/60">
            {aupair.flag} {aupair.country}
          </p>
          <h2 className="mt-1 text-3xl">
            {aupair.name}, {aupair.age}
          </h2>
          <p className="mt-4 text-ink/70">{aupair.about}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label flex items-center gap-1.5">
                <Languages size={12} /> Sprachen
              </dt>
              <dd>
                Deutsch ({aupair.german}){aupair.languages.length > 0 && `, ${aupair.languages.join(', ')}`}
              </dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Calendar size={12} /> Verfügbar
              </dt>
              <dd>ab {formatMonth(aupair.availableFrom)}</dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Clock size={12} /> Dauer
              </dt>
              <dd>{aupair.duration} Monate</dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Car size={12} /> Führerschein
              </dt>
              <dd>{aupair.license ? 'Ja' : 'Nein'}</dd>
            </div>
          </dl>

          {aupair.experience.length > 0 && (
            <div className="mt-6">
              <p className="label">Erfahrung</p>
              <div className="flex flex-wrap gap-1.5">
                {aupair.experience.map((e) => (
                  <span key={e} className="tag">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link to={`/kontakt?aupair=${encodeURIComponent(aupair.name)}`} className="btn-coral mt-8 w-full">
            {aupair.name} über IJP anfragen <ArrowRight size={16} />
          </Link>
          <p className="mt-3 text-center text-xs text-ink/50">
            IJP stellt den Kontakt her und begleitet das Kennenlernen.
          </p>
        </div>
      </div>
    </div>
  )
}
