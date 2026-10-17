import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FilePlus2, RotateCcw, Wand2 } from 'lucide-react'
import { DEPARTMENTS, RARE_SEVERITY, SEVERITIES } from '../data/departments'
import type { ComplaintDraft, DepartmentId, SeverityId } from '../types'
import { SirPigeon } from '../components/Sprites'
import { investigatorLine } from '../lib/generator'

const TITLE_LIMIT = 110
const DESC_LIMIT = 900

const EXAMPLES: ComplaintDraft[] = [
  {
    complainant: 'Anonymous',
    title: 'My socks keep disappearing in the washing machine',
    description: 'Four pairs went in. Three socks came out. I no longer trust the machine or the drawer.',
    department: 'socks',
    severity: 'moderate'
  },
  {
    complainant: 'Tired Of It',
    title: 'Monday mornings should be illegal',
    description: 'It arrives every week with the confidence of someone who was never invited.',
    department: 'monday',
    severity: 'national'
  },
  {
    complainant: 'Damp Biscuit Owner',
    title: 'My biscuit fell into my tea',
    description: 'It was a good biscuit. Now it is soup. I am not okay.',
    department: 'snack',
    severity: 'existential'
  },
  {
    complainant: 'Anonymous',
    title: 'My phone battery dies at exactly 1%',
    description: 'Never 0%. Never 2%. Always 1%, as if by design and malice.',
    department: 'tech',
    severity: 'mild'
  }
]

interface Errors {
  title?: string
  description?: string
}

export function FileComplaint() {
  const navigate = useNavigate()
  const [complainant, setComplainant] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState<DepartmentId>('socks')
  const [severity, setSeverity] = useState<SeverityId>('moderate')
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  // Rare severity surfaces occasionally, exactly as the Ministry intended.
  const rareAvailable = useMemo(() => Math.random() < 0.25, [])
  const severities = rareAvailable ? [...SEVERITIES, RARE_SEVERITY] : SEVERITIES

  const activeDepartment = DEPARTMENTS.find((item) => item.id === department)!
  const draft: ComplaintDraft = { complainant, title, description, department, severity }

  function validate(): Errors {
    const next: Errors = {}
    if (title.trim().length < 4) next.title = 'Give your grievance a title (at least 4 characters).'
    if (description.trim().length < 10) next.description = 'Describe the incident in at least 10 characters. Detail matters.'
    return next
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = document.getElementById(Object.keys(next)[0] === 'title' ? 'complaint-title' : 'complaint-description')
      first?.focus()
      return
    }
    navigate('/investigating', {
      state: {
        draft: {
          complainant: complainant.trim(),
          title: title.trim(),
          description: description.trim(),
          department,
          severity
        }
      }
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--sky-blue)' }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center panel p-4 mb-6 bg-forest text-cream">
          <SirPigeon className="w-20 shrink-0" />
          <div>
            <h1 className="font-pixel text-[12px] md:text-[14px]" style={{ color: 'var(--golden-yellow)' }}>
              FORM 44-B: OFFICIAL COMPLAINT
            </h1>
            <p className="text-lg mt-2">
              “{investigatorLine(draft)}” — Sir Pigeon III
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="panel parchment p-4 md:p-6" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-base">All fields are optional except the two that are not.</p>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                const example = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
                setComplainant(example.complainant)
                setTitle(example.title)
                setDescription(example.description)
                setDepartment(example.department)
                setSeverity(example.severity)
                setErrors({})
              }}
            >
              <Wand2 size={13} aria-hidden="true" /> LOAD EXAMPLE GRIEVANCE
            </button>
          </div>

          {/* Complainant */}
          <div className="mb-5">
            <label className="field-label" htmlFor="complaint-name">
              1. COMPLAINANT NAME OR ALIAS (OPTIONAL)
            </label>
            <input
              id="complaint-name"
              className="input"
              value={complainant}
              maxLength={60}
              onChange={(event) => setComplainant(event.target.value)}
              placeholder="Anonymous Citizen"
            />
            <p className="text-sm mt-1 opacity-80">Leave blank to remain mysterious. The Ministry respects mystery.</p>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="field-label" htmlFor="complaint-title">
              2. COMPLAINT TITLE *
            </label>
            <input
              id="complaint-title"
              className="input"
              value={title}
              maxLength={TITLE_LIMIT}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'complaint-title-error' : undefined}
              onChange={(event) => {
                setTitle(event.target.value)
                if (submitted) setErrors(validate())
              }}
              placeholder="e.g. My biscuit fell into my tea"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <p className="field-error" id="complaint-title-error" role="alert">
                  <AlertTriangle size={13} aria-hidden="true" /> {errors.title}
                </p>
              ) : (
                <span className="text-sm opacity-80">Keep it petty. Keep it precise.</span>
              )}
              <span className="text-sm opacity-70">
                {title.length}/{TITLE_LIMIT}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="field-label" htmlFor="complaint-description">
              3. DETAILED STATEMENT OF SUFFERING *
            </label>
            <textarea
              id="complaint-description"
              className="textarea"
              value={description}
              maxLength={DESC_LIMIT}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'complaint-description-error' : undefined}
              onChange={(event) => {
                setDescription(event.target.value)
                if (submitted) setErrors(validate())
              }}
              placeholder="What happened? When? How did it make you feel about the universe?"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="field-error" id="complaint-description-error" role="alert">
                  <AlertTriangle size={13} aria-hidden="true" /> {errors.description}
                </p>
              ) : (
                <span className="text-sm opacity-80">Witnesses, timestamps, and emotional damage all welcome.</span>
              )}
              <span className="text-sm opacity-70">
                {description.length}/{DESC_LIMIT}
              </span>
            </div>
          </div>

          {/* Department */}
          <fieldset className="mb-5">
            <legend className="field-label">4. SELECT THE RESPONSIBLE DEPARTMENT *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEPARTMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="tile"
                  aria-pressed={department === item.id}
                  onClick={() => setDepartment(item.id)}
                >
                  <span className="font-pixel text-[9px]" style={{ color: 'var(--deep-navy)' }}>
                    {item.code} · {item.name.toUpperCase()}
                  </span>
                  <span className="text-base leading-snug">{item.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Severity */}
          <fieldset className="mb-6">
            <legend className="field-label">5. DECLARE A SEVERITY LEVEL *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {severities.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tile ${item.rare ? 'anim-wiggle' : ''}`}
                  aria-pressed={severity === item.id}
                  onClick={() => setSeverity(item.id)}
                  style={item.rare ? { borderColor: 'var(--deep-navy)', background: 'var(--lavender)' } : undefined}
                >
                  <span className="font-pixel text-[9px]">
                    {item.rare ? '⚠ RESTRICTED · ' : ''}
                    {item.label.toUpperCase()}
                  </span>
                  <span className="text-base leading-snug">{item.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Summary strip */}
          <div className="panel-navy p-3 mb-5 flex flex-wrap gap-x-6 gap-y-2 items-center">
            <span className="font-pixel text-[9px]" style={{ color: 'var(--golden-yellow)' }}>
              FILING TO:
            </span>
            <span className="text-base">{activeDepartment.name}</span>
            <span className="badge" style={{ background: 'var(--coral-red)', color: '#FFF8F2' }}>
              {activeDepartment.code}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary flex-1 min-w-[16rem]">
              <FilePlus2 size={16} aria-hidden="true" /> FILE OFFICIAL COMPLAINT
            </button>
            <button
              type="button"
              className="btn btn-wood"
              onClick={() => {
                setComplainant('')
                setTitle('')
                setDescription('')
                setDepartment('socks')
                setSeverity('moderate')
                setErrors({})
                setSubmitted(false)
              }}
            >
              <RotateCcw size={15} aria-hidden="true" /> CLEAR FORM
            </button>
          </div>

          {submitted && Object.keys(errors).length > 0 && (
            <p className="field-error mt-3" role="alert">
              <AlertTriangle size={14} aria-hidden="true" /> The Ministry cannot investigate a blank grievance. Please
              complete the highlighted fields.
            </p>
          )}
        </form>

        <p className="text-center text-base mt-4">
          Your complaint is stored only in this browser. The Ministry is fictional; the annoyance was real.
        </p>
      </div>
    </div>
  )
}
