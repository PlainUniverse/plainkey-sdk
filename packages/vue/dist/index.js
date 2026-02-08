import { PlainKey } from "@plainkey/browser";

//#region src/usePlainkey/index.ts
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
function usePlainKey(projectId, baseUrl) {
	const plainKey = new PlainKey(projectId, baseUrl);
	/**
	* Authenticates a user. Can be used for login, verification, 2FA, etc.
	* Will require user interaction to authenticate.
	*
	* @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
	*/
	function authenticate(userIdentifier) {
		return plainKey.authenticate(userIdentifier);
	}
	/**
	* Registration of a new user with a passkey. Will require user interaction to create a passkey.
	*
	* @param userName - A stable unique identifier for the user, like an email address or username.
	* Can be empty for usernameless login.
	*/
	function createUserWithPasskey(userName) {
		return plainKey.createUserWithPasskey(userName);
	}
	/**
	* Adds a passkey to an existing user. Will require user interaction to create a passkey.
	*
	* @param authenticationToken - The user authentication token, is returned from .authenticate() or createUserWithPasskey().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	*/
	function addPasskey(authenticationToken) {
		return plainKey.addPasskey(authenticationToken);
	}
	return {
		authenticate,
		createUserWithPasskey,
		addPasskey
	};
}

//#endregion
export { usePlainKey };
//# sourceMappingURL=index.js.map