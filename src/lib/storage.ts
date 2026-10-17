import type { Achievement, CaseFile, ComplaintDraft, Reactions } from '../types'
import { buildCase, generateLocalContent, setCaseCounter } from './generator'
import type { QuestStatus } from './quests'

const CASES_KEY = 'mmi.cases.v2'
const PROFILE_KEY = 'mmi.profile.v2'
const SEED_KEY = 'mmi.seeded.v2'

export interface User {
  id: string
  name: string
  email: string
  provider: 'google' | 'apple' | 'guest'
  avatar?: string
}

export interface Profile {
  complaintsFiled: number
  pigeonClicks: number
  promoted: boolean
  achievements: Achievement[]
  reactionGiven: Record<string, keyof Reactions>
  user?: User
  quests?: Record<string, QuestStatus>
  entered?: boolean
}

export const EMPTY_PROFILE: Profile = {
  complaintsFiled: 0,
  pigeonClicks: 0,
  promoted: false,
  achievements: [],
  reactionGiven: {}
}

/* ============================================================
   Safe localStorage access — never throw on corrupt data
   ============================================================ */
function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* storage unavailable — ignore */
    }
    return null
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* ============================================================
   Case validation — defends against corrupted or tampered data
   ============================================================ */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isCaseFile(value: unknown): value is CaseFile {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.number === 'number' &&
    typeof c.createdAt === 'number' &&
    typeof c.title === 'string' &&
    typeof c.complainant === 'string' &&
    typeof c.department === 'string' &&
    typeof c.severity === 'string' &&
    typeof c.summary === 'string' &&
    typeof c.verdict === 'string' &&
    isStringArray(c.evidence) &&
    Array.isArray(c.suspects) &&
    !!c.reactions &&
    typeof c.reactions === 'object'
  )
}

function normaliseCase(raw: CaseFile): CaseFile {
  return {
    ...raw,
    description: typeof raw.description === 'string' ? raw.description : '',
    correctiveAction: raw.correctiveAction ?? 'The Ministry has misplaced the corrective action.',
    compensation: raw.compensation ?? 'One (1) apology, unsigned.',
    status: raw.status ?? 'OFFICIALLY RESOLVED',
    statusNote: raw.statusNote ?? 'Resolution not guaranteed in any known universe.',
    investigator: raw.investigator ?? 'Sir Pigeon III',
    mode: raw.mode === 'ai' ? 'ai' : 'demo',
    seeded: Boolean(raw.seeded),
    anonymous: Boolean(raw.anonymous),
    reactions: {
      justice: Number(raw.reactions?.justice) || 0,
      outrageous: Number(raw.reactions?.outrageous) || 0,
      sameHere: Number(raw.reactions?.sameHere) || 0
    },
    suspects: (raw.suspects ?? []).slice(0, 3).map((s) => ({
      name: String(s?.name ?? 'Unnamed Suspect'),
      role: String(s?.role ?? 'Role Unknown'),
      guilt: String(s?.guilt ?? 'Declined to comment.'),
      sprite: s?.sprite ?? 'creature'
    }))
  }
}

/* ============================================================
   Seed cases — clearly marked fictional examples
   ============================================================ */
const SEED_DRAFTS: Array<{ draft: ComplaintDraft; daysAgo: number; reactions: Reactions }> = [
  {
    draft: {
      complainant: 'Margaret Pemberton',
      title: 'My socks keep disappearing in the washing machine',
      description:
        'I put four pairs in on Sunday. I removed three socks and a receipt. I do not own a receipt machine.',
      department: 'socks',
      severity: 'moderate'
    },
    daysAgo: 21,
    reactions: { justice: 42, outrageous: 17, sameHere: 118 }
  },
  {
    draft: {
      complainant: 'Anonymous Whistleblower',
      title: 'Monday mornings should be illegal',
      description:
        'Every week, without fail, Monday arrives with the confidence of someone who was not invited.',
      department: 'monday',
      severity: 'national'
    },
    daysAgo: 14,
    reactions: { justice: 96, outrageous: 61, sameHere: 240 }
  },
  {
    draft: {
      complainant: 'Biscuit Enjoyer #7',
      title: 'My biscuit fell into my tea',
      description: 'It was a good biscuit. It has become one with the tea. The tea is ruined. So am I.',
      department: 'snack',
      severity: 'existential'
    },
    daysAgo: 9,
    reactions: { justice: 58, outrageous: 12, sameHere: 173 }
  },
  {
    draft: {
      complainant: 'D. Owning',
      title: 'My phone battery dies at exactly 1%',
      description:
        'Not 0%. Not 2%. Always 1%. It has never once given me a full percent of dignity.',
      department: 'tech',
      severity: 'mild'
    },
    daysAgo: 6,
    reactions: { justice: 33, outrageous: 44, sameHere: 205 }
  },
  {
    draft: {
      complainant: 'Fry Guardian',
      title: 'My friend keeps stealing my fries',
      description:
        'She says she is “just having one”. There are no ones left. There is only betrayal, and salt.',
      department: 'snack',
      severity: 'moderate'
    },
    daysAgo: 3,
    reactions: { justice: 71, outrageous: 88, sameHere: 156 }
  }
]

function seedCases(): CaseFile[] {
  let counter = 40
  const seeds: CaseFile[] = SEED_DRAFTS.map((seed, index) => {
    const content = generateLocalContent(seed.draft)
    const built = buildCase(seed.draft, content, { mode: 'demo', seeded: true })
    counter = Math.max(counter, built.number)
    return {
      ...built,
      id: `MMI-${String(index + 1).padStart(5, '0')}`,
      number: index + 1,
      createdAt: Date.now() - seed.daysAgo * 86_400_000,
      reactions: seed.reactions
    }
  })
  setCaseCounter(counter)
  return seeds
}

/* ============================================================
   Public API
   ============================================================ */
export function loadCases(): CaseFile[] {
  const stored = readJSON<unknown>(CASES_KEY)
  if (stored === null) {
    // First run (or corrupted data cleared) — install the example archive.
    const seeds = seedCases()
    writeJSON(CASES_KEY, seeds)
    writeJSON(SEED_KEY, true)
    return sortCases(seeds)
  }
  if (!Array.isArray(stored)) {
    const seeds = seedCases()
    writeJSON(CASES_KEY, seeds)
    return sortCases(seeds)
  }
  const cases = stored.filter(isCaseFile).map(normaliseCase)
  if (cases.length === 0) {
    const seeds = seedCases()
    writeJSON(CASES_KEY, seeds)
    return sortCases(seeds)
  }
  const highest = cases.reduce((max, item) => Math.max(max, item.number), 40)
  setCaseCounter(highest)
  return sortCases(cases)
}

export function sortCases(cases: CaseFile[]): CaseFile[] {
  return [...cases].sort((a, b) => b.createdAt - a.createdAt)
}

export function persistCases(cases: CaseFile[]): void {
  writeJSON(CASES_KEY, cases)
}

export function saveCase(caseFile: CaseFile): CaseFile[] {
  const existing = loadCases().filter((item) => item.id !== caseFile.id)
  const next = sortCases([caseFile, ...existing])
  persistCases(next)
  return next
}

export function findCase(cases: CaseFile[], id: string): CaseFile | undefined {
  return cases.find((item) => item.id === id)
}

export function addReaction(cases: CaseFile[], id: string, key: keyof Reactions): CaseFile[] {
  const next = cases.map((item) =>
    item.id === id ? { ...item, reactions: { ...item.reactions, [key]: item.reactions[key] + 1 } } : item
  )
  persistCases(next)
  return next
}

export function loadProfile(): Profile {
  const stored = readJSON<Partial<Profile>>(PROFILE_KEY)
  if (!stored || typeof stored !== 'object') return { ...EMPTY_PROFILE }
  return {
    complaintsFiled: Number(stored.complaintsFiled) || 0,
    pigeonClicks: Number(stored.pigeonClicks) || 0,
    promoted: Boolean(stored.promoted),
    achievements: Array.isArray(stored.achievements)
      ? stored.achievements.filter(
          (a): a is Achievement => !!a && typeof a.id === 'string' && typeof a.name === 'string'
        )
      : [],
    reactionGiven: stored.reactionGiven && typeof stored.reactionGiven === 'object' ? stored.reactionGiven : {}
  }
}

export function saveProfile(profile: Profile): void {
  writeJSON(PROFILE_KEY, profile)
}

export function setProfileUser(profile: Profile, user: User | undefined): Profile {
  return { ...profile, user }
}

export function clearEverything(): void {
  try {
    window.localStorage.removeItem(CASES_KEY)
    window.localStorage.removeItem(PROFILE_KEY)
    window.localStorage.removeItem(SEED_KEY)
  } catch {
    /* ignore */
  }
}
