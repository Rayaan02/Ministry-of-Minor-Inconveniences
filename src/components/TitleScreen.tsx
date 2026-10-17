import { useEffect, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface TitleScreenProps {
  onEnter: () => void
}

const LOG_LINES = [
  'BOOTING MINISTRY SUBSYSTEM...',
  'FORM 44-B INITIALIZED',
  'PIGEON COORDINATION MATRIX: ONLINE',
  'BUREAUCRACY OVERHEAD: 97.4%',
  'DEPARTMENT OF SILLY PROBLEMS: READY',
  'WARNING: TAKING PROBLEMS FAR TOO SERIOUSLY',
  '...STAND BY FOR ENTRY...'
]

export function TitleScreen({ onEnter }: TitleScreenProps) {
  const reduced = useReducedMotion()
  const [line, setLine] = useState(0)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (reduced) {
      setLine(LOG_LINES.length - 1)
      const t1 = window.setTimeout(() => setReady(true), 300)
      const t2 = window.setInterval(() => setBlink((b) => !b), 500)
      return () => {
        window.clearTimeout(t1)
        window.clearInterval(t2)
      }
    }
    const timers: number[] = []
    LOG_LINES.forEach((_l, i) => {
      timers.push(
        window.setTimeout(() => {
          setLine(i)
          if (i === LOG_LINES.length - 1) {
            timers.push(window.setTimeout(() => setReady(true), 400))
          }
        }, i * 220 + 200)
      )
    })
    timers.push(window.setInterval(() => setBlink((b) => !b), 500))
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.clearInterval(timers[timers.length - 1])
    }
  }, [reduced])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-deep-navy"
      style={{
        transition: 'opacity 600ms ease',
        opacity: visible ? 1 : 0
      }}
    >
      <div className="w-full max-w-2xl panel p-4 sm:p-6">
        <div className="text-center mb-4">
          <p className="badge inline-flex" style={{ background: 'var(--golden-yellow)' }}>
            DEPARTMENT OF SILLY PROBLEMS
          </p>
          <h1 className="font-pixel text-xl sm:text-2xl mt-3 leading-tight">
            THE MINISTRY OF MINOR INCONVENIENCES
          </h1>
          <p className="text-lg mt-2">“Taking your smallest problems far too seriously.”</p>
        </div>

        <div
          className="panel p-3 mt-2 font-mono text-[10px] sm:text-xs leading-relaxed"
          style={{ background: 'rgba(41,54,79,0.95)', color: '#a3ffb0', minHeight: '150px' }}
        >
          {LOG_LINES.slice(0, line + 1).map((l, i) => (
            <p key={i}>&gt; {l}</p>
          ))}
          {line < LOG_LINES.length - 1 && <p>&gt; _</p>}
        </div>

        <div className="flex flex-col items-center mt-4 gap-2">
          {ready && (
            <button
              type="button"
              className="btn btn-lg btn-secondary"
              onClick={onEnter}
              autoFocus
            >
              {reduced ? 'ENTER' : blink ? '[ ENTER THE MINISTRY ]' : '[                ]'}
            </button>
          )}
          <p className="text-base opacity-80 text-center">
            A fictional satire. No real government was inconvenienced.
          </p>
        </div>
      </div>
    </div>
  )
}
