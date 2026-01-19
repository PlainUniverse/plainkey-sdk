import { AccessTokenResponse, VerifyAuthenticationTokenResult } from "@plainkey/types";

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
   * This token is required to call the PlainKey Server API's.
   */
  accessToken(): Promise<AccessTokenResponse>;
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
  verifyAuthenticationToken(accessToken: string, params: {
    authenticationToken: string;
  }): Promise<VerifyAuthenticationTokenResult>;
}
//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.d.ts.map