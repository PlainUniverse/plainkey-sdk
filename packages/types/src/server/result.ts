import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser"

export type VerifyAuthenticationTokenResult = {
  success: boolean
  data?: {
    userId: string
  }
  error?: {
    message: string
  }
}

export type BeginCredentialRegistrationResult = {
  /** WebAuthn creation options — pass these to the browser to complete the passkey ceremony. */
  options: PublicKeyCredentialCreationOptionsJSON
  /** Short-lived token — pass this to the browser alongside the options. */
  authenticationToken: string
}
