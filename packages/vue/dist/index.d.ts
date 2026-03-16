import * as _plainkey_browser0 from "@plainkey/browser";
import { UserIdentifier } from "@plainkey/browser";

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
  authenticate: (userIdentifier?: UserIdentifier) => Promise<_plainkey_browser0.AuthenticateResult>;
  createUserWithPasskey: (userName?: string) => Promise<_plainkey_browser0.CreateUserWithPasskeyResult>;
  addPasskey: (authenticationToken: string, userName?: string) => Promise<_plainkey_browser0.AddPasskeyResult>;
  updatePasskeyLabel: (authenticationToken: string, credentialId: string, label: string) => Promise<_plainkey_browser0.UpdatePasskeyLabelResult>;
};
//#endregion
export { usePlainKey };
//# sourceMappingURL=index.d.ts.map