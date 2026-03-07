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
	* Throws on non-2xx responses unless the status code is in acceptedErrorCodes.
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
	* Ensures a valid project access token exists, fetching a new one if needed.
	* Access tokens expire after 60 minutes. A 10 minute grace period is applied.
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
		const data = await this.parseResponse(response);
		this.accessToken = {
			access_token: data.access_token,
			expires_at: new Date(Date.now() + data.expires_in * 1e3)
		};
		return this.accessToken;
	}
	/**
	* Returns authenticated request headers. Automatically manages the project access token.
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
		const data = await this.parseResponse(response, [401]);
		if (!data.valid) return {
			success: false,
			error: { message: data.error ?? "Invalid authentication token" }
		};
		return {
			success: true,
			data: { userId: data.userId }
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
	* @param updates - Fields to update. Pass `userName: null` to clear it.
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
	* Returns WebAuthn options and a short-lived authenticationToken — pass both to the browser
	* to complete the ceremony via the browser SDK's addPasskey().
	*
	* @param userIdentifier - Identify the user by either their PlainKey user ID or userName.
	*/
	async beginCredentialRegistration(userIdentifier) {
		const response = await fetch(`${this.baseUrl}/user/credential/begin`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ userIdentifier })
		});
		const data = await this.parseResponse(response);
		return {
			options: data.options,
			authenticationToken: data.authenticationToken
		};
	}
};

//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.js.map