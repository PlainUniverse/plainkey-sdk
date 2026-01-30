/** Types for the results of the various PlainKey() class methods. */

import { AuthenticationToken } from "./responses"

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
    credentialId: string
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    credentialId: string
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface UpdatePasskeyLabelResult {
  success: boolean
  error?: { message: string }
}
