/**
 * Optional AI investigation endpoint (OpenAI-compatible chat completions).
 * Works as a Vite middleware handler (dev) and as a serverless function (api/investigate.mjs).
 * Requires AI_API_KEY, AI_BASE_URL and AI_MODEL. Never exposes secrets to the frontend.
 */

const SYSTEM_PROMPT = `You are the Department of Silly Problems at the Ministry of Minor Inconveniences, 
a fictional satirical government office in The Republic of Absolutely Nowhere. 
You write absurd, PG-rated, genuinely funny investigations into trivial everyday complaints. 
You are extremely formal and take ridiculous problems with deadly seriousness.

Return ONLY valid minified JSON (no markdown fences, no commentary) with exactly this shape:
{"suspects":[{"name":"...","role":"...","guilt":"..."},{"name":"...","role":"...","guilt":"..."},{"name":"...","role":"...","guilt":"..."}],"evidence":["...","...","..."],"summary":"...","verdict":"...","correctiveAction":"...","compensation":"...","statusLine":"..."}

Rules:
- Exactly 3 suspects, 3 evidence items. No more, no fewer.
- Suspect names: 1-4 words, absurd but bureaucratic (e.g. "The Gregorian Calendar").
- Suspect role: 2-5 words. Suspect guilt: one sentence, under 90 characters.
- Evidence: each under 140 characters, presented as dry official findings.
- summary: 2-3 sentences under 600 characters, referencing the actual complaint specifics.
- verdict: one sentence, under 200 characters, ordering an absurd remedy.
- correctiveAction: one sentence under 200 characters.
- compensation: one sentence under 200 characters of ridiculous restitution.
- statusLine: short, ends with a joke about the asterisk disclaimer.
- Keep it playful and kind. No real people, no brands, no politics, no body-shaming.`

function respond(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function clean(value, max) {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text) return null
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function validateReport(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.suspects) || raw.suspects.length !== 3) return null
  if (!Array.isArray(raw.evidence) || raw.evidence.length !== 3) return null

  const suspects = raw.suspects.map((s) => ({
    name: clean(s && s.name, 60),
    role: clean(s && s.role, 44),
    guilt: clean(s && s.guilt, 96)
  }))
  if (suspects.some((s) => !s.name || !s.role || !s.guilt)) return null

  const evidence = raw.evidence.map((e) => clean(e, 150))
  if (evidence.some((e) => !e)) return null

  const summary = clean(raw.summary, 600)
  const verdict = clean(raw.verdict, 220)
  const correctiveAction = clean(raw.correctiveAction, 220)
  const compensation = clean(raw.compensation, 220)
  const statusLine = clean(raw.statusLine, 160)
  if (!summary || !verdict || !correctiveAction || !compensation) return null

  return { suspects, evidence, summary, verdict, correctiveAction, compensation, statusLine }
}

function extractJson(content) {
  if (typeof content !== 'string') return null
  const stripped = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    const start = stripped.indexOf('{')
    const end = stripped.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(stripped.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

export async function handleInvestigate(payload, res) {
  const apiKey = process.env.AI_API_KEY
  const baseUrl = process.env.AI_BASE_URL
  const model = process.env.AI_MODEL

  if (!apiKey || !baseUrl || !model) {
    return respond(res, 503, { ok: false, reason: 'not-configured' })
  }

  const complaint = {
    name: String((payload && payload.complainant) || 'Anonymous').slice(0, 60),
    title: String((payload && payload.title) || 'An unspecified inconvenience').slice(0, 120),
    description: String((payload && payload.description) || '').slice(0, 1200),
    department: String((payload && payload.department) || 'General Nonsense Division').slice(0, 80),
    severity: String((payload && payload.severity) || 'Mild Annoyance').slice(0, 60)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20_000)

  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.95,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `FILE A COMPLAINT
Complainant: ${complaint.name}
Department: ${complaint.department}
Declared severity: ${complaint.severity}
Complaint title: ${complaint.title}
Detailed statement: ${complaint.description || '(no further statement provided)'}`
          }
        ]
      })
    })

    if (!response.ok) {
      return respond(res, 502, { ok: false, reason: 'upstream-error' })
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    const report = validateReport(extractJson(content))
    if (!report) {
      return respond(res, 502, { ok: false, reason: 'malformed-response' })
    }
    return respond(res, 200, { ok: true, mode: 'ai', model, report })
  } catch (error) {
    const timedOut = error && error.name === 'AbortError'
    return respond(res, 504, { ok: false, reason: timedOut ? 'timeout' : 'network-error' })
  } finally {
    clearTimeout(timer)
  }
}

export default { handleInvestigate }
