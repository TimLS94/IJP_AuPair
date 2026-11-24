import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { AuPair } from '../data/aupairs'
import type { Family } from '../data/families'
import { fetchApprovedAuPairs, useFavorites } from '../lib/store'
import { fetchApprovedFamilies, useFamilyLikes, useMatches } from '../lib/families'
import { useAuth } from '../lib/auth'
import { AuPairCard, AuPairModal } from '../components/AuPairCard'
import { FamilyCard, FamilyModal } from '../components/FamilyCard'

export default function Matches() {
  const { session, profile, loading } = useAuth()
  const role = profile?.role
  const { matches, reload } = useMatches()
  const { favs, toggle: toggleFav } = useFavorites()
  const { likes, toggle: toggleLike, canLike } = useFamilyLikes()

  const [aupairs, setAupairs] = useState<AuPair[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState(false)
  const [openAupair, setOpenAupair] = useState<AuPair | null>(null)
  const [openFamily, setOpenFamily] = useState<Family | null>(null)

  useEffect(() => {
    if (role !== 'family' && role !== 'aupair') {
      setBusy(false)
      return
    }
    const load = role === 'family' ? fetchApprovedAuPairs().then(setAupairs) : fetchApprovedFamilies().then(setFamilies)
    load
      .catch((err) => {
        console.error(err)
        setError(true)
      })
      .finally(() => setBusy(false))
  }, [role])

  if (loading) return null
  if (!session) return <Navigate to="/login?next=/matches" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />

  const isFamily = role === 'family'
  const matchedAupairs = aupairs.filter((a) => matches.some((m) => m.aupairId === a.id))
  const matchedFamilies = families.filter((f) => matches.some((m) => m.familyId === f.id))
  const count = isFamily ? matchedAupairs.length : matchedFamilies.length

  const unfav = async (id: string) => {
    await toggleFav(id)
    await reload()
    setOpenAupair(null)
  }

  const unlike = async (id: string) => {
    await toggleLike(id)
    await reload()
    setOpenFamily(null)
  }

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow">Matches</p>
      <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">{isFamily ? 'Ihre Matches.' : 'Deine Matches.'}</h1>
      <p className="mt-4 max-w-xl text-ink/60">
        {isFamily
          ? 'Ein Match entsteht, wenn Sie ein Au-pair gemerkt haben und das Au-pair auch Ihre Familie. IJP stellt dann den Kontakt her und begleitet das Kennenlernen.'
          : 'Ein Match entsteht, wenn du eine Familie gemerkt hast und die Familie auch dich. IJP stellt dann den Kontakt her und begleitet das Kennenlernen.'}
      </p>

      {busy ? (
        <div className="mt-10 grid place-items-center py-24">
          <Loader2 className="animate-spin text-ink/40" />
        </div>
      ) : error ? (
        <div className="card mt-10 px-6 py-16 text-center text-ink/60">
          Die Matches konnten gerade nicht geladen werden.
        </div>
      ) : count === 0 ? (
        <div className="card mt-10 px-6 py-16 text-center">
          <h2 className="text-2xl">Noch kein Match.</h2>
          <p className="mx-auto mt-2 max-w-sm text-ink/60">
            {isFamily
              ? 'Merken Sie sich Au-pairs, die zu Ihnen passen. Voraussetzung für ein Match ist ein freigegebenes Familienprofil.'
              : 'Merke dir Familien, die zu dir passen. Voraussetzung für ein Match ist ein freigegebenes Profil.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={isFamily ? '/familien' : '/gastfamilien'} className="btn-coral">
              {isFamily ? 'Au-pairs ansehen' : 'Familien ansehen'} <ArrowRight size={16} />
            </Link>
            <Link to={isFamily ? '/familie' : '/aupair'} className="btn-ghost">
              Mein Profil
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isFamily
            ? matchedAupairs.map((a) => (
                <AuPairCard
                  key={a.id}
                  aupair={a}
                  fav={favs.includes(a.id)}
                  match
                  onFav={() => unfav(a.id)}
                  onOpen={() => setOpenAupair(a)}
                />
              ))
            : matchedFamilies.map((f) => (
                <FamilyCard
                  key={f.id}
                  family={f}
                  liked={likes.includes(f.id)}
                  match
                  onLike={() => unlike(f.id)}
                  onOpen={() => setOpenFamily(f)}
                />
              ))}
        </div>
      )}

      {openAupair && (
        <AuPairModal
          aupair={openAupair}
          fav={favs.includes(openAupair.id)}
          onFav={() => unfav(openAupair.id)}
          onClose={() => setOpenAupair(null)}
        />
      )}
      {openFamily && (
        <FamilyModal
          family={openFamily}
          liked={likes.includes(openFamily.id)}
          match
          canLike={canLike}
          onLike={() => unlike(openFamily.id)}
          onClose={() => setOpenFamily(null)}
        />
      )}
    </div>
  )
}
