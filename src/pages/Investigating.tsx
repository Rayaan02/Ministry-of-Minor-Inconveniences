import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import type { CaseFile, ComplaintDraft } from '../types'
import { getDepartment, getSeverity } from '../data/departments'
import { generateLocalContent } from '../lib/generator'
import { requestAiReport } from '../lib/ai'
import { useStore } from '../state/store'
import { SirPigeon } from '../components/Sprites'

const STEPS = [
  'Assigning underqualified investigator…',
  'Interrogating nearby pigeons…',
  'Searching for suspicious biscuits…',
  'Consulting the Ministry’s only functioning brain cell…',
  'Stamping unnecessary paperwork…',
  'Escalating to a smaller, equally confused department…',
  'Filing exhibit A (a napkin)…',
  'Reaching a conclusion of debatable legality…'
]

const STEP_MS = 520

export function Investigating() {
  const location = useLocation()
  const navigate = useNavigate()
  const { fileComplaint } = useStore()
  const draft = (location.state as { draft?: ComplaintDraft } | null)?.draft ?? null

  const [stepIndex, setStepIndex] = useState(0)
  const [mode, setMode] = useState<'checking' | 'demo' | 'ai'>('checking')
  const work = useRef<Promise<CaseFile> | null>(null)
  const navigated = useRef(false)

  // Advance the on-screen investigation log.
  useEffect(() => {
    if (!draft) return
    const timer = window.setInterval(() => {
      setStepIndex((value) => (value >= STEPS.length - 1 ? value : value + 1))
    }, STEP_MS)
    return () => window.clearInterval(timer)
  }, [draft])

  // Run generation exactly once (StrictMode-safe) and then reveal the case file.
  useEffect(() => {
    if (!draft) return
    let active = true

    if (!work.current) {
      work.current = (async () => {
        const startedAt = Date.now()
        const ai = await requestAiReport(draft)
        const content = ai?.content ?? generateLocalContent(draft)
        const caseFile = fileComplaint(draft, content, ai ? { mode: 'ai', aiModel: ai.model } : { mode: 'demo' })
        if (active) setMode(ai ? 'ai' : 'demo')
        const minimum = STEPS.length * STEP_MS + 600
        const elapsed = Date.now() - startedAt
        if (elapsed < minimum) await new Promise((resolve) => window.setTimeout(resolve, minimum - elapsed))
        return caseFile
      })()
    }

    work.current.then((caseFile) => {
      if (active && !navigated.current) {
        navigated.current = true
        navigate(`/case/${caseFile.id}`, { replace: true })
      }
    })

    return () => {
      active = false
    }
  }, [draft, fileComplaint, navigate])

  if (!draft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="panel p-6">
          <h1 className="font-pixel text-[13px] mb-3">NO COMPLAINT IN PROGRESS</h1>
          <p className="text-lg mb-4">
            The Ministry has lost your paperwork, which is alarming given that you have not filed anything yet.
          </p>
          <Link className="btn btn-primary" to="/file">
            FILE A COMPLAINT
          </Link>
        </div>
      </div>
    )
  }

  const department = getDepartment(draft.department)
  const severity = getSeverity(draft.severity)
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div className="min-h-screen" style={{ background: 'var(--deep-navy)' }}>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="panel parchment p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="badge" style={{ background: department.accent }}>
              {department.code} · {department.name.toUpperCase()}
            </span>
            <span className="badge" style={{ background: severity.color, color: severity.id === 'universe' ? 'var(--warm-cream)' : 'var(--deep-navy)' }}>
              {severity.label.toUpperCase()}
            </span>
          </div>

          <h1 className="font-pixel text-[12px] md:text-[14px] leading-relaxed mb-2">INVESTIGATION IN PROGRESS</h1>
          <p className="text-xl mb-1">“{draft.title}”</p>
          <p className="text-base opacity-80 mb-5">
            Filed by {draft.complainant || 'Anonymous Citizen'} · Lead investigator: Sir Pigeon III
          </p>

          <div className="flex items-center gap-4 mb-5">
            <SirPigeon className="w-20 shrink-0 anim-bob" />
            <div className="flex-1">
              <div className="h-6 border-4 border-navy bg-cream overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full" style={{ width: `${progress}%`, background: 'var(--coral-red)', transition: 'width 400ms steps(6)' }} />
              </div>
              <p className="font-pixel text-[9px] mt-2 flex items-center gap-2">
                {mode === 'checking' ? (
                  <>
                    <Loader2 size={12} className="animate-spin" aria-hidden="true" /> CONTACTING THE MINISTRY NEVERVAULT…
                  </>
                ) : mode === 'ai' ? (
                  <>
                    <Search size={12} aria-hidden="true" /> AI-ASSISTED INVESTIGATION
                  </>
                ) : (
                  <>
                    <Search size={12} aria-hidden="true" /> LOCAL INVESTIGATION ENGINE (DEMO MODE)
                  </>
                )}
              </p>
            </div>
          </div>

          <ul className="space-y-1.5" aria-live="polite">
            {STEPS.slice(0, stepIndex + 1).map((step, index) => (
              <li key={step} className="text-lg anim-fade-up">
                <span style={{ color: 'var(--coral-red-deep)' }}>[✓]</span> {step}
                {index === stepIndex && <span className="caret" />}
              </li>
            ))}
          </ul>

          <p className="text-sm mt-5 opacity-80">
            Please remain seated. We have misplaced the emergency procedures. This is normal.
          </p>
        </div>
      </div>
    </div>
  )
}
