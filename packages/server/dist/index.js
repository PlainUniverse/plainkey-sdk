//#region src/plainKeyServer.ts
/**
* PlainKey server SDK. Used to verify authentication tokens and manage users and passkeys.
*
* Docs: https://plainkey.io/docs
*
* @param projectId - Your PlainKey project ID.
* @param projectSecret - Your PlainKey project secret.
* @param baseUrl - Set by default to https://api.plainkey.io/server. Change only for development purposes.
*/
var PlainKeyServer = class {
	constructor(projectId, projectSecret, baseUrl = "https://api.plainkey.io/server") {
		if (!projectId) throw new Error("Project ID is required");
		if (!projectSecret) throw new Error("Project secret is required");
		if (!baseUrl) throw new Error("Base URL is required");
		this.projectId = projectId;
		this.projectSecret = projectSecret;
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}
	/**
	* Helper to parse response JSON.
	* Throws error if status code is not 200 OK, if the response is not valid JSON.
	*/
	async parseResponse(response, acceptedErrorCodes) {
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
			if (acceptedErrorCodes && acceptedErrorCodes.includes(response.status)) return json;
			const message = json && typeof json.error === "string" ? json.error : "Unknown server error";
			throw new Error(message);
		}
		return json;
	}
	/**
	* Fetches a new access token from the server and sets it in the instance variable.
	* @returns The access token object that was set in or retreived from the instance variable.
	*/
	async ensureAccessToken() {
		const gracePeriodDate = new Date(Date.now() + 600 * 1e3);
		if (this.accessToken && this.accessToken.expires_at > gracePeriodDate) return this.accessToken;
		const response = await fetch(`${this.baseUrl}/access-token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: this.projectId,
				client_secret: this.projectSecret
			})
		});
		const responseData = await this.parseResponse(response);
		const accessToken = {
			access_token: responseData.access_token,
			expires_at: new Date(Date.now() + responseData.expires_in * 1e3)
		};
		this.accessToken = accessToken;
		return accessToken;
	}
	/**
	* Returns the default headers to use for all server API requests using the access token.
	* Includes the content type and the access token.
	* It makes sure to fetch a new access token if one is not already set.
	* @returns The default headers to use for all requests.
	*/
	async defaultRequestHeaders() {
		const accessToken = await this.ensureAccessToken();
		return new Headers({
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken.access_token}`,
			"x-project-id": this.projectId
		});
	}
	/**
	* Verifies a user authentication token.
	* Returns `{ success: true, data: { userId } }` on success, or `{ success: false, error: { message } }` on failure.
	* An invalid or expired token is a normal expected outcome. Always check `result.success` before using `result.data`.
	*
	* @param authenticationToken - The authentication token to verify, received from the user's browser after a successful passkey authentication.
	*/
	async verifyAuthenticationToken(authenticationToken) {
		const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ token: authenticationToken })
		});
		const responseData = await this.parseResponse(response, [401]);
		if (!responseData.valid) return {
			success: false,
			error: { message: responseData.error ?? "Invalid authentication token" }
		};
		return {
			success: true,
			data: { userId: responseData.userId }
		};
	}
	/**
	* Get a user by their PlainKey user ID.
	*
	* @param userId - The PlainKey user ID.
	*/
	async getUser(userId) {
		const response = await fetch(`${this.baseUrl}/user/${userId}`, {
			method: "GET",
			headers: await this.defaultRequestHeaders()
		});
		return this.parseResponse(response);
	}
	/**
	* Find a user by their userName.
	*
	* @param userName - The user's userName.
	*/
	async findUser(userName) {
		const params = new URLSearchParams({ userName });
		const response = await fetch(`${this.baseUrl}/user?${params}`, {
			method: "GET",
			headers: await this.defaultRequestHeaders()
		});
		return this.parseResponse(response);
	}
	/**
	* Create a new user.
	*
	* @param userName - A unique identifier for the user, like an email address or username. Optional for usernameless flows.
	*/
	async createUser(userName) {
		const response = await fetch(`${this.baseUrl}/user`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ userName })
		});
		return this.parseResponse(response);
	}
	/**
	* Update a user.
	*
	* @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
	* @param updates - Fields to update.
	*/
	async updateUser(userIdentifier, updates) {
		const response = await fetch(`${this.baseUrl}/user`, {
			method: "PATCH",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({
				userIdentifier,
				updates
			})
		});
		return this.parseResponse(response);
	}
	/**
	* Delete a user and all their passkeys.
	*
	* @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
	*/
	async deleteUser(userIdentifier) {
		const response = await fetch(`${this.baseUrl}/user`, {
			method: "DELETE",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ userIdentifier })
		});
		await this.parseResponse(response);
	}
	/**
	* Bulk create users. Useful for migrating existing users to PlainKey.
	*
	* @param userNames - Array of userNames to create.
	*/
	async bulkCreateUsers(userNames) {
		const response = await fetch(`${this.baseUrl}/user/bulk`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ users: userNames.map((userName) => ({ userName })) })
		});
		return this.parseResponse(response);
	}
	/**
	* Get all passkeys for a user.
	*
	* @param userId - The PlainKey user ID.
	*/
	async getUserCredentials(userId) {
		const response = await fetch(`${this.baseUrl}/user/${userId}/credentials`, {
			method: "GET",
			headers: await this.defaultRequestHeaders()
		});
		return this.parseResponse(response);
	}
	/**
	* Get a specific passkey by ID.
	*
	* @param credentialId - The passkey ID.
	*/
	async getCredential(credentialId) {
		const response = await fetch(`${this.baseUrl}/credential/${credentialId}`, {
			method: "GET",
			headers: await this.defaultRequestHeaders()
		});
		return this.parseResponse(response);
	}
	/**
	* Delete a passkey.
	*
	* @param credentialId - The passkey ID.
	*/
	async deleteCredential(credentialId) {
		const response = await fetch(`${this.baseUrl}/credential/${credentialId}`, {
			method: "DELETE",
			headers: await this.defaultRequestHeaders()
		});
		await this.parseResponse(response);
	}
	/**
	* Update the label of a passkey. Pass null to clear the label.
	*
	* @param credentialId - The passkey ID.
	* @param label - The new label, or null to clear it.
	*/
	async updateCredentialLabel(credentialId, label) {
		const response = await fetch(`${this.baseUrl}/credential/${credentialId}/label`, {
			method: "PATCH",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ label })
		});
		await this.parseResponse(response);
	}
	/**
	* Begin a passkey registration ceremony for an existing user, initiated from your backend.
	* Returns WebAuthn options and a short-lived authenticationToken. Pass both to the browser.
	* to complete the ceremony at /browser/user/credential/complete (or via the browser SDK's addPasskey()).
	*
	* @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
	*/
	async beginCredentialRegistration(userIdentifier) {
		const response = await fetch(`${this.baseUrl}/user/credential/begin`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ userIdentifier })
		});
		return this.parseResponse(response);
	}
};

//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.js.map