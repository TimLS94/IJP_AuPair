import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, Loader2, Mail, RotateCcw, X } from 'lucide-react'
import type { AuPair } from '../data/aupairs'
import type { Family } from '../data/families'
import {
  fetchAllAuPairs,
  fetchMessages,
  formatMonth,
  setAuPairStatus,
  setMessageHandled,
  type ContactMessage,
} from '../lib/store'
import { fetchAllFamilies, fetchMatches, setFamilyStatus, type Match } from '../lib/families'
import { useAuth } from '../lib/auth'
import { Img } from '../components/ui'

type Tab = 'pending' | 'approved' | 'rejected' | 'families' | 'matches' | 'messages'

const STATUS_LABEL: Record<NonNullable<Family['status']>, string> = {
  pending: 'Zu prüfen',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Zu prüfen' },
  { id: 'approved', label: 'Freigegeben' },
  { id: 'rejected', label: 'Abgelehnt' },
  { id: 'families', label: 'Familien' },
  { id: 'matches', label: 'Matches' },
  { id: 'messages', label: 'Nachrichten' },
]

export default function Admin() {
  const { profile, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('pending')
  const [aupairs, setAupairs] = useState<AuPair[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = profile?.role === 'admin'

  const reload = useCallback(async () => {
    setError('')
    try {
      const [a, m, f, ma] = await Promise.all([fetchAllAuPairs(), fetchMessages(), fetchAllFamilies(), fetchMatches()])
      setAupairs(a)
      setMessages(m)
      setFamilies(f)
      setMatches(ma)
    } catch (err) {
      console.error(err)
      setError('Daten konnten nicht geladen werden.')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) reload()
  }, [isAdmin, reload])

  if (loading) return null
  if (!isAdmin) return <Navigate to="/login?next=/admin" replace />

  const act = async (fn: () => Promise<void>) => {
    try {
      await fn()
      await reload()
    } catch (err) {
      console.error(err)
      setError('Änderung konnte nicht gespeichert werden.')
    }
  }

  const count = (t: Tab) =>
    t === 'messages'
      ? messages.filter((m) => !m.handled).length
      : t === 'families'
        ? families.filter((f) => f.status === 'pending').length
        : t === 'matches'
          ? matches.length
          : aupairs.filter((a) => a.status === t).length

  const list = aupairs.filter((a) => a.status === tab)

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow">Verwaltung</p>
      <h1 className="mt-3 text-4xl">Admin</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`chip ${tab === t.id ? 'chip-active' : ''}`}
          >
            {t.label}
            <span className="text-xs opacity-60">{count(t.id)}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}

      {busy ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="animate-spin text-ink/40" />
        </div>
      ) : tab === 'messages' ? (
        <div className="mt-6 space-y-3">
          {messages.length === 0 && <p className="text-ink/60">Noch keine Nachrichten.</p>}
          {messages.map((m) => (
            <article key={m.id} className={`card p-5 ${m.handled ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {m.name} <span className="tag ml-1">{m.role}</span>
                </p>
                <span className="text-xs text-ink/50">
                  {m.created_at && new Date(m.created_at).toLocaleString('de-DE')}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/60">
                <a href={`mailto:${m.email}`} className="hover:text-coral">
                  {m.email}
                </a>
                {m.phone && ` · ${m.phone}`}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}`} className="btn-ghost !px-4 !py-2">
                  <Mail size={14} /> Antworten
                </a>
                <button
                  type="button"
                  onClick={() => act(() => setMessageHandled(m.id!, !m.handled))}
                  className="btn-ghost !px-4 !py-2"
                >
                  {m.handled ? <RotateCcw size={14} /> : <Check size={14} />}
                  {m.handled ? 'Wieder öffnen' : 'Erledigt'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : tab === 'families' ? (
        <div className="mt-6 space-y-3">
          {families.length === 0 && <p className="text-ink/60">Noch keine Familienprofile.</p>}
          {families.map((f) => (
            <article key={f.id} className="card flex flex-col gap-5 p-5 sm:flex-row">
              <Img src={f.photo} alt={f.name} className="h-32 w-28 shrink-0 rounded-2xl" />
              <div className="flex-1">
                <p className="text-xl font-display">
                  {f.name} <span className="tag ml-1 font-sans">{STATUS_LABEL[f.status ?? 'pending']}</span>
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  {f.city}, {f.state} · {f.area} · {f.children} {f.children === 1 ? 'Kind' : 'Kinder'} · ab{' '}
                  {formatMonth(f.startFrom)} · {f.duration} Monate · Deutsch ab {f.minGerman}
                  {f.needsLicense && ' · Führerschein nötig'}
                  {f.pets && ' · Haustiere'}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm">{f.about}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    ...f.childAges,
                    ...f.tasks,
                    ...f.languages,
                    `${f.hoursPerWeek} Std./Woche`,
                    `${f.pocketMoney} € Taschengeld`,
                    ...(f.needsSwimming ? ['Schwimmen nötig'] : []),
                    ...(f.nonsmokerRequired ? ['Nur Nichtraucher'] : []),
                    ...(f.specialNeeds ? ['Kind mit Förderbedarf'] : []),
                    ...(f.singleParent ? ['Alleinerziehend'] : []),
                    ...(f.diet !== 'Alles' ? [f.diet] : []),
                  ].map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col">
                {f.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => act(() => setFamilyStatus(f.id, 'approved'))}
                    className="btn-coral !px-4 !py-2"
                  >
                    <Check size={14} /> Freigeben
                  </button>
                )}
                {f.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => act(() => setFamilyStatus(f.id, 'rejected'))}
                    className="btn-ghost !px-4 !py-2"
                  >
                    <X size={14} /> {f.status === 'approved' ? 'Ausblenden' : 'Ablehnen'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : tab === 'matches' ? (
        <div className="mt-6 space-y-3">
          {matches.length === 0 && <p className="text-ink/60">Noch keine Matches.</p>}
          {matches.map((m) => {
            const a = aupairs.find((x) => x.id === m.aupairId)
            const f = families.find((x) => x.id === m.familyId)
            return (
              <article
                key={`${m.aupairId}-${m.familyId}`}
                className="card flex flex-wrap items-baseline justify-between gap-2 p-5"
              >
                <p className="font-medium">
                  {a ? `${a.name}, ${a.age} (${a.country})` : 'Au-pair'} ↔ {f ? `${f.name}, ${f.city}` : 'Familie'}
                </p>
                <span className="text-xs text-ink/50">{new Date(m.matchedAt).toLocaleString('de-DE')}</span>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.length === 0 && <p className="text-ink/60">Keine Profile in dieser Liste.</p>}
          {list.map((a) => (
            <article key={a.id} className="card flex flex-col gap-5 p-5 sm:flex-row">
              <Img src={a.photo} alt={a.name} className="h-32 w-28 shrink-0 rounded-2xl" />
              <div className="flex-1">
                <p className="text-xl font-display">
                  {a.name}, {a.age}{' '}
                  <span className="text-sm text-ink/60">
                    {a.flag} {a.country}
                  </span>
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  Deutsch {a.german} · ab {formatMonth(a.availableFrom)} · {a.duration} Monate
                  {a.license && ' · Führerschein'}
                </p>
                <p className="mt-3 text-sm">{a.about}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    ...a.languages,
                    ...a.experience,
                    a.smoker ? 'Raucht' : 'Nichtraucher',
                    ...(a.swims ? ['Schwimmt'] : []),
                    ...(a.petsOk ? [] : ['Keine Haustiere']),
                    ...(a.specialNeedsExperience ? ['Förderbedarf-Erfahrung'] : []),
                    `Bis ${a.maxChildren >= 6 ? '6+' : a.maxChildren} Kinder`,
                    ...(a.diet !== 'Alles' ? [a.diet] : []),
                  ].map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col">
                {a.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => act(() => setAuPairStatus(a.id, 'approved'))}
                    className="btn-coral !px-4 !py-2"
                  >
                    <Check size={14} /> Freigeben
                  </button>
                )}
                {a.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => act(() => setAuPairStatus(a.id, 'rejected'))}
                    className="btn-ghost !px-4 !py-2"
                  >
                    <X size={14} /> {a.status === 'approved' ? 'Ausblenden' : 'Ablehnen'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
