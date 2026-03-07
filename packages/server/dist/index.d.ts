import { BeginCredentialRegistrationResult, ServerCredential, UserIdentifier, UserInfo, VerifyAuthenticationTokenResult } from "@plainkey/types";

//#region src/plainKeyServer.d.ts

/**
 * PlainKey server SDK. Used to verify authentication tokens and manage users and passkeys.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID.
 * @param projectSecret - Your PlainKey project secret.
 * @param baseUrl - Set by default to https://api.plainkey.io/server. Change only for development purposes.
 */
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
   * Returns `{ success: true, data: { userId } }` on success, or `{ success: false, error: { message } }` on failure.
   * An invalid or expired token is a normal expected outcome. Always check `result.success` before using `result.data`.
   *
   * @param authenticationToken - The authentication token to verify, received from the user's browser after a successful passkey authentication.
   */
  verifyAuthenticationToken(authenticationToken: string): Promise<VerifyAuthenticationTokenResult>;
  /**
   * Get a user by their PlainKey user ID.
   *
   * @param userId - The PlainKey user ID.
   */
  getUser(userId: string): Promise<UserInfo>;
  /**
   * Find a user by their userName.
   *
   * @param userName - The user's userName.
   */
  findUser(userName: string): Promise<UserInfo>;
  /**
   * Create a new user.
   *
   * @param userName - A unique identifier for the user, like an email address or username. Optional for usernameless flows.
   */
  createUser(userName?: string): Promise<UserInfo>;
  /**
   * Update a user.
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   * @param updates - Fields to update.
   */
  updateUser(userIdentifier: UserIdentifier, updates: {
    userName?: string | null;
  }): Promise<UserInfo>;
  /**
   * Delete a user and all their passkeys.
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   */
  deleteUser(userIdentifier: UserIdentifier): Promise<void>;
  /**
   * Bulk create users. Useful for migrating existing users to PlainKey.
   *
   * @param userNames - Array of userNames to create.
   */
  bulkCreateUsers(userNames: string[]): Promise<UserInfo[]>;
  /**
   * Get all passkeys for a user.
   *
   * @param userId - The PlainKey user ID.
   */
  getUserCredentials(userId: string): Promise<ServerCredential[]>;
  /**
   * Get a specific passkey by ID.
   *
   * @param credentialId - The passkey ID.
   */
  getCredential(credentialId: string): Promise<ServerCredential>;
  /**
   * Delete a passkey.
   *
   * @param credentialId - The passkey ID.
   */
  deleteCredential(credentialId: string): Promise<void>;
  /**
   * Update the label of a passkey. Pass null to clear the label.
   *
   * @param credentialId - The passkey ID.
   * @param label - The new label, or null to clear it.
   */
  updateCredentialLabel(credentialId: string, label: string | null): Promise<void>;
  /**
   * Begin a passkey registration ceremony for an existing user, initiated from your backend.
   * Returns WebAuthn options and a short-lived authenticationToken. Pass both to the browser.
   * to complete the ceremony at /browser/user/credential/complete (or via the browser SDK's addPasskey()).
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   */
  beginCredentialRegistration(userIdentifier: UserIdentifier): Promise<BeginCredentialRegistrationResult>;
}
//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.d.ts.map