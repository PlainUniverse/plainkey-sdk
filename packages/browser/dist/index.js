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
	* Throws error if status code is not 200 OK or if the response is not valid JSON.
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
			const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({ userName })
			});
			const { userId, options } = await this.parseResponse(beginResponse);
			const credential = await startRegistration({ optionsJSON: options });
			const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({
					userId,
					credential
				})
			});
			const completeData = await this.parseResponse(completeResponse);
			if (!completeData.success) throw new Error("Server could not complete registration");
			return {
				success: true,
				data: {
					userId: completeData.userId,
					authenticationToken: completeData.authenticationToken,
					credential: completeData.credential
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
	* @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	* @param userName - A unique identifier for the user. If not provided, the user's stored userName will be used.
	*/
	async addPasskey(authenticationToken, userName) {
		if (!authenticationToken) throw new Error("Authentication token is required");
		try {
			const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({
					authenticationToken,
					userName
				})
			});
			const { options } = await this.parseResponse(beginResponse);
			const credential = await startRegistration({ optionsJSON: options });
			const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({
					authenticationToken,
					credential
				})
			});
			const completeData = await this.parseResponse(completeResponse);
			if (!completeData.success) throw new Error("Server could not complete passkey registration");
			return {
				success: true,
				data: {
					authenticationToken: completeData.authenticationToken,
					credential: completeData.credential
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
	* Completes a server-initiated passkey registration. Use this when your backend has already called
	* beginCredentialRegistration() via the Server SDK (or the associated endpoint via REST API), and passed the options and
	* authenticationToken to the frontend.
	*
	* @param authenticationToken - The short-lived token returned alongside the options by beginCredentialRegistration().
	* @param options - The WebAuthn creation options returned by the server's beginCredentialRegistration().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	*/
	async completePasskeyRegistration(authenticationToken, options) {
		if (!authenticationToken) throw new Error("Authentication token is required");
		if (!options) throw new Error("Options are required");
		try {
			const credential = await startRegistration({ optionsJSON: options });
			const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({
					authenticationToken,
					credential
				})
			});
			const completeData = await this.parseResponse(completeResponse);
			if (!completeData.success) throw new Error("Server could not complete passkey registration");
			return {
				success: true,
				data: {
					authenticationToken: completeData.authenticationToken,
					credential: completeData.credential
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
	* Updates a passkey label. Any passkey registered to the user can be updated.
	*
	* @param authenticationToken - The user authentication token, returned from .authenticate() or createUserWithPasskey().
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	* @param credentialId - The ID of the passkey to update, returned from createUserWithPasskey() or addPasskey().
	* @param label - The new label for the passkey.
	*/
	async updatePasskeyLabel(authenticationToken, credentialId, label) {
		if (!authenticationToken) throw new Error("Authentication token is required");
		if (!credentialId) throw new Error("Credential ID is required");
		try {
			const body = {
				authenticationToken,
				label
			};
			if (!(await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(body)
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
	* @param userIdentifier - Optional. Identify the user by their PlainKey user ID or userName.
	* Not required for usernameless authentication.
	*/
	async authenticate(userIdentifier) {
		try {
			const beginResponse = await fetch(`${this.baseUrl}/authenticate/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({ userIdentifier })
			});
			const beginData = await this.parseResponse(beginResponse);
			if (!beginData.options) throw new Error("Server returned no options in authentication begin response");
			const authenticationResponse = await startAuthentication({ optionsJSON: beginData.options });
			if (!authenticationResponse) throw new Error("No authentication response from browser");
			const completeResponse = await fetch(`${this.baseUrl}/authenticate/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify({
					loginSessionId: beginData.loginSession.id,
					authenticationResponse
				})
			});
			return {
				success: true,
				data: { authenticationToken: (await this.parseResponse(completeResponse)).authenticationToken }
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