import { PublicUser } from "../common"
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"

// Error
export type ErrorResponse = {
  error: string
}

// Session/Token
export type IssuedToken = {
  token: string
  expiresInSeconds: number
  tokenType: string
}

export type IssuedSession = {
  sessionId: string
  refreshToken: string
}

// User Registration
export type RegistrationBeginResponse = {
  user: PublicUser
  options: PublicKeyCredentialCreationOptionsJSON
}

export type RegistrationCompleteResponse = {
  success: boolean
  user: PublicUser
  token: IssuedToken
  session?: IssuedSession
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
  token: IssuedToken
  session?: IssuedSession
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
  loginSession: {
    id: string
    expiresAt: string
  }
}

export type LoginCompleteResponse = {
  verified: boolean
  user: PublicUser
  token: IssuedToken
  session?: IssuedSession
}

// Re-export types for consumers
export type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"
