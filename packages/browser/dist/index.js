import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

//#region src/plainKey.ts
/**
* PlainKey client for the browser. Used to register new users, add passkeys to existing users, and log users in.
*
* Docs: https://plainkey.io/docs
*
* @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
* @param baseUrl - Set by default to https://api.plainkey.io/browser. Change only for development purposes.
*/
var PlainKey = class {
	constructor(projectId, baseUrl = "https://api.plainkey.io/browser") {
		if (!projectId) throw new Error("Project ID is required");
		if (!baseUrl) throw new Error("Base URL is required");
		this.projectId = projectId;
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}
	/**
	* Helper to parse response JSON.
	* Throws error if status code is not 200 OK, if the response is not valid JSON.
	*/
	async parseResponse(response) {
		let bodyText;
		try {
			bodyText = await response.text();
		} catch {
			throw new Error("Network error while reading server response");
		}
		let json;
		try {
			json = bodyText ? JSON.parse(bodyText) : {};
		} catch {
			if (!response.ok) throw new Error("Server returned an invalid JSON error response");
			throw new Error("Invalid JSON received from server");
		}
		if (!response.ok) {
			const message = json && typeof json.error === "string" ? json.error : "Unknown server error";
			throw new Error(message);
		}
		return json;
	}
	/**
	* Registration of a new user with a passkey. Will require user interaction to create a passkey.
	*
	* @param userName - A unique identifier for the user, like an email address or username.
	* Can be empty for usernameless authentication.
	*/
	async createUserWithPasskey(userName) {
		try {
			const beginRequestBody = { userName };
			const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(beginRequestBody)
			});
			const { userId, options } = await this.parseResponse(beginResponse);
			const completeRequestBody = {
				userId,
				credential: await startRegistration({ optionsJSON: options })
			};
			const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(completeRequestBody)
			});
			const completeResponseData = await this.parseResponse(completeResponse);
			if (!completeResponseData.success) throw new Error("Server could not complete registration");
			return {
				success: completeResponseData.success,
				data: {
					userId: completeResponseData.userId,
					authenticationToken: completeResponseData.authenticationToken,
					credential: completeResponseData.credential
				}
			};
		} catch (error) {
			return {
				success: false,
				error: { message: error instanceof Error ? error.message : "Unknown error" }
			};
		}
	}
	/**
	* Adds a passkey to an existing user. Will require user interaction to create a passkey.
	*
	* @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	* @param userName - A unique identifier for the user, like an email address or username.
	* If not provided, the user's stored userName will be used.
	*/
	async addPasskey(authenticationToken, userName) {
		if (!authenticationToken) throw new Error("Authentication token is required");
		try {
			const beginParams = {
				authenticationToken,
				userName
			};
			const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(beginParams)
			});
			const { options } = await this.parseResponse(beginResponse);
			const completeParams = {
				authenticationToken,
				credential: await startRegistration({ optionsJSON: options })
			};
			const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(completeParams)
			});
			const completeResponseData = await this.parseResponse(completeResponse);
			if (!completeResponseData.success) throw new Error("Server could not complete passkey registration");
			return {
				success: completeResponseData.success,
				data: {
					authenticationToken: completeResponseData.authenticationToken,
					credential: completeResponseData.credential
				}
			};
		} catch (error) {
			return {
				success: false,
				error: { message: error instanceof Error ? error.message : "Unknown error" }
			};
		}
	}
	/**
	* Updates a passkey label. Requires authentication shortly before this call. Any passkey registered to the user can be updated.
	* @param authenticationToken - The user authentication token, is returned from .authenticate() and createUserWithPasskey().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	* @param credentialId - The ID of the passkey credential to update.
	* Is returned as "credential.id" from SDK methods that registers a passkey.
	* @param label - The new label for the passkey.
	*/
	async updatePasskeyLabel(authenticationToken, credentialId, label) {
		if (!authenticationToken) throw new Error("Authentication token is required");
		if (!credentialId) throw new Error("Credential ID is required");
		try {
			const updateLabelParams = {
				authenticationToken,
				label
			};
			if (!(await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(updateLabelParams)
			})).ok) throw new Error("Failed to update passkey label");
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: { message: error instanceof Error ? error.message : "Unknown error" }
			};
		}
	}
	/**
	* Authenticates a user. Can be used for login, verification, 2FA, etc.
	* Will require user interaction to authenticate.
	*
	* @param userIdentifier - Optional object containing either the user's PlainKey User ID or their userName.
	* Does not have to be provided for usernameless authentication.
	*/
	async authenticate(userIdentifier) {
		try {
			const beginParams = { userIdentifier };
			const beginResponse = await fetch(`${this.baseUrl}/authenticate/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(beginParams)
			});
			const beginResponseData = await this.parseResponse(beginResponse);
			if (!beginResponseData.options) throw new Error("Server returned no options in login begin response");
			const authenticationResponse = await startAuthentication({ optionsJSON: beginResponseData.options });
			if (!authenticationResponse) throw new Error("No authentication response from browser");
			const completeParams = {
				loginSessionId: beginResponseData.loginSession.id,
				authenticationResponse
			};
			const authenticateCompleteResponse = await fetch(`${this.baseUrl}/authenticate/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(completeParams)
			});
			return {
				success: true,
				data: { authenticationToken: (await this.parseResponse(authenticateCompleteResponse)).authenticationToken }
			};
		} catch (error) {
			return {
				success: false,
				error: { message: error instanceof Error ? error.message : "Unknown error" }
			};
		}
	}
};

//#endregion
export { PlainKey };
//# sourceMappingURL=index.js.map