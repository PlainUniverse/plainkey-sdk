import { AuthenticationResponseJSON, AuthenticationResponseJSON as AuthenticationResponseJSON$1, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialCreationOptionsJSON as PublicKeyCredentialCreationOptionsJSON$1, PublicKeyCredentialRequestOptionsJSON, PublicKeyCredentialRequestOptionsJSON as PublicKeyCredentialRequestOptionsJSON$1, RegistrationResponseJSON, RegistrationResponseJSON as RegistrationResponseJSON$1 } from "@simplewebauthn/browser";

//#region src/common.d.ts
type UserIdentifier = {
  userId?: string;
  userName?: string;
};
type PublicUser = {
  id: string;
  userName?: string;
};
//#endregion
//#region src/browser/requests.d.ts
type RegistrationBeginRequest = {
  userName?: string;
};
type RegistrationCompleteRequest = {
  userIdentifier: UserIdentifier;
  credential: RegistrationResponseJSON$1;
};
type UserCredentialBeginRequest = {
  userIdentifier: UserIdentifier;
};
type UserCredentialCompleteRequest = {
  userIdentifier: UserIdentifier;
  credential: RegistrationResponseJSON$1;
};
type LoginBeginRequest = {
  userIdentifier?: UserIdentifier;
};
type LoginCompleteRequest = {
  authenticationResponse: AuthenticationResponseJSON$1;
};
//#endregion
//#region src/browser/responses.d.ts
type ErrorResponse = {
  error: string;
};
type IssuedToken = {
  token: string;
  expiresInSeconds: number;
  tokenType: string;
};
type IssuedSession = {
  sessionId: string;
  refreshToken: string;
};
type RegistrationBeginResponse = {
  user: PublicUser;
  options: PublicKeyCredentialCreationOptionsJSON$1;
};
type RegistrationCompleteResponse = {
  success: boolean;
  user: PublicUser;
  token: IssuedToken;
  session?: IssuedSession;
  credential: {
    id: string;
    webAuthnId: string;
  };
};
type UserCredentialBeginResponse = {
  user: PublicUser;
  options: PublicKeyCredentialCreationOptionsJSON$1;
};
type UserCredentialCompleteResponse = {
  success: boolean;
  user: PublicUser;
  token: IssuedToken;
  session?: IssuedSession;
  credential: {
    id: string;
    webAuthnId: string;
  };
};
type LoginBeginResponse = {
  projectId: string;
  userId?: string;
  options: PublicKeyCredentialRequestOptionsJSON$1;
};
type LoginCompleteResponse = {
  verified: boolean;
  user: PublicUser;
  token: IssuedToken;
  session?: IssuedSession;
};
//#endregion
export { type AuthenticationResponseJSON, ErrorResponse, IssuedSession, IssuedToken, LoginBeginRequest, LoginBeginResponse, LoginCompleteRequest, LoginCompleteResponse, type PublicKeyCredentialCreationOptionsJSON, type PublicKeyCredentialRequestOptionsJSON, PublicUser, RegistrationBeginRequest, RegistrationBeginResponse, RegistrationCompleteRequest, RegistrationCompleteResponse, type RegistrationResponseJSON, UserCredentialBeginRequest, UserCredentialBeginResponse, UserCredentialCompleteRequest, UserCredentialCompleteResponse, UserIdentifier };
//# sourceMappingURL=index.d.mts.map