import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

export type AuthClient = ReturnType<typeof createAuthClient>

export function createClient(baseURL: string): AuthClient {
  return createAuthClient({
    baseURL,
    plugins: [organizationClient()],
  })
}
