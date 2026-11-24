import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Baby, Calendar, Car, Clock, Heart, Languages, MapPin, PawPrint, X } from 'lucide-react'
import type { Family } from '../data/families'
import { formatMonth } from '../lib/store'
import { FavButton } from './AuPairCard'
import type { Fit } from '../lib/matching'
import { FitList, Img, MatchBadge, ScoreBadge } from './ui'

function Photo({ family, className }: { family: Family; className: string }) {
  if (family.photo) {
    return <Img src={family.photo} alt={family.name} className={className} />
  }
  return (
    <div className={`grid place-items-center bg-gradient-to-br from-sand via-sun/60 to-forest/60 ${className}`}>
      <span className="font-display text-7xl text-white/90">{family.name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

const childrenText = (n: number) => `${n} ${n === 1 ? 'Kind' : 'Kinder'}`

export function FamilyCard({
  family,
  liked,
  match,
  score,
  onLike,
  onOpen,
}: {
  family: Family
  liked: boolean
  match: boolean
  score?: number
  onLike: () => void
  onOpen: () => void
}) {
  return (
    <article
      onClick={onOpen}
      className="card group cursor-pointer overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo family={family} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute right-3 top-3">
          <FavButton active={liked} onClick={onLike} />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {match && <MatchBadge />}
          {score !== undefined && <ScoreBadge percent={score} />}
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur">
            {childrenText(family.children)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl">{family.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink/60">
          <MapPin size={13} /> {family.city}, {family.state}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{family.about}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="tag">
            <Calendar size={12} /> ab {formatMonth(family.startFrom)}
          </span>
          {family.childAges.slice(0, 2).map((a) => (
            <span key={a} className="tag">
              {a}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function FamilyModal({
  family,
  liked,
  match,
  canLike,
  fit,
  onLike,
  onClose,
}: {
  family: Family
  liked: boolean
  match: boolean
  fit?: Fit
  canLike: boolean
  onLike: () => void
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
      aria-label={`Profil von ${family.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[92vh] w-full max-w-3xl animate-pop overflow-y-auto rounded-t-3xl bg-cream sm:rounded-3xl md:grid-cols-[2fr_3fr]"
      >
        <Photo family={family} className="h-64 w-full md:h-full" />

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-white"
          >
            <X size={16} />
          </button>

          <p className="flex items-center gap-1 text-sm text-ink/60">
            <MapPin size={13} /> {family.city}, {family.state} · {family.area}
          </p>
          <h2 className="mt-1 pr-10 text-3xl">{family.name}</h2>
          <p className="mt-4 whitespace-pre-line text-ink/70">{family.about}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label flex items-center gap-1.5">
                <Baby size={12} /> Kinder
              </dt>
              <dd>
                {childrenText(family.children)}
                {family.childAges.length > 0 && ` (${family.childAges.join(', ')})`}
              </dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Languages size={12} /> Sprachen
              </dt>
              <dd>
                Deutsch
                {family.languages.length > 0 && `, ${family.languages.join(', ')}`}
                <span className="text-ink/60"> · gewünscht: Deutsch ab {family.minGerman}</span>
              </dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Calendar size={12} /> Start
              </dt>
              <dd>ab {formatMonth(family.startFrom)}</dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Clock size={12} /> Dauer
              </dt>
              <dd>{family.duration} Monate</dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <Car size={12} /> Führerschein
              </dt>
              <dd>{family.needsLicense ? 'Erforderlich' : 'Nicht nötig'}</dd>
            </div>
            <div>
              <dt className="label flex items-center gap-1.5">
                <PawPrint size={12} /> Haustiere
              </dt>
              <dd>{family.pets ? 'Ja' : 'Nein'}</dd>
            </div>
          </dl>

          {family.tasks.length > 0 && (
            <div className="mt-6">
              <p className="label">Aufgaben</p>
              <div className="flex flex-wrap gap-1.5">
                {family.tasks.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="label">Das bietet die Familie</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="tag">{family.hoursPerWeek} Std./Woche</span>
              <span className="tag">{family.pocketMoney} € Taschengeld</span>
              {family.courseSupport && <span className="tag">Zuschuss Deutschkurs</span>}
              {family.ownBathroom && <span className="tag">Eigenes Bad</span>}
              {family.carPrivate && <span className="tag">Auto auch privat</span>}
              {family.transitTicket && <span className="tag">ÖPNV-Ticket</span>}
            </div>
          </div>

          <div className="mt-6">
            <p className="label">Wünsche & Haushalt</p>
            <div className="flex flex-wrap gap-1.5">
              {family.needsSwimming && <span className="tag">Schwimmen</span>}
              {family.nonsmokerRequired && <span className="tag">Nichtraucher</span>}
              {family.specialNeeds && <span className="tag">Kind mit Förderbedarf</span>}
              {family.singleParent && <span className="tag">Alleinerziehend</span>}
              {family.diet !== 'Alles' && <span className="tag">Ernährung: {family.diet}</span>}
              {family.pets && <span className="tag">Haustiere</span>}
            </div>
          </div>

          {fit && <FitList fit={fit} title="Passt zu dir" />}

          {match ? (
            <>
              <p className="mt-8 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
                Match! Diese Familie hat dich ebenfalls gemerkt.
              </p>
              <Link to={`/kontakt?familie=${encodeURIComponent(family.name)}`} className="btn-coral mt-3 w-full">
                Kennenlernen über IJP anfragen <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            canLike && (
              <button type="button" onClick={onLike} className={`mt-8 w-full ${liked ? 'btn-ghost' : 'btn-coral'}`}>
                <Heart size={16} className={liked ? 'fill-coral text-coral' : ''} />
                {liked ? 'Von Merkliste entfernen' : 'Familie merken'}
              </button>
            )
          )}
          <p className="mt-3 text-center text-xs text-ink/50">
            Merkt die Familie dich auch, ist es ein Match. IJP stellt dann den Kontakt her.
          </p>
        </div>
      </div>
    </div>
  )
}
