import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Award, Copy, FilePlus2, Gavel, Mail, Printer, Sparkles, ThumbsUp, TriangleAlert } from 'lucide-react'
import { REACTIONS, getDepartment, getSeverity } from '../data/departments'
import { useStore } from '../state/store'
import { Confetti } from '../components/Confetti'
import { SuspectAvatar, SirPigeon } from '../components/Sprites'
import type { CaseFile } from '../types'

function Section({ title, children, accent }: { title: string; children: ReactNode; accent?: string }) {
  return (
    <section className="mt-6">
      <h2 className="font-pixel text-[11px] mb-3 inline-flex items-center gap-2">
        <span className="inline-block h-3 w-3 border-2 border-navy" style={{ background: accent ?? 'var(--golden-yellow)' }} />
        {title}
      </h2>
      {children}
    </section>
  )
}

export function buildShareText(caseFile: CaseFile): string {
  return [
    `CASE ${caseFile.id} — ${caseFile.title}`,
    `Department: ${getDepartment(caseFile.department).name}`,
    `Severity: ${getSeverity(caseFile.severity).label}`,
    '',
    `SUSPECTS: ${caseFile.suspects.map((s) => s.name).join(', ')}`,
    `EVIDENCE: ${caseFile.evidence.join(' | ')}`,
    '',
    `VERDICT: ${caseFile.verdict}`,
    `COMPENSATION: ${caseFile.compensation}`,
    `STATUS: ${caseFile.status}* (*${caseFile.statusNote})`,
    '',
    'Filed with the Ministry of Minor Inconveniences — Department of Silly Problems.'
  ].join('\n')
}

export function CaseResult() {
  const { id } = useParams<{ id: string }>()
  const { cases, ready, react, profile, notify } = useStore()
  const [showStamp, setShowStamp] = useState(false)
  const caseFile = useMemo(() => cases.find((item) => item.id === id), [cases, id])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowStamp(true), 650)
    return () => window.clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="panel p-6">
          <p className="font-pixel text-[11px]">RETRIEVING CASE FILE…</p>
        </div>
      </div>
    )
  }

  if (!caseFile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="panel p-6">
          <h1 className="font-pixel text-[13px] mb-3">CASE NOT FOUND</h1>
          <p className="text-lg mb-4">
            The Ministry has misplaced this file. It is probably under a biscuit. It always is.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link className="btn btn-primary" to="/file">
              FILE A NEW COMPLAINT
            </Link>
            <Link className="btn btn-secondary" to="/archives">
              BROWSE ARCHIVES
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const department = getDepartment(caseFile.department)
  const severity = getSeverity(caseFile.severity)
  const myReaction = profile.reactionGiven[caseFile.id]

  async function copySummary() {
    if (!caseFile) return
    const text = buildShareText(caseFile)
    try {
      await navigator.clipboard.writeText(text)
      notify('Case summary copied to your clipboard. Share the suffering.', 'good', 'COPIED')
    } catch {
      notify('Copying failed. The clipboard is refusing visitors today.', 'info', 'COPY FAILED')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #4BA8CC 0%, #4BA8CC 40%, var(--grass-green) 40%, var(--grass-green) 100%)' }}>
      <Confetti count={70} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* victory banner */}
        <div className="panel-navy p-4 anim-pop relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-4">
            <SirPigeon className="w-16 shrink-0 anim-bob" />
            <div className="flex-1 min-w-[12rem]">
              <p className="font-pixel text-[9px]" style={{ color: 'var(--golden-yellow)' }}>
                QUEST COMPLETE
              </p>
              <h1 className="font-pixel text-[14px] md:text-[17px] mt-2" style={{ color: 'var(--warm-cream)' }}>
                INVESTIGATION CONCLUDED
              </h1>
              <p className="text-lg mt-1">
                Case {caseFile.id} has been filed, argued about, and stamped. Very officially.
              </p>
            </div>
            <span className="badge" style={{ background: caseFile.mode === 'ai' ? 'var(--lavender)' : 'var(--sky-blue)' }}>
              <Sparkles size={12} aria-hidden="true" />
              {caseFile.mode === 'ai' ? 'AI-ASSISTED' : 'DEMO MODE'}
            </span>
          </div>
        </div>

        {/* case file */}
        <article className="panel parchment p-4 md:p-6 mt-5 relative">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <p className="font-pixel text-[9px] opacity-80">THE REPUBLIC OF ABSOLUTELY NOWHERE</p>
              <h2 className="font-pixel text-[16px] md:text-[20px] mt-1">CASE {caseFile.id}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {caseFile.seeded && (
                <span className="badge" style={{ background: 'var(--golden-yellow)' }}>
                  EXAMPLE CASE
                </span>
              )}
              <span className="badge" style={{ background: department.accent }}>
                {department.code} · {department.short.toUpperCase()}
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
            </div>
          </div>

          <div className="hr-pixel" />

          <h3 className="font-pixel text-[13px] leading-relaxed">COMPLAINT: {caseFile.title}</h3>
          {caseFile.description && (
            <blockquote className="mt-3 border-l-8 border-navy pl-3 text-lg">
              “{caseFile.description}”
              <footer className="text-base mt-1 opacity-80">
                — {caseFile.complainant}
                {caseFile.anonymous ? ' (identity politely ignored)' : ''}
              </footer>
            </blockquote>
          )}

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {[
              { label: 'FILED', value: new Date(caseFile.createdAt).toLocaleDateString() },
              { label: 'LEAD INVESTIGATOR', value: caseFile.investigator },
              { label: 'DEPARTMENT', value: department.name },
              { label: 'DURATION', value: 'Subjectively: forever' }
            ].map((item) => (
              <div key={item.label} className="border-4 border-navy bg-paper p-2">
                <dt className="font-pixel text-[8px] opacity-75">{item.label}</dt>
                <dd className="text-base mt-1">{item.value}</dd>
              </div>
            ))}
          </dl>

          <Section title="SUSPECTS IDENTIFIED" accent="var(--coral-red)">
            <ul className="grid gap-4 md:grid-cols-3">
              {caseFile.suspects.map((suspect, index) => (
                <li key={`${suspect.name}-${index}`} className="border-4 border-navy bg-paper p-3 flex gap-3 anim-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
                  <SuspectAvatar sprite={suspect.sprite} className="w-12 shrink-0" />
                  <div>
                    <p className="font-pixel text-[9px]">SUSPECT #{index + 1}</p>
                    <p className="text-lg leading-tight mt-1">{suspect.name}</p>
                    <p className="text-sm opacity-80">{suspect.role}</p>
                    <p className="text-base mt-2">
                      <span style={{ color: 'var(--coral-red-deep)' }}>▸</span> {suspect.guilt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="EVIDENCE RECOVERED" accent="var(--lavender)">
            <ol className="grid gap-4 md:grid-cols-3">
              {caseFile.evidence.map((item, index) => (
                <li key={item} className="border-4 border-navy bg-paper p-3 anim-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
                  <p className="font-pixel text-[9px]" style={{ color: 'var(--coral-red-deep)' }}>
                    EXHIBIT {String.fromCharCode(65 + index)}
                  </p>
                  <p className="text-base mt-2">{item}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="INVESTIGATION SUMMARY">
            <p className="text-lg leading-relaxed">{caseFile.summary}</p>
          </Section>

          <Section title="OFFICIAL VERDICT" accent="var(--golden-yellow)">
            <div className="border-4 border-navy p-4 relative" style={{ background: 'var(--warm-cream)' }}>
              <p className="font-pixel text-[9px] mb-2 opacity-80">BY ORDER OF SIR PIGEON III</p>
              <p className="text-xl md:text-2xl leading-relaxed">{caseFile.verdict}</p>
              {showStamp && (
                <div className="mt-4 flex justify-end">
                  <span className="stamp-mark anim-stamp text-[13px] md:text-[18px] inline-block">
                    CASE RESOLVED
                  </span>
                </div>
              )}
            </div>
          </Section>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="border-4 border-navy bg-paper p-3">
              <p className="font-pixel text-[9px] mb-2">
                <Gavel size={12} className="inline" aria-hidden="true" /> RIDICULOUS CORRECTIVE ACTION
              </p>
              <p className="text-lg">{caseFile.correctiveAction}</p>
            </div>
            <div className="border-4 border-navy bg-paper p-3">
              <p className="font-pixel text-[9px] mb-2">
                <Award size={12} className="inline" aria-hidden="true" /> COMPENSATION PACKAGE
              </p>
              <p className="text-lg">{caseFile.compensation}</p>
            </div>
          </div>

          <div className="mt-6 border-4 border-navy p-3" style={{ background: 'var(--deep-navy)', color: 'var(--warm-cream)' }}>
            <p className="font-pixel text-[9px]" style={{ color: 'var(--golden-yellow)' }}>
              CASE STATUS
            </p>
            <p className="text-xl mt-1">{caseFile.status}*</p>
            <p className="text-base opacity-80">*{caseFile.statusNote}</p>
          </div>

          {/* reactions */}
          <Section title="PUBLIC REACTION" accent="var(--sky-blue)">
            <div className="flex flex-wrap gap-3">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: myReaction === reaction.id ? 'var(--golden-yellow)' : 'var(--paper)'
                  }}
                  onClick={() => react(caseFile.id, reaction.id)}
                  title={reaction.hint}
                >
                  <ThumbsUp size={13} aria-hidden="true" /> {reaction.label.toUpperCase()} · {caseFile.reactions[reaction.id]}
                </button>
              ))}
            </div>
            <p className="text-sm mt-2 opacity-80">
              Reactions are stored locally in this browser. Aggregate outrage is theoretical.
            </p>
          </Section>

          <div className="hr-pixel" />

          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" to={`/certificate/${caseFile.id}`}>
              <Award size={15} aria-hidden="true" /> VIEW OFFICIAL CERTIFICATE
            </Link>
            <button type="button" className="btn btn-secondary" onClick={copySummary}>
              <Copy size={15} aria-hidden="true" /> COPY SUMMARY
            </button>
            <Link className="btn btn-lavender" to="/archives">
              <Mail size={15} aria-hidden="true" /> BACK TO ARCHIVES
            </Link>
            <Link className="btn btn-wood" to="/file">
              <FilePlus2 size={15} aria-hidden="true" /> FILE ANOTHER
            </Link>
          </div>

          <p className="mt-4 text-sm flex items-center gap-2 opacity-80">
            <TriangleAlert size={14} aria-hidden="true" />
            This verdict carries no legal, moral, or practical weight. It is satire, and you are free.
          </p>
        </article>

        <div className="mt-5 flex justify-center">
          <Link className="btn btn-sm" to="/">
            <ArrowLeft size={13} aria-hidden="true" /> RETURN TO THE VILLAGE
          </Link>
        </div>

        <p className="text-center text-base mt-4 opacity-90">
          Tip: print the certificate for maximum bureaucratic satisfaction
          <Printer size={13} className="inline ml-1" aria-hidden="true" />
        </p>
      </div>
    </div>
  )
}
