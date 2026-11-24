export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type Level = (typeof LEVELS)[number]

export interface AuPair {
  id: string
  name: string
  age: number
  country: string
  flag: string
  languages: string[]
  german: Level
  experience: string[]
  license: boolean
  availableFrom: string
  duration: number
  about: string
  photo?: string
  photoPath?: string | null
  status?: 'pending' | 'approved' | 'rejected'
}

export const COUNTRIES = [
  { name: 'Kolumbien', flag: '🇨🇴' },
  { name: 'Brasilien', flag: '🇧🇷' },
  { name: 'Mexiko', flag: '🇲🇽' },
  { name: 'Spanien', flag: '🇪🇸' },
  { name: 'Italien', flag: '🇮🇹' },
  { name: 'Frankreich', flag: '🇫🇷' },
  { name: 'Georgien', flag: '🇬🇪' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'Kenia', flag: '🇰🇪' },
  { name: 'Südafrika', flag: '🇿🇦' },
  { name: 'Madagaskar', flag: '🇲🇬' },
  { name: 'Indonesien', flag: '🇮🇩' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Philippinen', flag: '🇵🇭' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Anderes Land', flag: '🌍' },
]

export const EXPERIENCE = ['Babys', 'Kleinkinder', 'Schulkinder', 'Hausaufgabenhilfe', 'Kochen', 'Sport & Musik']

export const LANGUAGES = [
  'Englisch',
  'Spanisch',
  'Französisch',
  'Italienisch',
  'Portugiesisch',
  'Russisch',
  'Ukrainisch',
  'Georgisch',
  'Swahili',
  'Indonesisch',
  'Vietnamesisch',
]
