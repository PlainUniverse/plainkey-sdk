import { UserIdentifier } from "../common"
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

// User Registration (creates new user + adds passkey)
export type RegistrationBeginRequest = {
  userName?: string
}

export type RegistrationCompleteRequest = {
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
}

// Credential registration (adds passkey to existing user)
export type UserCredentialBeginRequest = {
  userToken?: string // Only for backend calls (backend uses Authorization header instead)
  userIdentifier: UserIdentifier
}

export type UserCredentialCompleteRequest = {
  userToken?: string // Only for backend calls (backend uses Authorization header instead)
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
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
