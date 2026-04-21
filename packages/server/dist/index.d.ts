import { PublicKeyCredentialCreationOptionsJSON as PublicKeyCredentialCreationOptionsJSON$1 } from "@simplewebauthn/browser";

//#region src/generated/api.d.ts

type GetCredential200 = {
  aaguid: string | null;
  authenticatorType: string | null;
  counter: number | null;
  createdAt: string;
  credentialBackedUp: boolean | null;
  credentialDeviceType: string | null;
  id: string;
  label: string | null;
  lastUsedAt: string | null;
  transports: string[] | null;
  updatedAt: string | null;
  userId: string;
  webAuthnId: string | null;
};
//#endregion
//#region src/types.d.ts
type UserIdentifier = {
  userId?: string;
  userName?: string;
};
type UserInfo = {
  id: string;
  userName?: string;
};
type UserUpdates = {
  userName?: string | null;
};
type ServerPasskey = GetCredential200;
type VerifyAuthenticationTokenResult = {
  success: boolean;
  data?: {
    userId: string;
  };
  error?: {
    message: string;
  };
};
type BeginPasskeyRegistrationResult = {
  /** WebAuthn creation options — pass these to your frontend to complete the passkey ceremony. */
  options: PublicKeyCredentialCreationOptionsJSON;
  /** Short-lived token — pass this to your frontend alongside the options. */
  authenticationToken: string;
};
//#endregion
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
   * Throws on non-2xx responses unless the status code is in acceptedErrorCodes.
   */
  private parseResponse;
  /**
   * Ensures a valid project access token exists, fetching a new one if needed.
   * Access tokens expire after 60 minutes. A 10 minute grace period is applied.
   */
  private ensureAccessToken;
  /**
   * Returns authenticated request headers. Automatically manages the project access token.
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
   * @param updates - Fields to update. Pass `userName: null` to clear it.
   */
  updateUser(userIdentifier: UserIdentifier, updates: UserUpdates): Promise<UserInfo>;
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
  getUserPasskeys(userId: string): Promise<ServerPasskey[]>;
  /**
   * Get a specific passkey by ID.
   *
   * @param passkeyId - The passkey ID.
   */
  getPasskey(passkeyId: string): Promise<ServerPasskey>;
  /**
   * Delete a passkey.
   *
   * @param passkeyId - The passkey ID.
   */
  deletePasskey(passkeyId: string): Promise<void>;
  /**
   * Update the label of a passkey. Pass null to clear the label.
   *
   * @param passkeyId - The passkey ID.
   * @param label - The new label, or null to clear it.
   */
  updatePasskeyLabel(passkeyId: string, label: string | null): Promise<void>;
  /**
   * Begin a passkey registration ceremony for an existing user, initiated from your backend.
   * Returns WebAuthn options and a short-lived authenticationToken — pass both to the browser
   * to complete the ceremony via the browser SDK's addPasskey().
   *
   * @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
   */
  beginPasskeyRegistration(userIdentifier: UserIdentifier): Promise<BeginPasskeyRegistrationResult>;
}
//#endregion
export { BeginPasskeyRegistrationResult, PlainKeyServer, type PublicKeyCredentialCreationOptionsJSON$1 as PublicKeyCredentialCreationOptionsJSON, ServerPasskey, UserIdentifier, UserInfo, UserUpdates, VerifyAuthenticationTokenResult };
//# sourceMappingURL=index.d.ts.map