import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

import type {
  RegistrationBeginRequest,
  RegistrationCompleteRequest,
  UserCredentialBeginRequest,
  UserCredentialCompleteRequest,
  LoginBeginRequest,
  LoginCompleteRequest
} from "@plainkey/types"

import type {
  RegistrationBeginResponse,
  RegistrationCompleteResponse,
  UserCredentialBeginResponse,
  UserCredentialCompleteResponse,
  LoginBeginResponse,
  LoginCompleteResponse,
  ErrorResponse
} from "@plainkey/types"

export type PlainKeyClientParams = {
  projectId: string
  baseUrl?: string
}

// TODO: Account for errors like this: "Unexpected token 'R', "Response v"... is not valid JSON"
export class PlainKeyClient {
  private readonly projectId: string
  private readonly baseUrl: string

  constructor(clientParams: PlainKeyClientParams) {
    const { projectId, baseUrl = "https://api.plainkey.io" } = clientParams

    this.projectId = projectId
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  /**
   * Registration of a new user with passkey.
   * Creates a new user and adds a credential to it.
   */
  async Registration(beginParams: RegistrationBeginRequest): Promise<RegistrationCompleteResponse> {
    // Step 1: Get registration options from server
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-project-id": this.projectId
    })

    const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(beginParams)
    })

    if (!beginResponse.ok) {
      const errorData: ErrorResponse = await beginResponse.json()
      throw new Error(errorData.error)
    }

    const { options, user } = (await beginResponse.json()) as RegistrationBeginResponse

    // Step 2: Create credential using browser's WebAuthn API
    const credential: RegistrationResponseJSON = await startRegistration({
      optionsJSON: options
    })

    // Step 3: Send credential to server for verification
    const completeParams: RegistrationCompleteRequest = {
      userIdentifier: { userId: user.id },
      credential
    }

    const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": this.projectId
      },
      credentials: "include",
      body: JSON.stringify(completeParams)
    })

    if (!completeResponse.ok) {
      const errorData: ErrorResponse = await completeResponse.json()
      throw new Error(errorData.error)
    }

    // Intentionally not throwing errors on verification failure - UI should handle this.
    const response: RegistrationCompleteResponse = await completeResponse.json()
    if (!response) throw new Error("No registration response from server")

    return response
  }

  /**
   * Add credential to existing user.
   * Requires valid user authentication token (log user in first which will set a user token cookie, then call this).
   */
  async AddCredential(
    beginParams: UserCredentialBeginRequest
  ): Promise<UserCredentialCompleteResponse> {
    // Step 1: Get credential registration options from server
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-project-id": this.projectId
    })

    const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(beginParams)
    })

    if (!beginResponse.ok) {
      const errorData: ErrorResponse = await beginResponse.json()
      throw new Error(errorData.error)
    }

    const { options, user } = (await beginResponse.json()) as UserCredentialBeginResponse

    // Step 2: Create credential using browser's WebAuthn API
    const credential: RegistrationResponseJSON = await startRegistration({
      optionsJSON: options
    })

    // Step 3: Send credential to server for verification
    const completeParams: UserCredentialCompleteRequest = {
      userIdentifier: { userId: user.id },
      credential
    }

    const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": this.projectId
      },
      credentials: "include",
      body: JSON.stringify(completeParams)
    })

    if (!completeResponse.ok) {
      const errorData: ErrorResponse = await completeResponse.json()
      throw new Error(errorData.error)
    }

    // Intentionally not throwing errors on verification failure - UI should handle this.
    const response: UserCredentialCompleteResponse = await completeResponse.json()
    if (!response) throw new Error("No credential registration response from server")

    return response
  }

  /**
   * Performs a login ceremony.
   */
  async Login(beginParams: LoginBeginRequest): Promise<LoginCompleteResponse> {
    // Step 1: Get authentication options from server
    const beginResponse = await fetch(`${this.baseUrl}/login/begin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": this.projectId
      },
      credentials: "include",
      body: JSON.stringify(beginParams)
    })

    if (!beginResponse.ok) {
      const errorData: ErrorResponse = await beginResponse.json()
      throw new Error(errorData.error)
    }

    const beginResponseData: LoginBeginResponse = await beginResponse.json()
    if (!beginResponseData.options) {
      throw new Error("No options found in login begin response")
    }

    // Step 2: Pass options to the authenticator and wait for response
    const authenticationResponse: AuthenticationResponseJSON = await startAuthentication({
      optionsJSON: beginResponseData.options
    })

    if (!authenticationResponse) {
      throw new Error("No authentication response from browser")
    }

    // Step 3: POST the response to the server
    const completeParams: LoginCompleteRequest = { authenticationResponse }

    const verificationResponse = await fetch(`${this.baseUrl}/login/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": this.projectId
      },
      credentials: "include",
      body: JSON.stringify(completeParams)
    })

    if (!verificationResponse.ok) {
      const errorData: ErrorResponse = await verificationResponse.json()
      throw new Error(errorData.error)
    }

    // Intentionally not throwing errors on verification failure - UI should handle this.
    const verificationResponseData: LoginCompleteResponse = await verificationResponse.json()
    if (!verificationResponseData) throw new Error("No login verification response from server")

    return verificationResponseData
  }
}
