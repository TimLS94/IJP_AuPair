import { createClient } from '@supabase/supabase-js'

const clean = (v?: string) => (v ?? '').trim().replace(/^["']|["']$/g, '')

/** Akzeptiert auch URLs mit Zusatz (z. B. ".../rest/v1/") und reduziert sie auf https://<projekt>.supabase.co */
function normalizeUrl(raw: string) {
  try {
    const u = new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`)
    return u.hostname.endsWith('.supabase.co') ? u.origin : ''
  } catch {
    return ''
  }
}

const rawUrl = clean(import.meta.env.VITE_SUPABASE_URL)
const url = normalizeUrl(rawUrl)
const key = clean(import.meta.env.VITE_SUPABASE_ANON_KEY)

/** Leer, wenn alles passt – sonst eine Beschreibung des Konfigurationsfehlers. */
export const configError = !rawUrl
  ? 'VITE_SUPABASE_URL fehlt.'
  : !url
    ? `VITE_SUPABASE_URL ist keine Supabase-Projekt-URL („${rawUrl}“). Erwartet wird https://<projekt>.supabase.co – zu finden unter Project Settings → Data API.`
    : !key
      ? 'VITE_SUPABASE_ANON_KEY fehlt.'
      : /^sb_secret_/.test(key)
        ? 'VITE_SUPABASE_ANON_KEY ist der geheime Secret Key. Bitte den Publishable bzw. anon Key verwenden.'
        : ''

export const isConfigured = !configError

export const supabase = createClient(url || 'http://localhost', key || 'missing')
