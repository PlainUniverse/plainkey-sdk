import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

import type {
  UserCredentialBeginRequest,
  UserCredentialCompleteRequest,
  LoginBeginRequest,
  LoginCompleteRequest,
  UserIdentifier,
  CreateUserWithPasskeyResult,
  AddPasskeyResult,
  AuthenticateResult,
  UserRegisterBeginRequest,
  UserRegisterBeginResponse,
  UserRegisterCompleteRequest,
  UserRegisterCompleteResponse,
  AuthenticationCompleteResponse,
  AuthenticationBeginResponse,
  CredentialLabelUpdateRequest,
  UpdatePasskeyLabelResult
} from "@plainkey/types"

import type { UserCredentialBeginResponse, UserCredentialCompleteResponse } from "@plainkey/types"

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
   * Throws error if status code is not 200 OK, if the response is not valid JSON.
   */
  private async parseResponse<T = any>(response: Response): Promise<T> {
    let bodyText: string

    // Read as text first to avoid JSON.parse errors on any HTML/plaintext error responses.
    try {
      bodyText = await response.text()
    } catch {
      throw new Error("Network error while reading server response")
    }

    // Parse the response text as JSON.
    let json: any

    try {
      json = bodyText ? JSON.parse(bodyText) : {}
    } catch {
      if (!response.ok) throw new Error("Server returned an invalid JSON error response")
      throw new Error("Invalid JSON received from server")
    }

    if (!response.ok) {
      // Server should return { error: string }
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
      const beginRequestBody: UserRegisterBeginRequest = { userName }
      const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginRequestBody)
      })

      // Parse response JSON
      const { userId, options } = await this.parseResponse<UserRegisterBeginResponse>(beginResponse)

      // Step 2: Create credential using browser's WebAuthn API
      const credential: RegistrationResponseJSON = await startRegistration({
        optionsJSON: options
      })

      // Step 3: Send credential to server for verification
      const completeRequestBody: UserRegisterCompleteRequest = { userId, credential }
      const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(completeRequestBody)
      })

      // Parse response JSON
      const completeResponseData: UserRegisterCompleteResponse =
        await this.parseResponse<UserRegisterCompleteResponse>(completeResponse)

      if (!completeResponseData.success) throw new Error("Server could not complete registration")

      // Return success
      return {
        success: completeResponseData.success,
        data: {
          userId: completeResponseData.userId,
          authenticationToken: completeResponseData.authenticationToken,
          credential: completeResponseData.credential
        }
      }
    } catch (error) {
      // Return error
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
  }

  /**
   * Adds a passkey to an existing user. Will require user interaction to create a passkey.
   *
   * @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param userName - A unique identifier for the user, like an email address or username.
   * If not provided, the user's stored userName will be used.
   */
  async addPasskey(authenticationToken: string, userName?: string): Promise<AddPasskeyResult> {
    if (!authenticationToken) throw new Error("Authentication token is required")

    try {
      // Step 1: Get credential registration options from server
      const beginParams: UserCredentialBeginRequest = { authenticationToken, userName }
      const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginParams)
      })

      // Parse response JSON
      const { options }: UserCredentialBeginResponse =
        await this.parseResponse<UserCredentialBeginResponse>(beginResponse)

      // Step 2: Create credential using browser's WebAuthn API
      const credential: RegistrationResponseJSON = await startRegistration({ optionsJSON: options })

      // Step 3: Send credential to server for verification
      const completeParams: UserCredentialCompleteRequest = { authenticationToken, credential }

      const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(completeParams)
      })

      // Parse response JSON
      const completeResponseData: UserCredentialCompleteResponse =
        await this.parseResponse<UserCredentialCompleteResponse>(completeResponse)

      if (!completeResponseData.success)
        throw new Error("Server could not complete passkey registration")

      // Return success
      return {
        success: completeResponseData.success,
        data: {
          authenticationToken: completeResponseData.authenticationToken,
          credential: completeResponseData.credential
        }
      }
    } catch (error) {
      // Return error
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
  }

  /**
   * Updates a passkey label. Requires authentication shortly before this call. Any passkey registered to the user can be updated.
   * @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param credentialId - The ID of the passkey credential to update. Is returned from createUserWithPasskey() and addPasskey().
   * @param label - The new label for the passkey.
   */
  async updatePasskeyLabel(
    authenticationToken: string,
    credentialId: string,
    label: string
  ): Promise<UpdatePasskeyLabelResult> {
    if (!authenticationToken) throw new Error("Authentication token is required")
    if (!credentialId) throw new Error("Credential ID is required")
    // Empty label is allowed

    try {
      const updateLabelParams: CredentialLabelUpdateRequest = { authenticationToken, label }
      const updateLabelResponse = await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(updateLabelParams)
      })

      if (!updateLabelResponse.ok) throw new Error("Failed to update passkey label")

      // Return success
      return { success: true }
    } catch (error) {
      // Return error
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
   * @param userIdentifier - Optional object containing either the user's PlainKey User ID or their userName.
   * Does not have to be provided for usernameless authentication.
   */
  async authenticate(userIdentifier?: UserIdentifier): Promise<AuthenticateResult> {
    try {
      // Step 1: Get authentication options from server
      const beginParams: LoginBeginRequest = { userIdentifier }
      const beginResponse = await fetch(`${this.baseUrl}/authenticate/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginParams)
      })

      // Parse response JSON
      const beginResponseData: AuthenticationBeginResponse =
        await this.parseResponse<AuthenticationBeginResponse>(beginResponse)

      if (!beginResponseData.options)
        throw new Error("Server returned no options in login begin response")

      // Step 2: Pass options to the authenticator and wait for response
      const authenticationResponse: AuthenticationResponseJSON = await startAuthentication({
        optionsJSON: beginResponseData.options
      })

      if (!authenticationResponse) throw new Error("No authentication response from browser")

      // Step 3: POST the response to the server
      // This uses the authentication session ID from the begin response - always in JS memory.
      // Do not store it in local storage, database, etc.
      const completeParams: LoginCompleteRequest = {
        loginSessionId: beginResponseData.loginSession.id,
        authenticationResponse
      }

      const authenticateCompleteResponse = await fetch(`${this.baseUrl}/authenticate/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(completeParams)
      })

      const authCompleteResponseData: AuthenticationCompleteResponse =
        await this.parseResponse<AuthenticationCompleteResponse>(authenticateCompleteResponse)

      // Return success
      return {
        success: true,
        data: {
          authenticationToken: authCompleteResponseData.authenticationToken
        }
      }
    } catch (error) {
      // Return error
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
  }
}
