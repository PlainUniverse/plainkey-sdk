import { UserInfo } from "../common"

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
