export type UserIdentifier = {
  userId?: string
  userName?: string
}

export type PublicUser = {
  id: string
  userName?: string
  metadata?: Record<string, unknown>
}
