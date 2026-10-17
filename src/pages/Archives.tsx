import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Filter, Search, Trash2, X } from 'lucide-react'
import { DEPARTMENTS, REACTIONS, getDepartment, getSeverity } from '../data/departments'
import { useStore } from '../state/store'
import type { DepartmentId } from '../types'

type SortKey = 'newest' | 'oldest' | 'loudest'

export function Archives() {
  const { cases, react, profile, resetWorld, ready } = useStore()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState<DepartmentId | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = cases.filter((item) => {
      const matchesDept = department === 'all' || item.department === department
      if (!matchesDept) return false
      if (!needle) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.complainant.toLowerCase().includes(needle) ||
        item.id.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.verdict.toLowerCase().includes(needle)
      )
    })
    const sorted = [...list]
    if (sort === 'newest') sorted.sort((a, b) => b.createdAt - a.createdAt)
    if (sort === 'oldest') sorted.sort((a, b) => a.createdAt - b.createdAt)
    if (sort === 'loudest') {
      sorted.sort(
        (a, b) =>
          getSeverity(b.severity).weight - getSeverity(a.severity).weight ||
          Object.values(b.reactions).reduce((x, y) => x + y, 0) - Object.values(a.reactions).reduce((x, y) => x + y, 0)
      )
    }
    return sorted
  }, [cases, department, query, sort])

  const userCases = cases.filter((item) => !item.seeded).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--wood-brown)' }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="panel p-4 md:p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-pixel text-[9px] opacity-80">THE REPUBLIC OF ABSOLUTELY NOWHERE</p>
              <h1 className="font-pixel text-[14px] md:text-[17px] mt-1 flex items-center gap-2">
                <Archive size={18} aria-hidden="true" /> PUBLIC CASE ARCHIVES
              </h1>
              <p className="text-lg mt-2 max-w-2xl">
                {cases.length} case{cases.length === 1 ? '' : 's'} on file · {userCases} filed by you ·{' '}
                {cases.length - userCases} clearly marked example cases. Archived complaints are stored in{' '}
                <strong>this browser only</strong> — nothing is shared between users or devices.
              </p>
            </div>
            <Link className="btn btn-primary" to="/file">
              FILE A COMPLAINT
            </Link>
          </div>

          <div className="hr-pixel" />

          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="archive-search">
                SEARCH CASES
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="archive-search"
                  className="input pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Socks, Monday, battery, case number…"
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="archive-department">
                <Filter size={11} className="inline" aria-hidden="true" /> DEPARTMENT
              </label>
              <select
                id="archive-department"
                className="select"
                value={department}
                onChange={(event) => setDepartment(event.target.value as DepartmentId | 'all')}
              >
                <option value="all">All departments</option>
                {DEPARTMENTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="archive-sort">
                SORT
              </label>
              <select
                id="archive-sort"
                className="select"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="loudest">Loudest complaints</option>
              </select>
            </div>
          </div>

          {(query || department !== 'all') && (
            <button
              type="button"
              className="btn btn-sm btn-wood mt-3"
              onClick={() => {
                setQuery('')
                setDepartment('all')
              }}
            >
              <X size={13} aria-hidden="true" /> CLEAR FILTERS ({filtered.length} shown)
            </button>
          )}
        </div>

        {!ready ? (
          <div className="panel p-6 text-center font-pixel text-[11px]">OPENING THE DRAWER…</div>
        ) : filtered.length === 0 ? (
          <div className="panel p-8 text-center">
            <h2 className="font-pixel text-[12px] mb-3">NO CASES MATCH</h2>
            <p className="text-lg mb-4">
              The Ministry found nothing. This has never stopped it from writing a report before.
            </p>
            <Link className="btn btn-secondary" to="/file">
              FILE SOMETHING NEW
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => {
              const dept = getDepartment(item.department)
              const severity = getSeverity(item.severity)
              const total = Object.values(item.reactions).reduce((a, b) => a + b, 0)
              return (
                <li
                  key={item.id}
                  className={`panel p-4 relative anim-fade-up ${index % 3 === 0 ? 'rot-a' : index % 3 === 1 ? 'rot-b' : 'rot-c'}`}
                >
                  <span className="case-card-pin" aria-hidden="true" />
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="badge" style={{ background: dept.accent }}>
                      {dept.code}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: severity.color,
                        color: severity.id === 'universe' ? 'var(--warm-cream)' : 'var(--deep-navy)'
                      }}
                    >
                      {severity.label.toUpperCase()}
                    </span>
                    {item.seeded && (
                      <span className="badge" style={{ background: 'var(--golden-yellow)' }}>
                        EXAMPLE
                      </span>
                    )}
                    {item.mode === 'ai' && (
                      <span className="badge" style={{ background: 'var(--lavender)' }}>
                        AI
                      </span>
                    )}
                  </div>

                  <p className="font-pixel text-[9px] opacity-80">{item.id}</p>
                  <h2 className="font-pixel text-[11px] leading-relaxed mt-2">{item.title}</h2>
                  <p className="text-base mt-3">
                    <span style={{ color: 'var(--coral-red-deep)' }}>VERDICT:</span> {item.verdict}
                  </p>

                  <div className="mt-3 text-base opacity-85">
                    Filed by {item.complainant} · {new Date(item.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <Link className="btn btn-sm btn-lavender" to={`/case/${item.id}`}>
                      OPEN FILE
                    </Link>
                    {REACTIONS.map((reaction) => (
                      <button
                        key={reaction.id}
                        type="button"
                        className="btn btn-sm"
                        style={{ background: profile.reactionGiven[item.id] === reaction.id ? 'var(--golden-yellow)' : 'var(--paper)' }}
                        title={reaction.hint}
                        onClick={() => react(item.id, reaction.id)}
                      >
                        {reaction.label.toUpperCase()} · {item.reactions[reaction.id]}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm mt-2 opacity-75">{total} total reactions, all locally imagined.</p>
                </li>
              )
            })}
          </ul>
        )}

        <div className="panel p-4 mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base max-w-2xl">
            <strong>Careful now:</strong> these archives live in your browser’s localStorage. Clearing site data, or
            pressing this button, will shred every locally filed complaint and reseed the example cases.
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              if (window.confirm('Shred all locally stored cases and reset achievements? This cannot be undone.')) {
                resetWorld()
              }
            }}
          >
            <Trash2 size={13} aria-hidden="true" /> RESET LOCAL ARCHIVES
          </button>
        </div>
      </div>
    </div>
  )
}
