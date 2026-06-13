import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

// Provide a lightweight local declaration for `process` to avoid needing @types/node in this repo.
declare const process: { env: { DATABASE_URL?: string } }

export default defineConfig({
  schema:  './src/db/schema/index.ts',
  out:     './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})