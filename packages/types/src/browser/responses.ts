import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"

// Error
export type ErrorResponse = {
  error: string
}

// Token
export type AuthenticationToken = {
  token: string
  expiresAt: number
}

// User Registration
export type UserRegisterBeginResponse = {
  userId: string
  options: PublicKeyCredentialCreationOptionsJSON
}

export type UserRegisterCompleteResponse = {
  success: boolean
  userId: string
  authenticationToken: AuthenticationToken
  credentialId: string
}

// Credential registration
export type UserCredentialBeginResponse = {
  options: PublicKeyCredentialCreationOptionsJSON
}

export type UserCredentialCompleteResponse = {
  success: boolean
  authenticationToken: AuthenticationToken
  credentialId: string
}

// Authentication
export type AuthenticationBeginResponse = {
  projectId: string
  options: PublicKeyCredentialRequestOptionsJSON
  loginSession: {
    id: string
    expiresAt: string
  }
}

export type AuthenticationCompleteResponse = {
  authenticationToken: AuthenticationToken
}

// Re-export types for consumers
export type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"
