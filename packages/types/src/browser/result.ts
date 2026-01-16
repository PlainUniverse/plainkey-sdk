/** Types for the results of the various PlainKey() class methods. */

import { UserInfo } from "../common"
import { AuthenticationToken } from "./responses"

export interface CredentialInfo {
  // The credential ID stored in PlainKey's database.
  id: string

  // The credential ID on the authenticator device made by WebAuthn API.
  webAuthnId: string
}

export interface AuthenticateResult {
  success: boolean
  data?: {
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface CreateUserWithPasskeyResult {
  success: boolean
  data?: {
    userId: string
    authenticationToken: AuthenticationToken
    credential: CredentialInfo
  }
  error?: { message: string }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    authenticationToken: AuthenticationToken
    credential: CredentialInfo
  }
  error?: { message: string }
}
