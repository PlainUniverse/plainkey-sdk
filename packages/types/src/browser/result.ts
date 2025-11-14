/** Types for the results of the various PlainKey() class methods. */

import { UserInfo } from "../common"
import { IssuedSession, IssuedToken } from "./responses"

export interface CredentialInfo {
  // The credential ID stored in PlainKey's database.
  id: string

  // The credential ID on the authenticator device made by WebAuthn API.
  webAuthnId: string
}

export interface LoginResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: { message: string }
}

export interface CreateUserWithPasskeyResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken
    credential: CredentialInfo

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: { message: string }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    user: UserInfo
    token: IssuedToken
    credential: CredentialInfo

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: { message: string }
}
