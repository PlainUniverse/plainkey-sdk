import { UserIdentifier } from "../common"
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

// User Registration (creates new user + adds passkey)
export type RegistrationBeginRequest = {
  projectId: string
  userName?: string
}

export type RegistrationCompleteRequest = {
  projectId: string
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
}

// Credential registration (adds passkey to existing user)
export type UserCredentialBeginRequest = {
  projectId?: string // Only for frontend calls (backend uses X-Project-Id header instead)
  userToken?: string // Only for backend calls (backend uses Authorization header instead)
  userIdentifier: UserIdentifier
}

export type UserCredentialCompleteRequest = {
  projectId?: string // Only for frontend calls (backend uses X-Project-Id header instead)
  userToken?: string // Only for backend calls (backend uses Authorization header instead)
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
}

// Login
export type LoginBeginRequest = {
  projectId: string
  userIdentifier?: UserIdentifier // Not needed for usernameless login
}

export type LoginCompleteRequest = {
  projectId: string
  loginSessionId: string
  authenticationResponse: AuthenticationResponseJSON
}

// Re-export types for consumers
export type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"
