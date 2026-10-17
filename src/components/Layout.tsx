import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Archive, Bell, Bird, FilePlus2, Flag, Home, LogIn, LogOut, User, Volume2 } from 'lucide-react'
import { TICKER_LINES } from '../data/notices'
import { useStore } from '../state/store'
import { useReducedMotion } from '../lib/useReducedMotion'
import { TinyPigeon } from './Sprites'
import { AuthModal } from './AuthModal'

const NAV = [
  { to: '/', label: 'VILLAGE', icon: Home },
  { to: '/file', label: 'FILE COMPLAINT', icon: FilePlus2 },
  { to: '/archives', label: 'ARCHIVES', icon: Archive },
  { to: '/notices', label: 'NOTICE BOARD', icon: Bell },
  { to: '/minister', label: 'MINISTER', icon: Bird }
]

function Ticker() {
  const reduced = useReducedMotion()
  const line = TICKER_LINES.join('   ★   ')
  return (
    <div className="ticker-shell no-print">
      <div className="flex items-center gap-3 px-2 py-1">
        <span className="badge shrink-0" style={{ background: 'var(--coral-red)', color: '#FFF8F2', borderColor: 'var(--deep-navy-dark)' }}>
          <Volume2 size={12} aria-hidden="true" /> NOTICES
        </span>
        <div className="overflow-hidden flex-1">
          <span className={`font-pixel text-[9px] tracking-wide ${reduced ? '' : 'anim-ticker'}`}>
            {line}
            {!reduced && <span aria-hidden="true">&nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;{line}</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts, dismissToast } = useStore()
  if (toasts.length === 0) return null
  return (
    <div className="no-print fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-[min(92vw,26rem)]" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="anim-toast text-left panel panel-tight px-3 py-2"
          style={{
            background:
              toast.tone === 'promo' ? 'var(--golden-yellow)' : toast.tone === 'good' ? 'var(--grass-green)' : 'var(--paper)'
          }}
        >
          {toast.title && <div className="font-pixel text-[9px] mb-1">{toast.title}</div>}
          <div className="text-base leading-tight">{toast.message}</div>
        </button>
      ))}
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { profile, cases, setUser } = useStore()
  const location = useLocation()
  const reduced = useReducedMotion()
  const [showPigeon, setShowPigeon] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const aiCase = cases.find((item) => item.mode === 'ai')
  const isWorld = location.pathname === '/'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [location.pathname, reduced])

  // Roaming pigeon easter egg — appears a few seconds after landing somewhere.
  useEffect(() => {
    if (reduced) return
    const timer = window.setTimeout(() => setShowPigeon(true), 9000)
    return () => window.clearTimeout(timer)
  }, [reduced])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {!isWorld && (
        <header className="no-print sticky top-0 z-50 bg-forest border-b-4 border-navy">
        <div className="mx-auto max-w-6xl px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/" className="flex items-center gap-2 group" aria-label="Ministry of Minor Inconveniences home">
            <span className="inline-flex h-9 w-9 items-center justify-center border-4 border-navy" style={{ background: 'var(--golden-yellow)' }}>
              <Flag size={18} aria-hidden="true" className="text-navy" />
            </span>
            <span className="leading-tight">
              <span className="block font-pixel text-[10px] text-cream">MINISTRY OF MINOR</span>
              <span className="block font-pixel text-[10px] text-cream">INCONVENIENCES</span>
            </span>
          </Link>

          <nav aria-label="Main" className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1 overflow-x-auto">
            <ul className="flex items-stretch gap-1">
              {NAV.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 whitespace-nowrap font-pixel text-[9px] px-2.5 py-2 border-4 ${
                          isActive
                            ? 'bg-gold border-navy text-navy'
                            : 'bg-cream border-navy text-navy hover:bg-gold'
                        }`
                      }
                    >
                      <Icon size={13} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="order-2 lg:order-3 flex items-center gap-2 ml-auto flex-wrap justify-end">
            <span
              className="badge"
              style={{ background: aiCase ? 'var(--lavender)' : 'var(--cream)', color: 'var(--deep-navy)' }}
              title={
                aiCase
                  ? 'At least one case in this browser was written by the configured AI model.'
                  : 'Investigations are generated locally by the Ministry’s own filing system. Add AI_API_KEY to enable AI mode.'
              }
            >
              {aiCase ? 'AI-ASSISTED' : 'DEMO MODE'}
            </span>
            <span className="badge hidden sm:inline-flex" style={{ background: 'var(--sky-blue)' }}>
              <Archive size={12} aria-hidden="true" /> {profile.complaintsFiled} FILED
            </span>
            {profile.user ? (
              <div className="flex items-center gap-1.5">
                <span className="badge" style={{ background: 'var(--golden-yellow)' }}>
                  <User size={11} aria-hidden="true" /> {profile.user.name}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-wood"
                  onClick={() => setUser(undefined)}
                >
                  <LogOut size={13} aria-hidden="true" /> SIGN OUT
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setAuthOpen(true)}
              >
                <LogIn size={13} aria-hidden="true" /> SIGN IN
              </button>
            )}
          </div>
        </div>
      </header>
      )}

      {!isWorld && <Ticker />}

      <main className="flex-1">{children}</main>

      <footer className="no-print mt-10 border-t-4 border-navy bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="font-pixel text-[10px] mb-2" style={{ color: 'var(--golden-yellow)' }}>
              THE REPUBLIC OF ABSOLUTELY NOWHERE
            </p>
            <p className="text-base leading-snug">
              The Ministry of Minor Inconveniences is a fictional, satirical government department. It has no authority,
              no budget, and one shared brain cell.
            </p>
          </div>
          <div>
            <p className="font-pixel text-[10px] mb-2" style={{ color: 'var(--golden-yellow)' }}>
              LOCAL ARCHIVES
            </p>
            <p className="text-base leading-snug">
              Cases and reactions are stored in your browser’s localStorage. They are not shared between users or devices.
              Example cases are clearly marked.
            </p>
          </div>
          <div>
            <p className="font-pixel text-[10px] mb-2" style={{ color: 'var(--golden-yellow)' }}>
              ACHIEVEMENTS
            </p>
            {profile.achievements.length === 0 ? (
              <p className="text-base leading-snug">None yet. Sir Pigeon III is watching you with great expectation.</p>
            ) : (
              <ul className="space-y-1">
                {profile.achievements.map((achievement) => (
                  <li key={achievement.id} className="text-base leading-snug">
                    <span style={{ color: 'var(--golden-yellow)' }}>★</span> {achievement.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="border-t-4 border-navy-dark px-4 py-3 text-center font-pixel text-[9px]">
          Taking your smallest problems far too seriously · Built for Technology for Joy
        </div>
      </footer>

      {showPigeon && !reduced && !isWorld && (
        <div className="no-print pointer-events-none fixed bottom-1 left-0 z-40 anim-walk" aria-hidden="true">
          <TinyPigeon className="w-10" />
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />

      <Toasts />
    </div>
  )
}
