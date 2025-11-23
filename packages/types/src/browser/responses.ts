import { UserInfo } from "../common"
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"

// Error
export type ErrorResponse = {
  error: string
}

// Token
export type IssuedToken = {
  token: string
  expiresInSeconds: number
  tokenType: string
}

// User Registration
export type RegistrationBeginResponse = {
  user: UserInfo
  options: PublicKeyCredentialCreationOptionsJSON
}

export type RegistrationCompleteResponse = {
  success: boolean
  user: UserInfo
  token: IssuedToken
  credential: {
    id: string
    webAuthnId: string
  }
}

// Credential registration
export type UserCredentialBeginResponse = {
  user: UserInfo
  options: PublicKeyCredentialCreationOptionsJSON
}

export type UserCredentialCompleteResponse = {
  success: boolean
  user: UserInfo
  token: IssuedToken
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
  user: UserInfo
  token: IssuedToken
}

// Re-export types for consumers
export type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"
