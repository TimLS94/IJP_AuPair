import type { Diet, Level } from './aupairs'

export const AREAS = ['Großstadt', 'Kleinstadt', 'Ländlich'] as const
export type Area = (typeof AREAS)[number]

export interface Family {
  id: string
  name: string
  city: string
  state: string
  area: Area
  children: number
  childAges: string[]
  languages: string[]
  tasks: string[]
  minGerman: Level
  needsLicense: boolean
  pets: boolean
  startFrom: string
  duration: number
  about: string
  hoursPerWeek: number
  pocketMoney: number
  courseSupport: boolean
  ownBathroom: boolean
  carPrivate: boolean
  transitTicket: boolean
  singleParent: boolean
  specialNeeds: boolean
  needsSwimming: boolean
  nonsmokerRequired: boolean
  diet: Diet
  photo?: string
  photoPath?: string | null
  status?: 'pending' | 'approved' | 'rejected'
}

export const STATES = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
]

export const CHILD_AGES = ['Babys', 'Kleinkinder', 'Schulkinder']

export const TASKS = ['Hausaufgabenhilfe', 'Kochen', 'Sport & Musik']
