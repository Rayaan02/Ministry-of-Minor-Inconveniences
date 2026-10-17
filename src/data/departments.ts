import type { DepartmentId, SeverityId } from '../types'

export interface Department {
  id: DepartmentId
  name: string
  short: string
  blurb: string
  /** Two-letter stamp code used on paperwork. */
  code: string
  accent: string
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'socks',
    name: 'Bureau of Missing Socks',
    short: 'Missing Socks',
    blurb: 'Laundry-adjacent disappearances, unmatched hosiery, drawer discrepancies.',
    code: 'BMS',
    accent: 'var(--lavender)'
  },
  {
    id: 'monday',
    name: 'Directorate of Monday Affairs',
    short: 'Monday Affairs',
    blurb: 'Weekday cruelty, alarm clock misconduct, and the illegal return of Monday.',
    code: 'DMA',
    accent: 'var(--coral-red)'
  },
  {
    id: 'snack',
    name: 'Office of Snack Disappearances',
    short: 'Snack Disappearances',
    blurb: 'Tea incidents, biscuit drowning, fry theft, communal fridge crimes.',
    code: 'OSD',
    accent: 'var(--golden-yellow)'
  },
  {
    id: 'awkward',
    name: 'Department of Social Awkwardness',
    short: 'Social Awkwardness',
    blurb: 'Waving at strangers, “you too” at waiters, three-second eye contact violations.',
    code: 'DSA',
    accent: 'var(--sky-blue)'
  },
  {
    id: 'tech',
    name: 'Bureau of Technological Betrayal',
    short: 'Technological Betrayal',
    blurb: 'Batteries dying at 1%, printers sensing fear, Wi-Fi vanishing at 9pm.',
    code: 'BTB',
    accent: 'var(--forest-green)'
  },
  {
    id: 'nonsense',
    name: 'General Nonsense Division',
    short: 'General Nonsense',
    blurb: 'Everything else. Which is, evolutionarily speaking, most things.',
    code: 'GND',
    accent: 'var(--wood-brown)'
  }
]

export function getDepartment(id: DepartmentId): Department {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[DEPARTMENTS.length - 1]
}

export interface Severity {
  id: SeverityId
  label: string
  blurb: string
  weight: number
  color: string
  rare?: boolean
}

export const SEVERITIES: Severity[] = [
  {
    id: 'mild',
    label: 'Mild Annoyance',
    blurb: 'I sighed once. I would like it noted.',
    weight: 1,
    color: 'var(--grass-green)'
  },
  {
    id: 'moderate',
    label: 'Moderate Outrage',
    blurb: 'I have said “honestly” out loud. Alone.',
    weight: 2,
    color: 'var(--golden-yellow)'
  },
  {
    id: 'national',
    label: 'National Emergency',
    blurb: 'I have told several people about this.',
    weight: 3,
    color: 'var(--coral-red)'
  },
  {
    id: 'existential',
    label: 'Existential Crisis',
    blurb: 'I have questioned the arrangement of the universe.',
    weight: 4,
    color: 'var(--lavender)'
  }
]

/** Rare severity, surfaced randomly when filing a complaint. */
export const RARE_SEVERITY: Severity = {
  id: 'universe',
  label: 'The Universe Is Personally Against Me',
  blurb: 'Reserved for cases where even the Ministry is a little bit scared.',
  weight: 5,
  color: 'var(--deep-navy)',
  rare: true
}

export function getSeverity(id: SeverityId): Severity {
  return SEVERITIES.find((s) => s.id === id) ?? RARE_SEVERITY
}

export const INVESTIGATOR = 'Sir Pigeon III'

export const REACTIONS = [
  { id: 'justice' as const, label: 'Justice Served', hint: 'The Ministry did something.' },
  { id: 'outrageous' as const, label: 'Outrageous', hint: 'Deeply, deeply not okay.' },
  { id: 'sameHere' as const, label: 'Same Here', hint: 'This happened to me too.' }
]
