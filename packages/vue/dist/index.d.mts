import { Ref } from "vue";
import { LoginBeginRequest, LoginCompleteResponse, RegistrationBeginRequest, RegistrationCompleteResponse, UserCredentialBeginRequest, UserCredentialCompleteResponse } from "@plainkey/types/";

//#region src/usePlainkey/index.d.ts
type ErrorResponse = {
  error: string;
};
type usePlainKeyParams = {
  projectId: string;
};
declare function usePlainKey(usePlainKeyParams: usePlainKeyParams): {
  register: (beginParams: RegistrationBeginRequest) => Promise<RegistrationCompleteResponse | ErrorResponse>;
  isRegistering: Ref<boolean, boolean>;
  error: Ref<string | null, string | null>;
  registerSuccess: Ref<boolean, boolean>;
  registeredCredential: Ref<any, any>;
  registeredResponse: Ref<any, any>;
  addCredential: (beginParams: UserCredentialBeginRequest) => Promise<UserCredentialCompleteResponse | ErrorResponse>;
  isAddingCredential: Ref<boolean, boolean>;
  addCredentialError: Ref<string | null, string | null>;
  addCredentialSuccess: Ref<boolean, boolean>;
  addedCredentialResponse: Ref<any, any>;
  login: (beginParams: LoginBeginRequest) => Promise<LoginCompleteResponse>;
  isLoggingIn: Ref<boolean, boolean>;
  loginError: Ref<string | null, string | null>;
  loginSuccess: Ref<boolean, boolean>;
  loggedInResponse: Ref<any, any>;
};
//#endregion
export { ErrorResponse, usePlainKey, usePlainKeyParams };
//# sourceMappingURL=index.d.mts.map