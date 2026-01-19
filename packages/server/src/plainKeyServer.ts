import {
  AccessTokenResponse,
  VerifyAuthenticationTokenResponse,
  VerifyAuthenticationTokenResult
} from "@plainkey/types"

export class PlainKeyServer {
  private readonly projectId: string
  private readonly projectSecret: string
  private readonly baseUrl: string

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
   * Exchanges project credentials for a short-lived project access token.
   * This token is required to call the PlainKey Server API's.
   */
  async accessToken(): Promise<AccessTokenResponse> {
    const body = new URLSearchParams({
      client_id: this.projectId,
      client_secret: this.projectSecret
    })

    const response = await fetch(`${this.baseUrl}/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    })

    return await this.parseResponse<AccessTokenResponse>(response)
  }

  /**
   * Verifies a user authentication token.
   * If the token is valid, it returns the authenticated user's PlainKey User ID.
   * If the token is invalid, it throws an error.
   *
   * @param accessToken - The project access token (obtained from {@link PlainKeyServer.accessToken}).
   * @param params - Parameter object for the request.
   * @param params.authenticationToken - The authentication token to verify.
   * @returns An object containing the authenticated user's PlainKey User ID.
   */
  async verifyAuthenticationToken(
    accessToken: string,
    params: { authenticationToken: string }
  ): Promise<VerifyAuthenticationTokenResult> {
    const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(params)
    })

    const acceptedErrorCodes = [401]
    const responseData = await this.parseResponse<VerifyAuthenticationTokenResponse>(
      response,
      acceptedErrorCodes
    )

    if (!responseData.valid) {
      throw new Error(responseData.error ?? "Invalid authentication token.")
    }

    // Authentication token is valid
    return { userId: responseData.user.id }
  }

  // TODO: Begin passkey registration
}
