import type { UserIdentifier } from "@plainkey/shared-types"
import { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

// User Registration (creates new user + adds passkey)
export type RegistrationBeginRequest = {
  userName?: string
  userMetadata?: Record<string, unknown>
}

export type RegistrationCompleteRequest = {
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
}

// Credential registration (adds passkey to existing user)
export type UserCredentialBeginRequest = {
  userIdentifier: UserIdentifier
}

export type UserCredentialCompleteRequest = {
  userIdentifier: UserIdentifier
  credential: RegistrationResponseJSON
}

// Login
export type LoginBeginRequest = {
  userIdentifier?: UserIdentifier // Not needed for usernameless login
}

export type LoginCompleteRequest = {
  authenticationResponse: AuthenticationResponseJSON
}
