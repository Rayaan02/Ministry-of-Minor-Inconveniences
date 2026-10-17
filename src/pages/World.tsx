import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info, Sparkles } from 'lucide-react'
import { WorldCanvas } from '../world/WorldCanvas'
import { TICKER_LINES } from '../data/notices'
import { useStore } from '../state/store'
import { TitleScreen } from '../components/TitleScreen'

/**
 * Home page: a playable pixel-art village. Walk to the buildings and the Minister;
 * the MENU in the game HUD keeps every other page reachable.
 */
export function World() {
  const { cases, profile, setEntered } = useStore()
  const headline = useMemo(() => TICKER_LINES[Math.floor(Math.random() * TICKER_LINES.length)], [])
  const latest = cases[0]
  const [showTitle, setShowTitle] = useState(!profile.entered)
  const [entering, setEntering] = useState(false)

  function handleEnter() {
    setEntering(true)
    window.setTimeout(() => {
      setEntered(true)
      setShowTitle(false)
      setEntering(false)
    }, 600)
  }

  if (showTitle) {
    return <TitleScreen onEnter={handleEnter} />
  }

  return (
    <div style={{ opacity: entering ? 0 : 1, transition: 'opacity 600ms ease' }}>
      <h1 className="sr-only">The Ministry of Minor Inconveniences — village of Nowhere-in-Particular</h1>

      {/* ---------------- MASTHEAD ---------------- */}
      <section className="border-b-4 border-navy bg-sky">
        <div className="mx-auto max-w-[1200px] px-3 py-3 sm:px-4 sm:py-4">
          <div className="panel parchment flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="badge" style={{ background: 'var(--golden-yellow)' }}>
                <Sparkles size={11} aria-hidden="true" /> THE REPUBLIC OF ABSOLUTELY NOWHERE
              </p>
              <p className="font-pixel text-[12px] sm:text-[15px] mt-2 leading-relaxed">
                MINISTRY OF MINOR INCONVENIENCES
              </p>
              <p className="font-pixel text-[9px] mt-1" style={{ color: 'var(--coral-red-deep)' }}>
                DEPARTMENT OF SILLY PROBLEMS
              </p>
              <p className="text-lg mt-1">“Taking your smallest problems far too seriously.”</p>
            </div>
            <p className="text-base max-w-sm flex items-start gap-2">
              <Info size={14} aria-hidden="true" className="mt-1 shrink-0" />
              Walk around the village. File a complaint about something gloriously trivial. Sir Pigeon III will
              investigate it with catastrophic seriousness. Fictional satire.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- THE VILLAGE ---------------- */}
      <div className="bg-forest pt-3 pb-4 border-b-4 border-navy">
        <WorldCanvas />
      </div>

      {/* ---------------- BELOW THE VILLAGE ---------------- */}
      <section className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 grid gap-4 md:grid-cols-2">
        <div className="panel p-3">
          <p className="font-pixel text-[10px] mb-2">THE MINISTRY IN OTHER FORMS</p>
          <p className="text-base mb-3">
            Prefer paperwork to walking? Every building in the village also has a page. The pigeons will not be
            offended. Probably.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-sm btn-primary" to="/file">
              FILE A COMPLAINT
            </Link>
            <Link className="btn btn-sm btn-secondary" to="/archives">
              THE ARCHIVES
            </Link>
            <Link className="btn btn-sm" to="/notices">
              NOTICE BOARD
            </Link>
            <Link className="btn btn-sm btn-lavender" to="/minister">
              THE MINISTER
            </Link>
          </div>
        </div>

        <div className="panel p-3">
          <p className="font-pixel text-[10px] mb-2">LATEST FROM THE ARCHIVES</p>
          {latest ? (
            <div>
              <p className="font-pixel text-[9px] mb-1" style={{ color: 'var(--coral-red-deep)' }}>
                {latest.id} {latest.seeded && '· EXAMPLE CASE'}
              </p>
              <h2 className="font-pixel text-[10px] leading-relaxed">{latest.title}</h2>
              <p className="text-base mt-2">“{latest.verdict}”</p>
              <Link className="btn btn-sm btn-lavender mt-3" to={`/case/${latest.id}`}>
                OPEN CASE FILE <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-base">The Archives are empty. This is the most suspicious thing that has ever happened.</p>
              <Link className="btn btn-sm btn-primary mt-3" to="/file">
                BE THE FIRST COMPLAINT
              </Link>
            </div>
          )}
          <p className="mt-3 text-base opacity-90">“{headline}”</p>
        </div>
      </section>
    </div>
  )
}
