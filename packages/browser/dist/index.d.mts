import { AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/browser";
import { PublicUser, UserIdentifier } from "@plainkey/types";

//#region src/types/requests.d.ts
type RegistrationBeginRequest = {
  userName?: string;
  userMetadata?: Record<string, unknown>;
};
type RegistrationCompleteRequest = {
  userIdentifier: UserIdentifier;
  credential: RegistrationResponseJSON;
};
type UserCredentialBeginRequest = {
  userIdentifier: UserIdentifier;
};
type UserCredentialCompleteRequest = {
  userIdentifier: UserIdentifier;
  credential: RegistrationResponseJSON;
};
type LoginBeginRequest = {
  userIdentifier?: UserIdentifier;
};
type LoginCompleteRequest = {
  authenticationResponse: AuthenticationResponseJSON;
};
//#endregion
//#region src/types/responses.d.ts
type ErrorResponse = {
  error: string;
};
type RegistrationBeginResponse = {
  user: PublicUser;
  options: PublicKeyCredentialCreationOptionsJSON;
};
type IssuedSession = {
  sessionId: string;
  token: string;
  expiresInSeconds: number;
  tokenType: string;
  refreshToken: string;
};
type RegistrationCompleteResponse = {
  success: boolean;
  user: PublicUser;
  token: IssuedSession;
  credential: {
    id: string;
    webAuthnId: string;
  };
};
type UserCredentialBeginResponse = {
  user: PublicUser;
  options: PublicKeyCredentialCreationOptionsJSON;
};
type UserCredentialCompleteResponse = {
  success: boolean;
  user: PublicUser;
  token: IssuedSession;
  credential: {
    id: string;
    webAuthnId: string;
  };
};
type LoginBeginResponse = {
  projectId: string;
  userId?: string;
  options: PublicKeyCredentialRequestOptionsJSON;
};
type LoginCompleteResponse = {
  verified: boolean;
  user: PublicUser;
  token: IssuedSession;
};
//#endregion
//#region src/plainkey-client.d.ts
type PlainKeyClientParams = {
  projectId: string;
  baseUrl?: string;
};
declare class PlainKeyClient {
  private readonly projectId;
  private readonly baseUrl;
  constructor(clientParams: PlainKeyClientParams);
  /**
   * Registration of a new user with passkey.
   * Creates a new user and adds a credential to it.
   */
  Registration(beginParams: RegistrationBeginRequest): Promise<RegistrationCompleteResponse>;
  /**
   * Add credential to existing user.
   * Requires valid user authentication token (log user in first which will set a user token cookie, then call this).
   */
  AddCredential(beginParams: UserCredentialBeginRequest): Promise<UserCredentialCompleteResponse>;
  /**
   * Performs a login ceremony.
   */
  Login(beginParams: LoginBeginRequest): Promise<LoginCompleteResponse>;
}
//#endregion
export { ErrorResponse, IssuedSession, LoginBeginRequest, LoginBeginResponse, LoginCompleteRequest, LoginCompleteResponse, PlainKeyClient, PlainKeyClientParams, RegistrationBeginRequest, RegistrationBeginResponse, RegistrationCompleteRequest, RegistrationCompleteResponse, UserCredentialBeginRequest, UserCredentialBeginResponse, UserCredentialCompleteRequest, UserCredentialCompleteResponse };
//# sourceMappingURL=index.d.mts.map