import { LoginBeginRequest, LoginCompleteResponse, RegistrationBeginRequest, RegistrationCompleteResponse, UserCredentialBeginRequest, UserCredentialCompleteResponse } from "@plainkey/types";

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
export { PlainKeyClient, PlainKeyClientParams };
//# sourceMappingURL=index.d.mts.map