import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

export interface TypewriterState {
  shown: string
  done: boolean
  complete: () => void
}

/** Types text out one character at a time; instant when reduced motion is requested. */
export function useTypewriter(text: string, speed = 19): TypewriterState {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(text)
  const [done, setDone] = useState(true)
  const timer = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => {
    if (reduced) {
      stop()
      setShown(text)
      setDone(true)
      return
    }
    stop()
    setShown('')
    setDone(false)
    let index = 0
    timer.current = window.setInterval(() => {
      index += 1
      if (index >= text.length) {
        setShown(text)
        setDone(true)
        stop()
        return
      }
      setShown(text.slice(0, index))
    }, speed)
    return stop
  }, [text, speed, reduced, stop])

  const complete = useCallback(() => {
    stop()
    setShown(text)
    setDone(true)
  }, [text, stop])

  return { shown, done, complete }
}
