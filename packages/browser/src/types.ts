export type UserIdentifier = {
  userId?: string
  userName?: string
}

export type AuthenticationToken = {
  token: string
  expiresAt: number
}

export type CredentialBasicInfo = {
  id: string
  label: string | null
  authenticatorType: string | null
  userId: string
}

export interface AuthenticateResult {
  success: boolean
  data?: {
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface CreateUserWithPasskeyResult {
  success: boolean
  data?: {
    userId: string
    credential: CredentialBasicInfo
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    credential: CredentialBasicInfo
    authenticationToken: AuthenticationToken
  }
  error?: { message: string }
}

export interface UpdatePasskeyLabelResult {
  success: boolean
  error?: { message: string }
}

export type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"
