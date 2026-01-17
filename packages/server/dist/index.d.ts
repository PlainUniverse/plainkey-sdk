import { AccessTokenResponse, VerifyAuthTokenResponse } from "@plainkey/types";

//#region src/plainKeyServer.d.ts
declare class PlainKeyServer {
  private readonly projectId;
  private readonly projectSecret;
  private readonly baseUrl;
  constructor(projectId: string, projectSecret: string, baseUrl?: string);
  /**
   * Helper to parse response JSON.
   * Throws error if status code is not 200 OK, if the response is not valid JSON.
   */
  private parseResponse;
  /**
   * Exchanges project credentials for a short-lived project access token.
   * This token is required to call authenticated PlainKey Server APIs.
   */
  accessToken(): Promise<AccessTokenResponse>;
  /**
   * Verifies a user authentication token.
   *
   * @param accessToken - The project access token (obtained from {@link PlainKeyServer.accessToken}).
   * @param params - The parameters for the request.
   * @param params.token - The authentication token to verify.
   * @returns The authentication token verification response.
   *
   */
  verifyAuthenticationToken(accessToken: string, params: {
    token: string;
  }): Promise<VerifyAuthTokenResponse>;
}
//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.d.ts.map