import { VerifyAuthenticationTokenResult } from "@plainkey/types";

//#region src/plainKeyServer.d.ts
declare class PlainKeyServer {
  private readonly projectId;
  private readonly projectSecret;
  private readonly baseUrl;
  private accessToken?;
  constructor(projectId: string, projectSecret: string, baseUrl?: string);
  /**
   * Helper to parse response JSON.
   * Throws error if status code is not 200 OK, if the response is not valid JSON.
   */
  private parseResponse;
  /**
   * Fetches a new access token from the server and sets it in the instance variable.
   * @returns The access token object that was set in or retreived from the instance variable.
   */
  private ensureAccessToken;
  /**
   * Returns the default headers to use for all server API requests using the access token.
   * Includes the content type and the access token.
   * It makes sure to fetch a new access token if one is not already set.
   * @returns The default headers to use for all requests.
   */
  private defaultRequestHeaders;
  /**
   * Verifies a user authentication token.
   * If the token is valid, it returns the authenticated user's PlainKey User ID.
   *
   * @param authenticationToken - The authentication token to verify.
   * @returns On success, an object containing the authenticated user's PlainKey User ID.
   * On failure, throws an error.
   */
  verifyAuthenticationToken(authenticationToken: string): Promise<VerifyAuthenticationTokenResult>;
}
//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.d.ts.map