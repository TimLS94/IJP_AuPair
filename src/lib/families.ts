import { useCallback, useEffect, useState } from 'react'
import type { Level } from '../data/aupairs'
import type { Area, Family } from '../data/families'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { photoUrl } from './store'

interface FamilyRow {
  id: string
  name: string
  city: string
  state: string
  area: Area
  children: number
  child_ages: string[]
  languages: string[]
  tasks: string[]
  min_german: Level
  needs_license: boolean
  pets: boolean
  start_from: string
  duration: number
  about: string
  photo_path: string | null
  status: Family['status']
}

const COLUMNS =
  'id, name, city, state, area, children, child_ages, languages, tasks, min_german, needs_license, pets, start_from, duration, about, photo_path, status'

function fromRow(r: FamilyRow): Family {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    state: r.state,
    area: r.area,
    children: r.children,
    childAges: r.child_ages,
    languages: r.languages,
    tasks: r.tasks,
    minGerman: r.min_german,
    needsLicense: r.needs_license,
    pets: r.pets,
    startFrom: r.start_from,
    duration: r.duration,
    about: r.about,
    photo: photoUrl(r.photo_path),
    photoPath: r.photo_path,
    status: r.status,
  }
}

export type FamilyInput = Omit<Family, 'id' | 'photo' | 'status'>

function toRow(f: FamilyInput) {
  return {
    name: f.name,
    city: f.city,
    state: f.state,
    area: f.area,
    children: f.children,
    child_ages: f.childAges,
    languages: f.languages,
    tasks: f.tasks,
    min_german: f.minGerman,
    needs_license: f.needsLicense,
    pets: f.pets,
    start_from: f.startFrom,
    duration: f.duration,
    about: f.about,
    photo_path: f.photoPath ?? null,
  }
}

export async function fetchApprovedFamilies(): Promise<Family[]> {
  const { data, error } = await supabase
    .from('families')
    .select(COLUMNS)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as FamilyRow[]).map(fromRow)
}

export async function fetchAllFamilies(): Promise<Family[]> {
  const { data, error } = await supabase.from('families').select(COLUMNS).order('created_at', { ascending: false })
  if (error) throw error
  return (data as FamilyRow[]).map(fromRow)
}

export async function fetchOwnFamily(userId: string): Promise<Family | null> {
  const { data, error } = await supabase.from('families').select(COLUMNS).eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as FamilyRow) : null
}

export async function saveOwnFamily(userId: string, input: FamilyInput) {
  const { error } = await supabase
    .from('families')
    .upsert({ user_id: userId, ...toRow(input) }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function setFamilyStatus(id: string, status: NonNullable<Family['status']>) {
  const { error } = await supabase.from('families').update({ status }).eq('id', id)
  if (error) throw error
}

export function useFamilyLikes() {
  const { session, profile } = useAuth()
  const aupairUserId = profile?.role === 'aupair' ? session?.user.id : undefined
  const [likes, setLikes] = useState<string[]>([])

  useEffect(() => {
    if (!aupairUserId) {
      setLikes([])
      return
    }
    supabase
      .from('family_likes')
      .select('family_id')
      .eq('aupair_user_id', aupairUserId)
      .then(({ data }) => setLikes((data ?? []).map((l) => l.family_id as string)))
  }, [aupairUserId])

  const toggle = useCallback(
    async (id: string) => {
      if (!aupairUserId) return
      const isLiked = likes.includes(id)
      setLikes((prev) => (isLiked ? prev.filter((l) => l !== id) : [...prev, id]))
      const { error } = isLiked
        ? await supabase.from('family_likes').delete().eq('aupair_user_id', aupairUserId).eq('family_id', id)
        : await supabase.from('family_likes').insert({ aupair_user_id: aupairUserId, family_id: id })
      if (error) setLikes((prev) => (isLiked ? [...prev, id] : prev.filter((l) => l !== id)))
    },
    [aupairUserId, likes],
  )

  return { likes, toggle, canLike: Boolean(aupairUserId) }
}

export interface Match {
  aupairId: string
  familyId: string
  matchedAt: string
}

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase.rpc('my_matches')
  if (error) throw error
  return (data as { aupair_id: string; family_id: string; matched_at: string }[]).map((m) => ({
    aupairId: m.aupair_id,
    familyId: m.family_id,
    matchedAt: m.matched_at,
  }))
}

export function useMatches() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [matches, setMatches] = useState<Match[]>([])

  const reload = useCallback(async () => {
    if (!userId) {
      setMatches([])
      return []
    }
    try {
      const list = await fetchMatches()
      setMatches(list)
      return list
    } catch (err) {
      console.error(err)
      return []
    }
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  return { matches, reload }
}
