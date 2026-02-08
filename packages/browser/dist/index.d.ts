import { AddPasskeyResult, AuthenticateResult, CreateUserWithPasskeyResult, UpdatePasskeyLabelResult, UserIdentifier } from "@plainkey/types";

//#region src/plainKey.d.ts

/**
 * PlainKey client for the browser. Used to register new users, add passkeys to existing users, and log users in.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/browser. Change only for development purposes.
 */
declare class PlainKey {
  private readonly projectId;
  private readonly baseUrl;
  constructor(projectId: string, baseUrl?: string);
  /**
   * Helper to parse response JSON.
   * Throws error if status code is not 200 OK, if the response is not valid JSON.
   */
  private parseResponse;
  /**
   * Registration of a new user with a passkey. Will require user interaction to create a passkey.
   *
   * @param userName - A unique identifier for the user, like an email address or username.
   * Can be empty for usernameless authentication.
   */
  createUserWithPasskey(userName?: string): Promise<CreateUserWithPasskeyResult>;
  /**
   * Adds a passkey to an existing user. Will require user interaction to create a passkey.
   *
   * @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param userName - A unique identifier for the user, like an email address or username.
   * If not provided, the user's stored userName will be used.
   */
  addPasskey(authenticationToken: string, userName?: string): Promise<AddPasskeyResult>;
  /**
   * Updates a passkey label. Requires authentication shortly before this call. Any passkey registered to the user can be updated.
   * @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param credentialId - The ID of the passkey credential to update. Is returned from createUserWithPasskey() and addPasskey().
   * @param label - The new label for the passkey.
   */
  updatePasskeyLabel(authenticationToken: string, credentialId: string, label: string): Promise<UpdatePasskeyLabelResult>;
  /**
   * Authenticates a user. Can be used for login, verification, 2FA, etc.
   * Will require user interaction to authenticate.
   *
   * @param userIdentifier - Optional object containing either the user's PlainKey User ID or their userName.
   * Does not have to be provided for usernameless authentication.
   */
  authenticate(userIdentifier?: UserIdentifier): Promise<AuthenticateResult>;
}
//#endregion
export { PlainKey };
//# sourceMappingURL=index.d.ts.map