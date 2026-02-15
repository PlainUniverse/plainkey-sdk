import { AuthenticationResponseJSON, AuthenticationResponseJSON as AuthenticationResponseJSON$1, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialCreationOptionsJSON as PublicKeyCredentialCreationOptionsJSON$1, PublicKeyCredentialRequestOptionsJSON, PublicKeyCredentialRequestOptionsJSON as PublicKeyCredentialRequestOptionsJSON$1, RegistrationResponseJSON, RegistrationResponseJSON as RegistrationResponseJSON$1 } from "@simplewebauthn/browser";

//#region src/common.d.ts
type UserIdentifier = {
  userId?: string;
  userName?: string;
};
type UserInfo = {
  id: string;
  userName?: string;
};
//#endregion
//#region src/browser/requests.d.ts
type UserRegisterBeginRequest = {
  userName?: string;
};
type UserRegisterCompleteRequest = {
  userId: string;
  credential: RegistrationResponseJSON$1;
};
type UserCredentialBeginRequest = {
  authenticationToken: string;
  userName?: string;
};
type UserCredentialCompleteRequest = {
  authenticationToken: string;
  credential: RegistrationResponseJSON$1;
};
type CredentialLabelUpdateRequest = {
  authenticationToken: string;
  label: string;
};
type LoginBeginRequest = {
  userIdentifier?: UserIdentifier;
};
type LoginCompleteRequest = {
  loginSessionId: string;
  authenticationResponse: AuthenticationResponseJSON$1;
};
//#endregion
//#region src/browser/responses.d.ts
type ErrorResponse = {
  error: string;
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
type UserRegisterBeginResponse = {
  userId: string;
  options: PublicKeyCredentialCreationOptionsJSON$1;
};
type UserRegisterCompleteResponse = {
  success: boolean;
  userId: string;
  authenticationToken: AuthenticationToken;
  credential: CredentialBasicInfo;
};
type UserCredentialBeginResponse = {
  options: PublicKeyCredentialCreationOptionsJSON$1;
};
type UserCredentialCompleteResponse = {
  success: boolean;
  authenticationToken: AuthenticationToken;
  credential: CredentialBasicInfo;
};
type AuthenticationBeginResponse = {
  projectId: string;
  options: PublicKeyCredentialRequestOptionsJSON$1;
  loginSession: {
    id: string;
    expiresAt: string;
  };
};
type AuthenticationCompleteResponse = {
  authenticationToken: AuthenticationToken;
};
//#endregion
//#region src/browser/result.d.ts
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
//#region src/server/requests.d.ts
type VerifyAuthTokenRequest = {
  token: string;
};
//#endregion
//#region src/server/responses.d.ts
type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
type VerifyAuthenticationTokenResponse = {
  valid: boolean;
  error: string;
  expiresAt: string;
  projectId: string;
  userId: string;
  payload: Record<string, unknown>;
};
//#endregion
//#region src/server/result.d.ts
type VerifyAuthenticationTokenResult = {
  userId: string;
};
//#endregion
export { AccessTokenResponse, AddPasskeyResult, AuthenticateResult, AuthenticationBeginResponse, AuthenticationCompleteResponse, type AuthenticationResponseJSON, AuthenticationToken, CreateUserWithPasskeyResult, CredentialBasicInfo, CredentialLabelUpdateRequest, ErrorResponse, LoginBeginRequest, LoginCompleteRequest, type PublicKeyCredentialCreationOptionsJSON, type PublicKeyCredentialRequestOptionsJSON, type RegistrationResponseJSON, UpdatePasskeyLabelResult, UserCredentialBeginRequest, UserCredentialBeginResponse, UserCredentialCompleteRequest, UserCredentialCompleteResponse, UserIdentifier, UserInfo, UserRegisterBeginRequest, UserRegisterBeginResponse, UserRegisterCompleteRequest, UserRegisterCompleteResponse, VerifyAuthTokenRequest, VerifyAuthenticationTokenResponse, VerifyAuthenticationTokenResult };
//# sourceMappingURL=index.d.ts.map