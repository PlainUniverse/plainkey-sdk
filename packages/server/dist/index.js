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
	* This token is required to call authenticated PlainKey Server APIs.
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
	*
	* @param accessToken - The project access token (obtained from {@link PlainKeyServer.accessToken}).
	* @param params - The parameters for the request.
	* @param params.token - The authentication token to verify.
	* @returns The authentication token verification response.
	*
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
		return this.parseResponse(response, [401]);
	}
};

//#endregion
export { PlainKeyServer };
//# sourceMappingURL=index.js.map