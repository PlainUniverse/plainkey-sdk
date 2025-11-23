/** Types for the results of the various PlainKey() class methods. */

import { UserInfo } from "../common"
import { IssuedToken } from "./responses"

export interface CredentialInfo {
  // The credential ID stored in PlainKey's database.
  id: string

  // The credential ID on the authenticator device made by WebAuthn API.
  webAuthnId: string
}

export interface AuthenticateResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken
  }
  error?: { message: string }
}

export interface CreateUserWithPasskeyResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken
    credential: CredentialInfo
  }
  error?: { message: string }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken
    credential: CredentialInfo
  }
  error?: { message: string }
}
