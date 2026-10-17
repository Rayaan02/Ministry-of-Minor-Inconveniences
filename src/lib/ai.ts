import type { CaseContent, ComplaintDraft, SpriteKey, Suspect } from '../types'
import { getDepartment, getSeverity } from '../data/departments'

export interface AiResult {
  content: CaseContent
  model: string
}

const SPRITES: SpriteKey[] = ['clock', 'machine', 'creature', 'person', 'shadow', 'bird', 'object']

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text) return null
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function spriteFromName(name: string): SpriteKey {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 9973
  return SPRITES[hash % SPRITES.length]
}

/** Strict client-side validation of anything the network hands back. */
export function validateAiContent(raw: unknown): CaseContent | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  if (!Array.isArray(data.suspects) || data.suspects.length !== 3) return null
  if (!Array.isArray(data.evidence) || data.evidence.length !== 3) return null

  const suspects: Suspect[] = []
  for (const item of data.suspects) {
    const s = item as Record<string, unknown>
    const name = clean(s?.name, 60)
    const role = clean(s?.role, 44)
    const guilt = clean(s?.guilt, 110)
    if (!name || !role || !guilt) return null
    suspects.push({ name, role, guilt, sprite: spriteFromName(name) })
  }

  const evidence: string[] = []
  for (const item of data.evidence) {
    const text = clean(item, 150)
    if (!text) return null
    evidence.push(text)
  }

  const summary = clean(data.summary, 620)
  const verdict = clean(data.verdict, 220)
  const correctiveAction = clean(data.correctiveAction, 220)
  const compensation = clean(data.compensation, 220)
  if (!summary || !verdict || !correctiveAction || !compensation) return null

  return { suspects, evidence, summary, verdict, correctiveAction, compensation }
}

/**
 * Ask the optional server-side AI endpoint for an investigation.
 * Returns null on any failure so the caller can fall back to DEMO MODE.
 * Secrets never reach the browser: the server holds AI_API_KEY.
 */
export async function requestAiReport(draft: ComplaintDraft): Promise<AiResult | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 22_000)
  try {
    const response = await fetch('/api/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        complainant: draft.complainant,
        title: draft.title,
        description: draft.description,
        department: getDepartment(draft.department).name,
        severity: getSeverity(draft.severity).label
      })
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { ok?: boolean; mode?: string; model?: string; report?: unknown }
    if (!payload?.ok || payload.mode !== 'ai') return null
    const content = validateAiContent(payload.report)
    if (!content) return null
    return { content, model: typeof payload.model === 'string' ? payload.model : 'configured model' }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
