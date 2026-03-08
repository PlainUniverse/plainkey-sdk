import {
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser"

import type {
  AuthenticateResult,
  AddPasskeyResult,
  CreateUserWithPasskeyResult,
  UpdatePasskeyLabelResult,
  UserIdentifier
} from "./types"

import type {
  BeginUserRegistration200,
  CompleteUserRegistration200,
  BeginCredentialRegistration200,
  CompleteCredentialRegistration200,
  BeginAuthentication200,
  CompleteAuthentication200,
  UpdateCredentialLabelBody
} from "./generated/api"

/**
 * PlainKey client for the browser. Used to register new users, add passkeys to existing users, and log users in.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/browser. Change only for development purposes.
 */
export class PlainKey {
  private readonly projectId: string
  private readonly baseUrl: string

  constructor(projectId: string, baseUrl: string = "https://api.plainkey.io/browser") {
    if (!projectId) throw new Error("Project ID is required")
    if (!baseUrl) throw new Error("Base URL is required")

    this.projectId = projectId
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  /**
   * Helper to parse response JSON.
   * Throws error if status code is not 200 OK or if the response is not valid JSON.
   */
  private async parseResponse<T = any>(response: Response): Promise<T> {
    let bodyText: string

    // Read as text first to avoid JSON.parse errors on any HTML/plaintext error responses.
    try {
      bodyText = await response.text()
    } catch {
      throw new Error("Network error while reading server response")
    }

    let json: any

    try {
      json = bodyText ? JSON.parse(bodyText) : {}
    } catch {
      if (!response.ok) throw new Error("Server returned an invalid JSON error response")
      throw new Error("Invalid JSON received from server")
    }

    if (!response.ok) {
      const message = json && typeof json.error === "string" ? json.error : "Unknown server error"
      throw new Error(message)
    }

    return json as T
  }

  /**
   * Registration of a new user with a passkey. Will require user interaction to create a passkey.
   *
   * @param userName - A unique identifier for the user, like an email address or username.
   * Can be empty for usernameless authentication.
   */
  async createUserWithPasskey(userName?: string): Promise<CreateUserWithPasskeyResult> {
    try {
      // Step 1: Get registration options from server
      const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ userName })
      })

      const { userId, options } = await this.parseResponse<BeginUserRegistration200>(beginResponse)

      // Step 2: Create credential using browser's WebAuthn API
      const credential = await startRegistration({
        optionsJSON: options as unknown as PublicKeyCredentialCreationOptionsJSON
      })

      // Step 3: Send credential to server for verification
      const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ userId, credential })
      })

      const completeData = await this.parseResponse<CompleteUserRegistration200>(completeResponse)

      if (!completeData.success) throw new Error("Server could not complete registration")

      return {
        success: true,
        data: {
          userId: completeData.userId,
          authenticationToken: completeData.authenticationToken,
          credential: completeData.credential
        }
      }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : "Unknown error" }
      }
    }
  }

  /**
   * Adds a passkey to an existing user. Will require user interaction to create a passkey.
   *
   * @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param userName - A unique identifier for the user. If not provided, the user's stored userName will be used.
   */
  async addPasskey(authenticationToken: string, userName?: string): Promise<AddPasskeyResult> {
    if (!authenticationToken) throw new Error("Authentication token is required")

    try {
      // Step 1: Get credential registration options from server
      const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ authenticationToken, userName })
      })

      const { options } = await this.parseResponse<BeginCredentialRegistration200>(beginResponse)

      // Step 2: Create credential using browser's WebAuthn API
      const credential = await startRegistration({
        optionsJSON: options as unknown as PublicKeyCredentialCreationOptionsJSON
      })

      // Step 3: Send credential to server for verification
      const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ authenticationToken, credential })
      })

      const completeData =
        await this.parseResponse<CompleteCredentialRegistration200>(completeResponse)

      if (!completeData.success) throw new Error("Server could not complete passkey registration")

      return {
        success: true,
        data: {
          authenticationToken: completeData.authenticationToken,
          credential: completeData.credential
        }
      }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : "Unknown error" }
      }
    }
  }

  /**
   * Completes a server-initiated passkey registration. Use this when your backend has already called
   * beginCredentialRegistration() via the Server SDK (or the associated endpoint via REST API), and passed the options and
   * authenticationToken to the frontend.
   *
   * @param authenticationToken - The short-lived token returned alongside the options by beginCredentialRegistration().
   * @param options - The WebAuthn creation options returned by the server's beginCredentialRegistration().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   */
  async completePasskeyRegistration(
    authenticationToken: string,
    options: PublicKeyCredentialCreationOptionsJSON
  ): Promise<AddPasskeyResult> {
    if (!authenticationToken) throw new Error("Authentication token is required")
    if (!options) throw new Error("Options are required")

    try {
      // Step 1: Complete the WebAuthn ceremony using the server-provided options
      const credential = await startRegistration({ optionsJSON: options })

      // Step 2: Send credential to server for verification
      const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ authenticationToken, credential })
      })

      const completeData =
        await this.parseResponse<CompleteCredentialRegistration200>(completeResponse)

      if (!completeData.success) throw new Error("Server could not complete passkey registration")

      return {
        success: true,
        data: {
          authenticationToken: completeData.authenticationToken,
          credential: completeData.credential
        }
      }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : "Unknown error" }
      }
    }
  }

  /**
   * Updates a passkey label. Any passkey registered to the user can be updated.
   *
   * @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param credentialId - The ID of the passkey to update, returned from createUserWithPasskey() or addPasskey().
   * @param label - The new label for the passkey.
   */
  async updatePasskeyLabel(
    authenticationToken: string,
    credentialId: string,
    label: string
  ): Promise<UpdatePasskeyLabelResult> {
    if (!authenticationToken) throw new Error("Authentication token is required")
    if (!credentialId) throw new Error("Credential ID is required")

    try {
      const body: UpdateCredentialLabelBody = { authenticationToken, label }
      const response = await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error("Failed to update passkey label")

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : "Unknown error" }
      }
    }
  }

  /**
   * Authenticates a user. Can be used for login, verification, 2FA, etc.
   * Will require user interaction to authenticate.
   *
   * @param userIdentifier - Optional. Identify the user by their PlainKey user ID or userName.
   * Not required for usernameless authentication.
   */
  async authenticate(userIdentifier?: UserIdentifier): Promise<AuthenticateResult> {
    try {
      // Step 1: Get authentication options from server
      const beginResponse = await fetch(`${this.baseUrl}/authenticate/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({ userIdentifier })
      })

      const beginData = await this.parseResponse<BeginAuthentication200>(beginResponse)

      if (!beginData.options)
        throw new Error("Server returned no options in authentication begin response")

      // Step 2: Pass options to the authenticator and wait for response
      const authenticationResponse = await startAuthentication({
        optionsJSON: beginData.options as unknown as PublicKeyCredentialRequestOptionsJSON
      })

      if (!authenticationResponse) throw new Error("No authentication response from browser")

      // Step 3: POST the response to the server
      const completeResponse = await fetch(`${this.baseUrl}/authenticate/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify({
          loginSessionId: beginData.loginSession.id,
          authenticationResponse
        })
      })

      const completeData = await this.parseResponse<CompleteAuthentication200>(completeResponse)

      return {
        success: true,
        data: { authenticationToken: completeData.authenticationToken }
      }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : "Unknown error" }
      }
    }
  }
}
