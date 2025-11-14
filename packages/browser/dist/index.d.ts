import { AddPasskeyResult, AuthenticateResult, CreateUserWithPasskeyResult, UserIdentifier } from "@plainkey/types";

//#region src/plainKey.d.ts

/**
 * PlainKey client for the browser. Used to register new users, add passkeys to existing users, and log users in.
 *
 * Docs: https://plainkey.io/docs
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/api. Change only for development purposes.
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
   * @param userName - A stable unique identifier for the user, like an email address or username.
   * Can be empty for usernameless login.
   */
  createUserWithPasskey(userName?: string): Promise<CreateUserWithPasskeyResult>;
  /**
   * Adds a passkey to an existing user. Will require user interaction to create a passkey.
   *
   * @param userToken - The user authentication token, obtained from login.
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  addPasskey(userToken: string, userIdentifier: UserIdentifier): Promise<AddPasskeyResult>;
  /**
   * Authenticates a user. Can be used for login, verification, 2FA, etc.
   * Will require user interaction to authenticate.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  authenticate(userIdentifier: UserIdentifier): Promise<AuthenticateResult>;
}
//#endregion
export { PlainKey };
//# sourceMappingURL=index.d.ts.map