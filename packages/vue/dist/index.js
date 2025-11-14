import { PlainKey } from "@plainkey/browser";

//#region src/usePlainkey/index.ts
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
function usePlainKey(projectId, baseUrl) {
	return new PlainKey(projectId, baseUrl);
}

//#endregion
export { usePlainKey };
//# sourceMappingURL=index.js.map