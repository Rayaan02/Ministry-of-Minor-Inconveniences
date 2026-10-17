import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Printer, Stamp } from 'lucide-react'
import { getDepartment, getSeverity } from '../data/departments'
import { useStore } from '../state/store'
import { SirPigeon } from '../components/Sprites'

export function Certificate() {
  const { id } = useParams<{ id: string }>()
  const { cases, ready, notify } = useStore()
  const caseFile = useMemo(() => cases.find((item) => item.id === id), [cases, id])

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="panel p-6 font-pixel text-[11px]">PREPARING CERTIFICATE…</div>
      </div>
    )
  }

  if (!caseFile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="panel p-6">
          <h1 className="font-pixel text-[13px] mb-3">NO SUCH CERTIFICATE</h1>
          <p className="text-lg mb-4">The Ministry cannot certify something it has no record of. Suspicious.</p>
          <Link className="btn btn-secondary" to="/archives">
            BACK TO ARCHIVES
          </Link>
        </div>
      </div>
    )
  }

  const department = getDepartment(caseFile.department)
  const severity = getSeverity(caseFile.severity)
  const filed = new Date(caseFile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  async function copySummary() {
    if (!caseFile) return
    const text = `OFFICIAL CERTIFICATE — CASE ${caseFile.id}\nComplainant: ${caseFile.complainant}\nComplaint: ${caseFile.title}\nVerdict: ${caseFile.verdict}\nCompensation: ${caseFile.compensation}\nDate: ${filed}\nSigned: Sir Pigeon III (Supreme Deputy Assistant Minister of Unnecessary Paperwork)\nFictional satire — The Republic of Absolutely Nowhere.`
    try {
      await navigator.clipboard.writeText(text)
      notify('Certificate summary copied.', 'good', 'COPIED')
    } catch {
      notify('The clipboard has declined your certificate.', 'info', 'COPY FAILED')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--sky-blue)' }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="no-print flex flex-wrap gap-3 items-center justify-between mb-5">
          <Link className="btn btn-wood btn-sm" to={`/case/${caseFile.id}`}>
            <ArrowLeft size={13} aria-hidden="true" /> BACK TO CASE FILE
          </Link>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={copySummary}>
              <Copy size={13} aria-hidden="true" /> COPY SUMMARY
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={13} aria-hidden="true" /> PRINT / SAVE AS PDF
            </button>
          </div>
        </div>

        <article className="print-sheet bg-paper border-[10px] border-navy p-4 md:p-8 relative">
          <div className="border-4 border-navy p-4 md:p-8 relative parchment">
            <div className="text-center">
              <p className="font-pixel text-[9px]">THE REPUBLIC OF ABSOLUTELY NOWHERE</p>
              <h1 className="font-pixel text-[15px] md:text-[21px] mt-3 leading-relaxed">
                OFFICIAL CERTIFICATE
              </h1>
              <p className="font-pixel text-[10px] mt-2" style={{ color: 'var(--coral-red-deep)' }}>
                OF INCONVENIENCE RESOLVED
              </p>
              <div className="hr-pixel" />
            </div>

            <p className="text-lg md:text-xl leading-relaxed text-center max-w-3xl mx-auto">
              This certifies that <strong>{caseFile.complainant}</strong> did formally report a matter of great
              triviality to the {department.name}, concerning:
            </p>

            <p className="font-pixel text-[13px] md:text-[16px] text-center mt-5 leading-relaxed">
              “{caseFile.title}”
            </p>

            <p className="text-lg md:text-xl leading-relaxed text-center max-w-3xl mx-auto mt-5">
              Following an investigation described by all involved as “thorough-ish”, the Ministry has officially
              determined:
            </p>

            <div className="border-4 border-navy p-4 mt-4 max-w-3xl mx-auto" style={{ background: 'var(--warm-cream)' }}>
              <p className="text-xl md:text-2xl leading-relaxed text-center">{caseFile.verdict}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 max-w-4xl mx-auto">
              {[
                { label: 'CASE NUMBER', value: caseFile.id },
                { label: 'DATE FILED', value: filed },
                { label: 'SEVERITY', value: severity.label },
                { label: 'COMPENSATION', value: caseFile.compensation }
              ].map((item) => (
                <div key={item.label} className="border-4 border-navy p-3 text-center bg-paper">
                  <dt className="font-pixel text-[8px] opacity-75">{item.label}</dt>
                  <dd className="text-base mt-2">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-end gap-4">
                <SirPigeon className="w-16" label="Official seal of the Ministry: Sir Pigeon III" />
                <div>
                  <p className="text-2xl md:text-3xl" style={{ fontStyle: 'italic', transform: 'rotate(-4deg)' }}>
                    Sir Pigeon III
                  </p>
                  <div className="h-1 bg-navy mt-1" />
                  <p className="font-pixel text-[8px] mt-2">SUPREME DEPUTY ASSISTANT MINISTER</p>
                  <p className="font-pixel text-[8px]">OF UNNECESSARY PAPERWORK</p>
                  <p className="text-sm mt-1 opacity-80">Signed without reading. Twice.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="stamp-mark text-[11px] md:text-[14px] text-center">
                  <Stamp size={16} className="inline" aria-hidden="true" />
                  <br />
                  CERTIFIED
                  <br />
                  <span className="text-[9px]">BEIGE-LEVEL</span>
                </div>
              </div>
            </div>

            <div className="hr-pixel" />

            <div className="text-center space-y-2">
              <p className="font-pixel text-[9px]">
                STATUS: {caseFile.status}* — *{caseFile.statusNote}
              </p>
              <p className="text-base max-w-3xl mx-auto opacity-90">
                This certificate is a work of satirical fiction issued by a fictional ministry in a fictional republic.
                It confers no rights, remedies, holidays, or potatoes. Any resemblance to real bureaucracy is, frankly,
                unfortunate.
              </p>
              <p className="font-pixel text-[8px] opacity-70">
                INVESTIGATOR: {caseFile.investigator} · DEPARTMENT: {department.code} · MODE:{' '}
                {caseFile.mode === 'ai' ? 'AI-ASSISTED' : 'DEMO MODE'}
              </p>
            </div>
          </div>
        </article>

        <p className="no-print text-center text-base mt-4">
          Use your browser’s print dialog and choose “Save as PDF” for a keepsake nobody asked for.
        </p>
      </div>
    </div>
  )
}
