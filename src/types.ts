export type SeverityId = 'mild' | 'moderate' | 'national' | 'existential' | 'universe'

export type DepartmentId = 'socks' | 'monday' | 'snack' | 'awkward' | 'tech' | 'nonsense'

export type CaseMode = 'demo' | 'ai'

export type SpriteKey = 'clock' | 'machine' | 'creature' | 'person' | 'shadow' | 'bird' | 'object'

export interface Suspect {
  name: string
  role: string
  guilt: string
  sprite: SpriteKey
}

export interface Reactions {
  justice: number
  outrageous: number
  sameHere: number
}

export interface ComplaintDraft {
  complainant: string
  title: string
  description: string
  department: DepartmentId
  severity: SeverityId
}

export interface CaseContent {
  suspects: Suspect[]
  evidence: string[]
  summary: string
  verdict: string
  correctiveAction: string
  compensation: string
}

export interface CaseFile extends CaseContent {
  id: string
  number: number
  createdAt: number
  complainant: string
  anonymous: boolean
  title: string
  description: string
  department: DepartmentId
  severity: SeverityId
  investigator: string
  status: string
  statusNote: string
  mode: CaseMode
  aiModel?: string
  reactions: Reactions
  seeded: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: number
}
