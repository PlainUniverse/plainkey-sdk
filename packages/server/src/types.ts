import type { GetCredential200 } from "./generated/api"
export type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser"

export type UserIdentifier = {
  userId?: string
  userName?: string
}

export type UserInfo = {
  id: string
  userName?: string
}

export type UserUpdates = {
  userName?: string | null
}

export type ServerCredential = GetCredential200

export type VerifyAuthenticationTokenResult = {
  success: boolean
  data?: {
    userId: string
  }
  error?: {
    message: string
  }
}

export type BeginCredentialRegistrationResult = {
  /** WebAuthn creation options — pass these to your frontend to complete the passkey ceremony. */
  options: PublicKeyCredentialCreationOptionsJSON
  /** Short-lived token — pass this to your frontend alongside the options. */
  authenticationToken: string
}
