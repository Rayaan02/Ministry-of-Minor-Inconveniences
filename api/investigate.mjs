/**
 * Serverless deployment entrypoint (Vercel-style Node function).
 * Re-exports the shared handler so the optional AI endpoint can run in production.
 * Deploy to Vercel: this file is picked up automatically as /api/investigate.
 * For Netlify, point a function at this module or use an equivalent redirect.
 */
import { handleInvestigate } from '../server/investigate.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: false, reason: 'method-not-allowed' }))
    return
  }
  try {
    await handleInvestigate(req.body ?? {}, res)
  } catch {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: false, reason: 'server-error' }))
  }
}
