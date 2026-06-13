import { Hono } from 'hono'
import { requireAuth, requireOrg } from '../middleware/auth'

const leads = new Hono()

leads.use('*', requireAuth)
leads.use('*', requireOrg)

leads.get('/', async (c) => {
  return c.json({ leads: [] })
})

export default leads