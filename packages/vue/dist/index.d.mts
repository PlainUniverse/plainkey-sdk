import { Ref } from "vue";
import { LoginBeginRequest, LoginCompleteResponse, RegistrationBeginRequest, RegistrationCompleteResponse, UserCredentialBeginRequest, UserCredentialCompleteResponse } from "@plainkey/browser/";

//#region src/usePlainkey/index.d.ts
type ErrorResponse = {
  error: string;
};
type usePlainKeyParams = {
  clientId: string;
};
declare function usePlainKey(usePlainKeyParams: usePlainKeyParams): {
  register: (beginParams: RegistrationBeginRequest) => Promise<RegistrationCompleteResponse | ErrorResponse>;
  isRegistering: Ref<boolean, boolean>;
  error: Ref<string | null, string | null>;
  registerSuccess: Ref<boolean, boolean>;
  registeredCredential: Ref<{
    id: string;
    webAuthnId: string;
  } | null, {
    id: string;
    webAuthnId: string;
  } | null>;
  registeredResponse: Ref<RegistrationCompleteResponse | null, RegistrationCompleteResponse | null>;
  addCredential: (beginParams: UserCredentialBeginRequest) => Promise<UserCredentialCompleteResponse | ErrorResponse>;
  isAddingCredential: Ref<boolean, boolean>;
  addCredentialError: Ref<string | null, string | null>;
  addCredentialSuccess: Ref<boolean, boolean>;
  addedCredentialResponse: Ref<UserCredentialCompleteResponse | null, UserCredentialCompleteResponse | null>;
  login: (beginParams: LoginBeginRequest) => Promise<LoginCompleteResponse>;
  isLoggingIn: Ref<boolean, boolean>;
  loginError: Ref<string | null, string | null>;
  loginSuccess: Ref<boolean, boolean>;
  loggedInResponse: Ref<LoginCompleteResponse | null, LoginCompleteResponse | null>;
};
//#endregion
export { ErrorResponse, usePlainKey, usePlainKeyParams };
//# sourceMappingURL=index.d.mts.map