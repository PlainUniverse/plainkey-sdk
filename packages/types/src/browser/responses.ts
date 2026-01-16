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
  expiresInSeconds: number
  tokenType: string
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
  credential: {
    id: string
    webAuthnId: string
  }
}

// Credential registration
export type UserCredentialBeginResponse = {
  options: PublicKeyCredentialCreationOptionsJSON
}

export type UserCredentialCompleteResponse = {
  success: boolean
  authenticationToken: AuthenticationToken
  credential: {
    id: string
    webAuthnId: string
  }
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
