import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
// Plain-JS server module shared with the optional serverless deployment.
import { handleInvestigate } from './server/investigate.mjs'

/**
 * Tiny dev/preview middleware for the optional AI endpoint.
 * In production deploy the same handler as a serverless function (see api/investigate.mjs).
 */
function ministryApi(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, reason: 'method-not-allowed' }))
      return
    }
    let raw = ''
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString()
      if (raw.length > 20_000) req.destroy()
    })
    req.on('end', async () => {
      try {
        const payload = JSON.parse(raw || '{}')
        await handleInvestigate(payload, res)
      } catch {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: false, reason: 'bad-request' }))
      }
    })
  }
  return {
    name: 'ministry-api',
    configureServer(server) {
      server.middlewares.use('/api/investigate', middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/investigate', middleware)
    }
  }
}

export default defineConfig({
  plugins: [react(), ministryApi()]
})
