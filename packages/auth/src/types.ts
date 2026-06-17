export type UserRole = 'owner' | 'admin' | 'member'

export interface AuthUser {
  id:            string
  name:          string
  email:         string
  emailVerified: boolean
  image:         string | null
}

export interface AuthSession {
  id:                   string
  userId:               string
  activeOrganizationId: string | null
  expiresAt:            Date
}

export interface AuthOrganization {
  id:   string
  name: string
  slug: string | null
}