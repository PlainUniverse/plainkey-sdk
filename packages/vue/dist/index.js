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
* const { login, createUserWithPasskey, addPasskey } = usePlainKey("projectId")
*/
function usePlainKey(projectId, baseUrl) {
	const plainKey = new PlainKey(projectId, baseUrl);
	return {
		authenticate: plainKey.authenticate.bind(plainKey),
		createUserWithPasskey: plainKey.createUserWithPasskey.bind(plainKey),
		addPasskey: plainKey.addPasskey.bind(plainKey)
	};
}

//#endregion
export { usePlainKey };
//# sourceMappingURL=index.js.map