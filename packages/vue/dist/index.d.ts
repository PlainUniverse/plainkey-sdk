import { PlainKey } from "@plainkey/browser";

//#region src/usePlainkey/index.d.ts

/**
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/api. Change only for development purposes.
 *
 * Docs: https://plainkey.io/docs
 *
 * @example
 * const { login, createUserWithPasskey, addPasskey } = usePlainKey2("projectId")
 */
declare function usePlainKey(projectId: string, baseUrl?: string): PlainKey;
//#endregion
export { usePlainKey };
//# sourceMappingURL=index.d.ts.map