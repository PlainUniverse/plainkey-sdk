import { UserIdentifier } from "../common"
import { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

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

// Export from @simplewebauthn/browser
export { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"
