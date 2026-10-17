import { Link } from 'react-router-dom'
import { Bell, Pin, Volume2 } from 'lucide-react'
import { ANNOUNCEMENTS, TICKER_LINES } from '../data/notices'

export function Notices() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--sky-blue)' }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="panel p-4 mb-6">
          <p className="font-pixel text-[9px] opacity-80">THE REPUBLIC OF ABSOLUTELY NOWHERE</p>
          <h1 className="font-pixel text-[14px] md:text-[17px] mt-1 flex items-center gap-2">
            <Bell size={18} aria-hidden="true" /> OFFICIAL NOTICE BOARD
          </h1>
          <p className="text-lg mt-2">
            Announcements posted by clerks who may or may not exist. All of them are, in the Ministry’s view, urgent.
          </p>
        </div>

        {/* pinned notices */}
        <ul className="grid gap-6 md:grid-cols-2">
          {ANNOUNCEMENTS.map((notice, index) => (
            <li
              key={notice.id}
              className={`panel p-4 relative anim-fade-up ${index % 2 === 0 ? 'rot-a' : 'rot-b'}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="case-card-pin" aria-hidden="true" />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-pixel text-[11px] leading-relaxed flex items-center gap-2">
                  <Pin size={12} aria-hidden="true" /> {notice.title}
                </h2>
                {notice.important && (
                  <span className="badge" style={{ background: 'var(--coral-red)', color: '#FFF8F2' }}>
                    URGENT-ISH
                  </span>
                )}
              </div>
              <p className="text-lg mt-3">{notice.body}</p>
              <p className="text-sm mt-3 opacity-75">Posted: {notice.posted}</p>
            </li>
          ))}
        </ul>

        {/* ticker archive */}
        <div className="panel-navy p-4 mt-8">
          <h2 className="font-pixel text-[11px] mb-3 flex items-center gap-2" style={{ color: 'var(--golden-yellow)' }}>
            <Volume2 size={14} aria-hidden="true" /> TICKER TRANSCRIPTS
          </h2>
          <ul className="space-y-2">
            {TICKER_LINES.map((line) => (
              <li key={line} className="text-lg">
                <span style={{ color: 'var(--golden-yellow)' }}>★</span> {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link className="btn btn-primary" to="/file">
            FILE A COMPLAINT ABOUT A NOTICE
          </Link>
          <Link className="btn btn-secondary" to="/">
            RETURN TO THE VILLAGE
          </Link>
        </div>
      </div>
    </div>
  )
}
