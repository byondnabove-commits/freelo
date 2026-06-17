import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { auth } from './auth'
import leadsRoutes from './routes/leads'

const app = new Hono()

// ── Middleware
// ── Middleware
app.use('*', logger())
app.use('*', cors({
  origin:      process.env.CLIENT_URL!,
  credentials: true,
}))

// Apply secureHeaders only to app routes, NOT /api/auth/**
app.use('/api/leads/*', secureHeaders())
app.use('/health', secureHeaders())

// ── Better Auth — handles all /api/auth/* routes
app.on(
  ['GET', 'POST'],
  '/api/auth/**',
  (c) => auth.handler(c.req.raw)
)

// ── App routes
app.route('/api/leads', leadsRoutes)

// ── Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', time: new Date().toISOString() })
)

// ── Start
const PORT = Number(process.env.PORT) || 3001
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API → http://localhost:${PORT}`)
})

export type AppType = typeof app