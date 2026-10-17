import { useEffect, useState } from 'react'
import { Apple, Chrome, Sparkles, X } from 'lucide-react'
import { signInWithApple, signInWithGoogle } from '../lib/auth'
import type { User } from '../lib/storage'
import { useStore } from '../state/store'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { setUser, notify } = useStore()
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function signIn(provider: 'google' | 'apple') {
    setLoading(provider)
    try {
      const user = provider === 'google' ? await signInWithGoogle() : await signInWithApple()
      setUser(user)
      notify(
        `Welcome, ${user.name}. Your pigeon credentials have been stamped.`,
        'good',
        'SIGNED IN'
      )
      onSuccess(user)
      onClose()
    } catch {
      notify('The Ministry failed to process your identity. Please try again.', 'info', 'SIGN IN FAILED')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/80 p-3">
      <div className="panel w-full max-w-sm p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="badge" style={{ background: 'var(--golden-yellow)' }}>
              <Sparkles size={11} aria-hidden="true" /> MINISTRY IDENTIFICATION
            </p>
            <p className="font-pixel text-[11px] leading-relaxed mt-2">
              SIGN IN (STRICTLY OPTIONAL)
            </p>
            <p className="text-base mt-1">
              For the purposes of this entirely fictional department, we are prepared to
              pretend you have an account.
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="Close sign in">
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            className="tile items-center"
            onClick={() => signIn('google')}
            disabled={loading !== null}
          >
            <span className="font-pixel text-[9px] flex items-center gap-2">
              <Chrome size={13} aria-hidden="true" /> CONTINUE WITH GOOGLE
            </span>
            <span className="text-base opacity-90">
              {loading === 'google' ? 'Stamping credentials...' : 'Completely fictional OAuth'}
            </span>
          </button>

          <button
            type="button"
            className="tile items-center"
            onClick={() => signIn('apple')}
            disabled={loading !== null}
          >
            <span className="font-pixel text-[9px] flex items-center gap-2">
              <Apple size={13} aria-hidden="true" /> CONTINUE WITH APPLE
            </span>
            <span className="text-base opacity-90">
              {loading === 'apple' ? 'Verifying fruit-based identity...' : 'Mocked with tremendous dignity'}
            </span>
          </button>
        </div>

        <div className="hr-pixel" />
        <p className="text-base text-center opacity-80">
          No real sign-in occurs. This demo stores your mock identity in localStorage only.
        </p>
      </div>
    </div>
  )
}
