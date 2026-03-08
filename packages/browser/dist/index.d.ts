import { AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialCreationOptionsJSON as PublicKeyCredentialCreationOptionsJSON$1, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/browser";

//#region src/types.d.ts
type UserIdentifier = {
  userId?: string;
  userName?: string;
};
type AuthenticationToken = {
  token: string;
  expiresAt: number;
};
type CredentialBasicInfo = {
  id: string;
  label: string | null;
  authenticatorType: string | null;
  userId: string;
};
interface AuthenticateResult {
  success: boolean;
  data?: {
    authenticationToken: AuthenticationToken;
  };
  error?: {
    message: string;
  };
}
interface CreateUserWithPasskeyResult {
  success: boolean;
  data?: {
    userId: string;
    credential: CredentialBasicInfo;
    authenticationToken: AuthenticationToken;
  };
  error?: {
    message: string;
  };
}
interface AddPasskeyResult {
  success: boolean;
  data?: {
    credential: CredentialBasicInfo;
    authenticationToken: AuthenticationToken;
  };
  error?: {
    message: string;
  };
}
interface UpdatePasskeyLabelResult {
  success: boolean;
  error?: {
    message: string;
  };
}
//#endregion
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
   * Throws error if status code is not 200 OK or if the response is not valid JSON.
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
   * @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param userName - A unique identifier for the user. If not provided, the user's stored userName will be used.
   */
  addPasskey(authenticationToken: string, userName?: string): Promise<AddPasskeyResult>;
  /**
   * Completes a server-initiated passkey registration. Use this when your backend has already called
   * beginCredentialRegistration() via the Server SDK (or the associated endpoint via REST API), and passed the options and
   * authenticationToken to the frontend.
   *
   * @param authenticationToken - The short-lived token returned alongside the options by beginCredentialRegistration().
   * @param options - The WebAuthn creation options returned by the server's beginCredentialRegistration().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   */
  completePasskeyRegistration(authenticationToken: string, options: PublicKeyCredentialCreationOptionsJSON$1): Promise<AddPasskeyResult>;
  /**
   * Updates a passkey label. Any passkey registered to the user can be updated.
   *
   * @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   * @param credentialId - The ID of the passkey to update, returned from createUserWithPasskey() or addPasskey().
   * @param label - The new label for the passkey.
   */
  updatePasskeyLabel(authenticationToken: string, credentialId: string, label: string): Promise<UpdatePasskeyLabelResult>;
  /**
   * Authenticates a user. Can be used for login, verification, 2FA, etc.
   * Will require user interaction to authenticate.
   *
   * @param userIdentifier - Optional. Identify the user by their PlainKey user ID or userName.
   * Not required for usernameless authentication.
   */
  authenticate(userIdentifier?: UserIdentifier): Promise<AuthenticateResult>;
}
//#endregion
export { AddPasskeyResult, AuthenticateResult, type AuthenticationResponseJSON, AuthenticationToken, CreateUserWithPasskeyResult, CredentialBasicInfo, PlainKey, type PublicKeyCredentialCreationOptionsJSON, type PublicKeyCredentialRequestOptionsJSON, type RegistrationResponseJSON, UpdatePasskeyLabelResult, UserIdentifier };
//# sourceMappingURL=index.d.ts.map