import { useCallback, useEffect, useState } from 'react'
import type { AuPair, Diet, Level } from '../data/aupairs'
import { supabase } from './supabase'
import { useAuth } from './auth'

interface AuPairRow {
  id: string
  name: string
  age: number
  country: string
  flag: string
  languages: string[]
  german: Level
  experience: string[]
  license: boolean
  available_from: string
  duration: number
  about: string
  swims: boolean
  smoker: boolean
  pets_ok: boolean
  special_needs_experience: boolean
  max_children: number
  areas: string[]
  diet: Diet
  photo_path: string | null
  status: AuPair['status']
}

const COLUMNS =
  'id, name, age, country, flag, languages, german, experience, license, available_from, duration, about, swims, smoker, pets_ok, special_needs_experience, max_children, areas, diet, photo_path, status'

export function photoUrl(path: string | null) {
  return path ? supabase.storage.from('photos').getPublicUrl(path).data.publicUrl : undefined
}

function fromRow(r: AuPairRow): AuPair {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    country: r.country,
    flag: r.flag,
    languages: r.languages,
    german: r.german,
    experience: r.experience,
    license: r.license,
    availableFrom: r.available_from,
    duration: r.duration,
    about: r.about,
    swims: r.swims,
    smoker: r.smoker,
    petsOk: r.pets_ok,
    specialNeedsExperience: r.special_needs_experience,
    maxChildren: r.max_children,
    areas: r.areas,
    diet: r.diet,
    photo: photoUrl(r.photo_path),
    photoPath: r.photo_path,
    status: r.status,
  }
}

export type AuPairInput = Omit<AuPair, 'id' | 'photo' | 'status'>

function toRow(a: AuPairInput) {
  return {
    name: a.name,
    age: a.age,
    country: a.country,
    flag: a.flag,
    languages: a.languages,
    german: a.german,
    experience: a.experience,
    license: a.license,
    available_from: a.availableFrom,
    duration: a.duration,
    about: a.about,
    swims: a.swims,
    smoker: a.smoker,
    pets_ok: a.petsOk,
    special_needs_experience: a.specialNeedsExperience,
    max_children: a.maxChildren,
    areas: a.areas,
    diet: a.diet,
    photo_path: a.photoPath ?? null,
  }
}

export async function fetchApprovedAuPairs(): Promise<AuPair[]> {
  const { data, error } = await supabase
    .from('aupairs')
    .select(COLUMNS)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as AuPairRow[]).map(fromRow)
}

export async function fetchAllAuPairs(): Promise<AuPair[]> {
  const { data, error } = await supabase
    .from('aupairs')
    .select(`${COLUMNS}, user_id`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as (AuPairRow & { user_id: string })[]).map((r) => ({ ...fromRow(r), userId: r.user_id }))
}

export async function fetchOwnAuPair(userId: string): Promise<AuPair | null> {
  const { data, error } = await supabase.from('aupairs').select(COLUMNS).eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as AuPairRow) : null
}

export async function saveOwnAuPair(userId: string, input: AuPairInput) {
  const { error } = await supabase
    .from('aupairs')
    .upsert({ user_id: userId, ...toRow(input) }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function setAuPairStatus(id: string, status: NonNullable<AuPair['status']>) {
  const { error } = await supabase.from('aupairs').update({ status }).eq('id', id)
  if (error) throw error
}

export async function uploadPhoto(userId: string, file: File) {
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('photos').upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}

export async function removePhoto(path: string) {
  await supabase.storage.from('photos').remove([path])
}

export interface ContactMessage {
  id?: string
  role: string
  name: string
  email: string
  phone: string
  message: string
  handled?: boolean
  created_at?: string
}

export async function saveMessage(message: ContactMessage) {
  const { error } = await supabase.from('messages').insert({
    role: message.role,
    name: message.name,
    email: message.email,
    phone: message.phone,
    message: message.message,
  })
  if (error) throw error
}

/** Nur für Admins: vollständige Namen aller Konten, nach Benutzer-ID. */
export async function fetchAccountNames(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return new Map(
    (data ?? []).map((p) => [p.id as string, [p.first_name ?? p.name, p.last_name].filter(Boolean).join(' ')]),
  )
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as ContactMessage[]
}

export async function setMessageHandled(id: string, handled: boolean) {
  const { error } = await supabase.from('messages').update({ handled }).eq('id', id)
  if (error) throw error
}

/** Merkliste – nur für eingeloggte Familien, gespeichert in der Datenbank. */
export function useFavorites() {
  const { session, profile } = useAuth()
  const familyId = profile?.role === 'family' ? session?.user.id : undefined
  const [favs, setFavs] = useState<string[]>([])

  useEffect(() => {
    if (!familyId) {
      setFavs([])
      return
    }
    supabase
      .from('favorites')
      .select('aupair_id')
      .eq('family_id', familyId)
      .then(({ data }) => setFavs((data ?? []).map((f) => f.aupair_id as string)))
  }, [familyId])

  const toggle = useCallback(
    async (id: string) => {
      if (!familyId) return
      const isFav = favs.includes(id)
      setFavs((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]))
      const { error } = isFav
        ? await supabase.from('favorites').delete().eq('family_id', familyId).eq('aupair_id', id)
        : await supabase.from('favorites').insert({ family_id: familyId, aupair_id: id })
      if (error) setFavs((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)))
    },
    [familyId, favs],
  )

  return { favs, toggle, canFavorite: Boolean(familyId) }
}

export function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })
}

export function nextMonths(count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}
