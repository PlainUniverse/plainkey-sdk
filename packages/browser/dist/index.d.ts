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
   * Requires a valid user authentication token passed in beginParams, which will be sent in the request body.
   * However, do not store the token in local storage, database, etc. Always keep it in memory.
   */
  AddCredential(beginParams: UserCredentialBeginRequest): Promise<UserCredentialCompleteResponse>;
  /**
   * Performs a login ceremony.
   */
  Login(beginParams: LoginBeginRequest): Promise<LoginCompleteResponse>;
}
//#endregion
export { PlainKeyClient, PlainKeyClientParams };
//# sourceMappingURL=index.d.ts.map