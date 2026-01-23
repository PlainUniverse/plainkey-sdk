//#region src/plainKeyServer.ts
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
	* If the token is valid, it returns the authenticated user's PlainKey User ID.
	*
	* @param authenticationToken - The authentication token to verify.
	* @returns On success, an object containing the authenticated user's PlainKey User ID.
	* On failure, throws an error.
	*/
	async verifyAuthenticationToken(authenticationToken) {
		const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
			method: "POST",
			headers: await this.defaultRequestHeaders(),
			body: JSON.stringify({ token: authenticationToken })
		});
		const responseData = await this.parseResponse(response, [401]);
		if (!responseData.valid) throw new Error(responseData.error ?? "Invalid authentication token.");
		return { userId: responseData.userId };
	}
};

//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.js.map