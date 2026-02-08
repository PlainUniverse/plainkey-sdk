import * as _plainkey_types0 from "@plainkey/types";
import { UserIdentifier } from "@plainkey/types";

//#region src/usePlainkey/index.d.ts

/**
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/browser. Change only for development purposes.
 *
 * Docs: https://plainkey.io/docs
 *
 * @example
 * const { login, createUserWithPasskey, addPasskey } = usePlainKey("projectId")
 */
declare function usePlainKey(projectId: string, baseUrl?: string): {
  authenticate: (userIdentifier?: UserIdentifier) => Promise<_plainkey_types0.AuthenticateResult>;
  createUserWithPasskey: (userName?: string) => Promise<_plainkey_types0.CreateUserWithPasskeyResult>;
  addPasskey: (authenticationToken: string) => Promise<_plainkey_types0.AddPasskeyResult>;
};
//#endregion
export { usePlainKey };
//# sourceMappingURL=index.d.ts.map