import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/browser"

import type {
  RegistrationBeginRequest,
  RegistrationCompleteRequest,
  UserCredentialBeginRequest,
  UserCredentialCompleteRequest,
  LoginBeginRequest,
  LoginCompleteRequest,
  UserIdentifier,
  PublicUser,
  IssuedToken,
  IssuedSession
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

export interface LoginResult {
  success: boolean
  data?: {
    user: PublicUser
    token: IssuedToken

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: {
    message: string
  }
}

export interface CreateUserWithPasskeyResult {
  success: boolean
  data?: {
    user: PublicUser
    token: IssuedToken
    credential: {
      id: string
      webAuthnId: string
    }

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: {
    message: string
  }
}

export interface AddPasskeyResult {
  success: boolean
  data?: {
    user: PublicUser
    token: IssuedToken
    credential: {
      id: string
      webAuthnId: string
    }

    // Internal PlainKey feature only.
    session?: IssuedSession
  }
  error?: {
    message: string
  }
}

/**
 * PlainKey client for browser. Used to register new users, add passkeys to existing users, and log users in.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/api. Change only for development purposes.
 */
export class PlainKey {
  private readonly projectId: string
  private readonly baseUrl: string

  constructor(projectId: string, baseUrl: string = "https://api.plainkey.io/api") {
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
   * @param userName - A stable unique identifier for the user, like an email address or username.
   * Can be empty for usernameless login.
   */
  async createUserWithPasskey(userName?: string): Promise<CreateUserWithPasskeyResult> {
    try {
      // Step 1: Get registration options from server
      const beginParams: RegistrationBeginRequest = { userName }
      const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginParams)
      })

      // Parse response JSON
      const { options, user } = await this.parseResponse<RegistrationBeginResponse>(beginResponse)

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
        body: JSON.stringify(completeParams)
      })

      // Parse response JSON
      const completeResponseData: RegistrationCompleteResponse =
        await this.parseResponse<RegistrationCompleteResponse>(completeResponse)

      if (!completeResponseData.success) throw new Error("Server could not complete registration")

      // Return success
      return {
        success: completeResponseData.success,
        data: {
          user: completeResponseData.user,
          token: completeResponseData.token,
          credential: completeResponseData.credential,
          session: completeResponseData.session
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
   * @param userToken - The user authentication token, obtained from login.
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  async addPasskey(userToken: string, userIdentifier: UserIdentifier): Promise<AddPasskeyResult> {
    try {
      // Validate user identifier
      if (!userIdentifier) throw new Error("User identifier is required")
      if (!userIdentifier.userId && !userIdentifier.userName)
        throw new Error("Either a userId or a userName is required")

      // Step 1: Get credential registration options from server
      const beginParams: UserCredentialBeginRequest = { userToken, userIdentifier }
      const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginParams)
      })

      // Parse response JSON
      const { options, user }: UserCredentialBeginResponse =
        await this.parseResponse<UserCredentialBeginResponse>(beginResponse)

      // Step 2: Create credential using browser's WebAuthn API
      const credential: RegistrationResponseJSON = await startRegistration({
        optionsJSON: options
      })

      // Step 3: Send credential to server for verification
      const completeParams: UserCredentialCompleteRequest = {
        userToken: beginParams.userToken,
        userIdentifier: { userId: user.id },
        credential
      }

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
          user: completeResponseData.user,
          token: completeResponseData.token,
          credential: completeResponseData.credential,
          session: completeResponseData.session
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
   * Logs a user in. Will require user interaction to authenticate.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  async login(userIdentifier: UserIdentifier): Promise<LoginResult> {
    // Validate user identifier
    if (!userIdentifier) throw new Error("User identifier is required")
    if (!userIdentifier.userId && !userIdentifier.userName)
      throw new Error("Either a userId or a userName is required")

    try {
      // Step 1: Get authentication options from server
      const beginParams: LoginBeginRequest = { userIdentifier }
      const beginResponse = await fetch(`${this.baseUrl}/login/begin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(beginParams)
      })

      // Parse response JSON
      const beginResponseData: LoginBeginResponse =
        await this.parseResponse<LoginBeginResponse>(beginResponse)

      if (!beginResponseData.options)
        throw new Error("Server returned no options in login begin response")

      // Step 2: Pass options to the authenticator and wait for response
      const authenticationResponse: AuthenticationResponseJSON = await startAuthentication({
        optionsJSON: beginResponseData.options
      })

      if (!authenticationResponse) throw new Error("No authentication response from browser")

      // Step 3: POST the response to the server
      // This uses the login session ID from the begin response - always in JS memory.
      // Do not store it in local storage, database, etc.
      const completeParams: LoginCompleteRequest = {
        loginSessionId: beginResponseData.loginSession.id,
        authenticationResponse
      }

      const verificationResponse = await fetch(`${this.baseUrl}/login/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": this.projectId
        },
        body: JSON.stringify(completeParams)
      })

      const verificationResponseData: LoginCompleteResponse =
        await this.parseResponse<LoginCompleteResponse>(verificationResponse)

      if (!verificationResponseData.verified) throw new Error("Server could not verify login")

      // Return success
      return {
        success: verificationResponseData.verified,
        data: {
          user: verificationResponseData.user,
          token: verificationResponseData.token,
          session: verificationResponseData.session
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
