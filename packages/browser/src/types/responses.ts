import { PublicUser } from "@plainkey/types"
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"

// Error
export type ErrorResponse = {
  error: string
}

// User Registration
export type RegistrationBeginResponse = {
  user: PublicUser
  options: PublicKeyCredentialCreationOptionsJSON
}

export type IssuedSession = {
  sessionId: string
  token: string
  expiresInSeconds: number
  tokenType: string
  refreshToken: string
}

export type RegistrationCompleteResponse = {
  success: boolean
  user: PublicUser
  token: IssuedSession
  credential: {
    id: string
    webAuthnId: string
  }
}

// Credential registration
export type UserCredentialBeginResponse = {
  user: PublicUser
  options: PublicKeyCredentialCreationOptionsJSON
}

export type UserCredentialCompleteResponse = {
  success: boolean
  user: PublicUser
  token: IssuedSession
  credential: {
    id: string
    webAuthnId: string
  }
}

// Login
export type LoginBeginResponse = {
  projectId: string
  userId?: string
  options: PublicKeyCredentialRequestOptionsJSON
}

export type LoginCompleteResponse = {
  verified: boolean
  user: PublicUser
  token: IssuedSession
}
