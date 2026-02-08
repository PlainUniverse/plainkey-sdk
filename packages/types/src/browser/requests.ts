import { UserIdentifier } from "../common"
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

// User Registration (creates new user + adds passkey)
export type UserRegisterBeginRequest = {
  userName?: string
}

export type UserRegisterCompleteRequest = {
  userId: string
  credential: RegistrationResponseJSON
}

// Credential registration (adds passkey to existing user)
export type UserCredentialBeginRequest = {
  authenticationToken: string
  userName?: string
}

export type UserCredentialCompleteRequest = {
  authenticationToken: string
  credential: RegistrationResponseJSON
}

// Update credential label
export type CredentialLabelUpdateRequest = {
  authenticationToken: string
  label: string
}

// Login
export type LoginBeginRequest = {
  userIdentifier?: UserIdentifier // Not needed for usernameless login
}

export type LoginCompleteRequest = {
  loginSessionId: string
  authenticationResponse: AuthenticationResponseJSON
}

// Re-export types for consumers
export type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"
