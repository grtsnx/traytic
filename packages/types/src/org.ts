export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationWithMeta extends Organization {
  memberCount: number
  plan: string | null
}

export interface OrganizationMember {
  id: string
  userId: string
  orgId: string
  role: OrganizationRole
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export interface Invitation {
  id: string
  orgId: string
  email: string
  role: OrganizationRole
  token: string
  expiresAt: Date
  createdAt: Date
}
