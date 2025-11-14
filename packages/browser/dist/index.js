import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

//#region src/plainKey.ts
/**
* PlainKey client for the browser. Used to register new users, add passkeys to existing users, and log users in.
*
* Docs: https://plainkey.io/docs
*
* @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
* @param baseUrl - Set by default to https://api.plainkey.io/api. Change only for development purposes.
*/
var PlainKey = class {
	constructor(projectId, baseUrl = "https://api.plainkey.io/api") {
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
	* @param userName - A stable unique identifier for the user, like an email address or username.
	* Can be empty for usernameless login.
	*/
	async createUserWithPasskey(userName) {
		try {
			const beginParams = { userName };
			const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(beginParams)
			});
			const { options, user } = await this.parseResponse(beginResponse);
			const credential = await startRegistration({ optionsJSON: options });
			const completeParams = {
				userIdentifier: { userId: user.id },
				credential
			};
			const completeResponse = await fetch(`${this.baseUrl}/user/register/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(completeParams)
			});
			const completeResponseData = await this.parseResponse(completeResponse);
			if (!completeResponseData.success) throw new Error("Server could not complete registration");
			return {
				success: completeResponseData.success,
				data: {
					user: completeResponseData.user,
					token: completeResponseData.token,
					credential: completeResponseData.credential,
					session: completeResponseData.session
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
	* @param userToken - The user authentication token, obtained from login.
	* Do NOT store it in local storage, database, etc. Always keep it in memory.
	*
	* @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
	*/
	async addPasskey(userToken, userIdentifier) {
		try {
			if (!userIdentifier) throw new Error("User identifier is required");
			if (!userIdentifier.userId && !userIdentifier.userName) throw new Error("Either a userId or a userName is required");
			const beginParams = {
				userToken,
				userIdentifier
			};
			const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(beginParams)
			});
			const { options, user } = await this.parseResponse(beginResponse);
			const credential = await startRegistration({ optionsJSON: options });
			const completeParams = {
				userToken: beginParams.userToken,
				userIdentifier: { userId: user.id },
				credential
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
					user: completeResponseData.user,
					token: completeResponseData.token,
					credential: completeResponseData.credential,
					session: completeResponseData.session
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
	* Logs a user in. Will require user interaction to authenticate.
	*
	* @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
	*/
	async login(userIdentifier) {
		if (!userIdentifier) throw new Error("User identifier is required");
		if (!userIdentifier.userId && !userIdentifier.userName) throw new Error("Either a userId or a userName is required");
		try {
			const beginParams = { userIdentifier };
			const beginResponse = await fetch(`${this.baseUrl}/login/begin`, {
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
			const verificationResponse = await fetch(`${this.baseUrl}/login/complete`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-project-id": this.projectId
				},
				body: JSON.stringify(completeParams)
			});
			const verificationResponseData = await this.parseResponse(verificationResponse);
			if (!verificationResponseData.verified) throw new Error("Server could not verify login");
			return {
				success: verificationResponseData.verified,
				data: {
					user: verificationResponseData.user,
					token: verificationResponseData.token,
					session: verificationResponseData.session
				}
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