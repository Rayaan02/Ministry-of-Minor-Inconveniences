import { useEffect, useState, type ReactNode } from 'react'
import { ChevronRight, FastForward } from 'lucide-react'
import { useTypewriter } from '../lib/useTypewriter'

interface DialogueBoxProps {
  speaker: string
  lines: string[]
  portrait?: ReactNode
  /** Called once the final page has been dismissed. */
  onFinish?: () => void
  finishLabel?: string
  /** Tint used for the speaker nameplate. */
  accent?: string
  onPageChange?: (index: number) => void
}

/**
 * RPG-style dialogue box with a typewriter effect, a skip-typing button,
 * and page-by-page advancement. Reduced motion renders text instantly.
 */
export function DialogueBox({
  speaker,
  lines,
  portrait,
  onFinish,
  finishLabel = 'CONTINUE',
  accent = 'var(--coral-red)',
  onPageChange
}: DialogueBoxProps) {
  const [page, setPage] = useState(0)
  const safeLines = lines.length > 0 ? lines : ['…']
  const current = safeLines[Math.min(page, safeLines.length - 1)]
  const { shown, done, complete } = useTypewriter(current)
  const isLast = page >= safeLines.length - 1

  useEffect(() => {
    onPageChange?.(page)
  }, [page, onPageChange])

  function advance() {
    if (!done) {
      complete()
      return
    }
    if (isLast) {
      onFinish?.()
      return
    }
    setPage((value) => value + 1)
  }

  return (
    <div className="dialogue-box anim-fade-up" onClick={advance} role="group" aria-label={`Dialogue with ${speaker}`}>
      <div className="absolute -top-4 left-4 badge" style={{ background: accent, color: '#FFF8F2', borderColor: 'var(--deep-navy)' }}>
        {speaker}
      </div>
      <div className="flex gap-3 items-start">
        {portrait && <div className="hidden sm:block shrink-0 w-16">{portrait}</div>}
        <p className="text-xl leading-relaxed min-h-[4.5rem] sm:min-h-[3.5rem] caret" aria-live="polite">
          {shown}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <span className="font-pixel text-[9px] opacity-70">
          PAGE {Math.min(page + 1, safeLines.length)} / {safeLines.length}
        </span>
        <div className="flex gap-2">
          {!done && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); complete() }}>
              <FastForward size={14} aria-hidden="true" /> SKIP
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation()
              advance()
            }}
          >
            {isLast ? finishLabel : 'NEXT'} <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
