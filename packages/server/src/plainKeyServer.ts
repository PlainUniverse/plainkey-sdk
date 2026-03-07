import {
  AccessTokenResponse,
  BeginCredentialRegistrationResult,
  ServerCredential,
  UserIdentifier,
  UserInfo,
  VerifyAuthenticationTokenResponse,
  VerifyAuthenticationTokenResult
} from "@plainkey/types"

type AccessToken = {
  access_token: string

  // Calculated from expires_in. Will not be exact due to request time.
  expires_at: Date
}

/**
 * PlainKey server SDK. Used to verify authentication tokens and manage users and passkeys.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID.
 * @param projectSecret - Your PlainKey project secret.
 * @param baseUrl - Set by default to https://api.plainkey.io/server. Change only for development purposes.
 */
export class PlainKeyServer {
  private readonly projectId: string
  private readonly projectSecret: string
  private readonly baseUrl: string
  private accessToken?: AccessToken

  constructor(
    projectId: string,
    projectSecret: string,
    baseUrl: string = "https://api.plainkey.io/server"
  ) {
    if (!projectId) throw new Error("Project ID is required")
    if (!projectSecret) throw new Error("Project secret is required")
    if (!baseUrl) throw new Error("Base URL is required")

    this.projectId = projectId
    this.projectSecret = projectSecret
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  /**
   * Helper to parse response JSON.
   * Throws error if status code is not 200 OK, if the response is not valid JSON.
   */
  private async parseResponse<T = any>(
    response: Response,
    acceptedErrorCodes?: number[]
  ): Promise<T> {
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
      // If status code is a acceped error code we parse return the parsed JSON instead of the error.
      if (acceptedErrorCodes && acceptedErrorCodes.includes(response.status)) {
        return json as T
      }

      // Server should return { error: string }
      const message = json && typeof json.error === "string" ? json.error : "Unknown server error"
      throw new Error(message)
    }

    return json as T
  }

  /**
   * Fetches a new access token from the server and sets it in the instance variable.
   * @returns The access token object that was set in or retreived from the instance variable.
   */
  private async ensureAccessToken(): Promise<AccessToken> {
    // We only fetch a new access token if none is set or it is close to expiration/have been expired.
    // Expiration should be 60 minutes. Grace period: 10 minutes.
    const gracePeriodDate = new Date(Date.now() + 10 * 60 * 1000)

    if (this.accessToken && this.accessToken.expires_at > gracePeriodDate) {
      return this.accessToken
    }

    // Fetch the access token from the PlainKey Server API.
    const response = await fetch(`${this.baseUrl}/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.projectId,
        client_secret: this.projectSecret
      })
    })

    // Parse the response data
    const responseData: AccessTokenResponse =
      await this.parseResponse<AccessTokenResponse>(response)

    // Make into the internal access token object.
    const accessToken: AccessToken = {
      access_token: responseData.access_token,
      expires_at: new Date(Date.now() + responseData.expires_in * 1000)
    }

    // Set the access token in the instance variable
    this.accessToken = accessToken
    return accessToken
  }

  /**
   * Returns the default headers to use for all server API requests using the access token.
   * Includes the content type and the access token.
   * It makes sure to fetch a new access token if one is not already set.
   * @returns The default headers to use for all requests.
   */
  private async defaultRequestHeaders(): Promise<Headers> {
    const accessToken: AccessToken = await this.ensureAccessToken()

    return new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.access_token}`,
      "x-project-id": this.projectId
    })
  }

  // Authentication //

  /**
   * Verifies a user authentication token.
   * Returns `{ success: true, data: { userId } }` on success, or `{ success: false, error: { message } }` on failure.
   * An invalid or expired token is a normal expected outcome. Always check `result.success` before using `result.data`.
   *
   * @param authenticationToken - The authentication token to verify, received from the user's browser after a successful passkey authentication.
   */
  async verifyAuthenticationToken(
    authenticationToken: string
  ): Promise<VerifyAuthenticationTokenResult> {
    const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
      method: "POST",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ token: authenticationToken })
    })

    const responseData = await this.parseResponse<VerifyAuthenticationTokenResponse>(response, [
      401
    ])

    if (!responseData.valid) {
      return {
        success: false,
        error: { message: responseData.error ?? "Invalid authentication token" }
      }
    }

    return { success: true, data: { userId: responseData.userId } }
  }

  // Users //

  /**
   * Get a user by their PlainKey user ID.
   *
   * @param userId - The PlainKey user ID.
   */
  async getUser(userId: string): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: "GET",
      headers: await this.defaultRequestHeaders()
    })

    return this.parseResponse<UserInfo>(response)
  }

  /**
   * Find a user by their userName.
   *
   * @param userName - The user's userName.
   */
  async findUser(userName: string): Promise<UserInfo> {
    const params = new URLSearchParams({ userName })
    const response = await fetch(`${this.baseUrl}/user?${params}`, {
      method: "GET",
      headers: await this.defaultRequestHeaders()
    })

    return this.parseResponse<UserInfo>(response)
  }

  /**
   * Create a new user.
   *
   * @param userName - A unique identifier for the user, like an email address or username. Optional.
   */
  async createUser(userName?: string): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: "POST",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ userName })
    })

    return this.parseResponse<UserInfo>(response)
  }

  /**
   * Update a user.
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   * @param updates - Fields to update.
   */
  async updateUser(
    userIdentifier: UserIdentifier,
    updates: { userName?: string | null }
  ): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: "PATCH",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ userIdentifier, updates })
    })

    return this.parseResponse<UserInfo>(response)
  }

  /**
   * Delete a user and all their passkeys.
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   */
  async deleteUser(userIdentifier: UserIdentifier): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: "DELETE",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ userIdentifier })
    })

    await this.parseResponse(response)
  }

  /**
   * Bulk create users. Useful for importing existing users to PlainKey.
   *
   * @param userNames - Array of userNames to create.
   */
  async bulkCreateUsers(userNames: string[]): Promise<UserInfo[]> {
    const response = await fetch(`${this.baseUrl}/user/bulk`, {
      method: "POST",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ users: userNames.map((userName) => ({ userName })) })
    })

    return this.parseResponse<UserInfo[]>(response)
  }

  // Credentials //

  /**
   * Get all passkeys for a user.
   *
   * @param userId - The PlainKey user ID.
   */
  async getUserCredentials(userId: string): Promise<ServerCredential[]> {
    const response = await fetch(`${this.baseUrl}/user/${userId}/credentials`, {
      method: "GET",
      headers: await this.defaultRequestHeaders()
    })

    return this.parseResponse<ServerCredential[]>(response)
  }

  /**
   * Get a specific passkey by ID.
   *
   * @param credentialId - The passkey ID.
   */
  async getCredential(credentialId: string): Promise<ServerCredential> {
    const response = await fetch(`${this.baseUrl}/credential/${credentialId}`, {
      method: "GET",
      headers: await this.defaultRequestHeaders()
    })

    return this.parseResponse<ServerCredential>(response)
  }

  /**
   * Delete a passkey.
   *
   * @param credentialId - The passkey ID.
   */
  async deleteCredential(credentialId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/credential/${credentialId}`, {
      method: "DELETE",
      headers: await this.defaultRequestHeaders()
    })

    await this.parseResponse(response)
  }

  /**
   * Update the label of a passkey. Pass null to clear the label.
   *
   * @param credentialId - The passkey ID.
   * @param label - The new label, or null to clear it.
   */
  async updateCredentialLabel(credentialId: string, label: string | null): Promise<void> {
    const response = await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
      method: "PATCH",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ label })
    })

    await this.parseResponse(response)
  }

  /**
   * Begin a passkey registration ceremony for an existing user, initiated from your backend.
   * Returns WebAuthn options and a short-lived authenticationToken. Pass both to the browser.
   * to complete the ceremony at /browser/user/credential/complete (or via the browser SDK's addPasskey()).
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   */
  async beginCredentialRegistration(
    userIdentifier: UserIdentifier
  ): Promise<BeginCredentialRegistrationResult> {
    const response = await fetch(`${this.baseUrl}/user/credential/begin`, {
      method: "POST",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ userIdentifier })
    })

    return this.parseResponse<BeginCredentialRegistrationResult>(response)
  }
}
