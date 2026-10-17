import { useMemo } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const COLOURS = ['#E97862', '#F5C86A', '#79B86A', '#75C9E8', '#A994D4', '#FFF0C9', '#356B53']

/** Temporary pixel confetti. Silently disabled under prefers-reduced-motion. */
export function Confetti({ count = 60, duration = 3.2 }: { count?: number; duration?: number }) {
  const reduced = useReducedMotion()
  const bits = useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 1.4,
      time: duration + Math.random() * 1.8,
      colour: COLOURS[index % COLOURS.length],
      size: 8 + Math.round(Math.random() * 8)
    }))
  }, [count, duration])

  if (reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="confetti-bit"
          style={{
            left: `${bit.left}%`,
            width: bit.size,
            height: bit.size,
            background: bit.colour,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.time}s`
          }}
        />
      ))}
    </div>
  )
}
