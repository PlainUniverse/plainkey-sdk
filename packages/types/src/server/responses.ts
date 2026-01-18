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
  user: UserInfo
  payload: Record<string, unknown>
}
