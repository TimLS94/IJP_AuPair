import { LEVELS, type AuPair } from '../data/aupairs'
import type { Family } from '../data/families'

export interface FitItem {
  label: string
  ok: boolean
}

export interface Fit {
  percent: number
  items: FitItem[]
}

const monthIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}

const list = (values: string[]) => values.join(', ')

/**
 * Vergleicht ein Familienprofil mit einem Au-pair-Profil.
 * Es zählen nur Kriterien, die für dieses Paar relevant sind (z. B. Schwimmen nur, wenn die Familie es verlangt).
 */
export function computeFit(family: Family, aupair: AuPair): Fit {
  const items: FitItem[] = []
  const add = (label: string, ok: boolean) => items.push({ label, ok })

  add(
    `Deutsch ${aupair.german} (gewünscht ab ${family.minGerman})`,
    LEVELS.indexOf(aupair.german) >= LEVELS.indexOf(family.minGerman),
  )

  if (family.childAges.length > 0) {
    const missing = family.childAges.filter((a) => !aupair.experience.includes(a))
    add(
      missing.length === 0 ? `Erfahrung mit ${list(family.childAges)}` : `Keine Erfahrung mit ${list(missing)}`,
      missing.length === 0,
    )
  }

  if (family.tasks.length > 0) {
    const missing = family.tasks.filter((t) => !aupair.experience.includes(t))
    add(missing.length === 0 ? `Aufgaben: ${list(family.tasks)}` : `Fehlt: ${list(missing)}`, missing.length === 0)
  }

  const maxChildren = aupair.maxChildren >= 6 ? Infinity : aupair.maxChildren
  add(
    `${family.children} ${family.children === 1 ? 'Kind' : 'Kinder'} (Au-pair: bis ${aupair.maxChildren >= 6 ? '6+' : aupair.maxChildren})`,
    family.children <= maxChildren,
  )

  if (family.specialNeeds)
    add(
      aupair.specialNeedsExperience ? 'Erfahrung mit Förderbedarf' : 'Keine Erfahrung mit Förderbedarf (gewünscht)',
      aupair.specialNeedsExperience,
    )
  if (family.needsLicense) add(aupair.license ? 'Führerschein' : 'Kein Führerschein (gewünscht)', aupair.license)
  if (family.needsSwimming) add(aupair.swims ? 'Kann schwimmen' : 'Kann nicht schwimmen (gewünscht)', aupair.swims)
  if (family.nonsmokerRequired)
    add(aupair.smoker ? 'Raucht (Familie wünscht Nichtraucher)' : 'Nichtraucher', !aupair.smoker)
  if (family.pets) add(aupair.petsOk ? 'Haustiere sind okay' : 'Möchte keine Haustiere', aupair.petsOk)

  if (aupair.areas.length > 0) {
    const ok = aupair.areas.includes(family.area)
    add(ok ? `Wohnlage ${family.area}` : `Wohnlage ${family.area} (Au-pair wünscht ${list(aupair.areas)})`, ok)
  }

  const startGap = Math.abs(monthIndex(aupair.availableFrom) - monthIndex(family.startFrom))
  add(startGap <= 2 ? 'Startzeitpunkt passt' : `Start liegt ${startGap} Monate auseinander`, startGap <= 2)
  add(
    aupair.duration >= family.duration
      ? `Dauer ${family.duration} Monate`
      : `Dauer: Au-pair ${aupair.duration}, Familie ${family.duration} Monate`,
    aupair.duration >= family.duration,
  )

  const ok = items.filter((i) => i.ok).length
  return { percent: Math.round((ok / items.length) * 100), items }
}
