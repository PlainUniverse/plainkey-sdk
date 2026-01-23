import {
  AccessTokenResponse,
  VerifyAuthenticationTokenResponse,
  VerifyAuthenticationTokenResult
} from "@plainkey/types"

type AccessToken = {
  access_token: string

  // Calculated from expires_in. Will not be exact due to request time.
  expires_at: Date
}

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

  /**
   * Verifies a user authentication token.
   * If the token is valid, it returns the authenticated user's PlainKey User ID.
   *
   * @param authenticationToken - The authentication token to verify.
   * @returns On success, an object containing the authenticated user's PlainKey User ID.
   * On failure, throws an error.
   */
  async verifyAuthenticationToken(
    authenticationToken: string
  ): Promise<VerifyAuthenticationTokenResult> {
    // Verify the authentication token with the PlainKey Server API.
    const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
      method: "POST",
      headers: await this.defaultRequestHeaders(),
      body: JSON.stringify({ token: authenticationToken })
    })

    // Parse the response data
    const acceptedErrorCodes = [401]
    const responseData = await this.parseResponse<VerifyAuthenticationTokenResponse>(
      response,
      acceptedErrorCodes
    )

    // Throw error on invalid authentication token
    if (!responseData.valid) {
      throw new Error(responseData.error ?? "Invalid authentication token.")
    }

    // Authentication token is valid
    return { userId: responseData.userId }
  }

  // TODO: Begin passkey registration
}
