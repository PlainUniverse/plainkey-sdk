export type AccessTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type VerifyAuthenticationTokenResponse = {
  valid: boolean
  error: string
  expiresAt: string
  projectId: string
  userId: string
  payload: Record<string, unknown>
}

export type ServerCredential = {
  id: string
  aaguid: string | null
  authenticatorType: string | null
  label: string | null
  webAuthnId: string | null
  userId: string
  counter: number | null
  transports: string[] | null
  credentialDeviceType: string | null
  credentialBackedUp: boolean | null
  createdAt: string
  updatedAt: string | null
  lastUsedAt: string | null
}
