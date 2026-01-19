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
	* Exchanges project credentials for a short-lived project access token.
	* This token is required to call the PlainKey Server API's.
	*/
	async accessToken() {
		const body = new URLSearchParams({
			client_id: this.projectId,
			client_secret: this.projectSecret
		});
		const response = await fetch(`${this.baseUrl}/access-token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body
		});
		return await this.parseResponse(response);
	}
	/**
	* Verifies a user authentication token.
	* If the token is valid, it returns the authenticated user's PlainKey User ID.
	* If the token is invalid, it throws an error.
	*
	* @param accessToken - The project access token (obtained from {@link PlainKeyServer.accessToken}).
	* @param params - Parameter object for the request.
	* @param params.authenticationToken - The authentication token to verify.
	* @returns An object containing the authenticated user's PlainKey User ID.
	*/
	async verifyAuthenticationToken(accessToken, params) {
		const response = await fetch(`${this.baseUrl}/authentication-token/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify(params)
		});
		const responseData = await this.parseResponse(response, [401]);
		if (!responseData.valid) throw new Error(responseData.error ?? "Invalid authentication token.");
		return { userId: responseData.user.id };
	}
};

//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.js.map