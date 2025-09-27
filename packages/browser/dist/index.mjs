import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

//#region src/plainkey-client.ts
var PlainKeyClient = class {
	constructor(clientParams) {
		const { projectId, baseUrl = "https://api.plainkey.io" } = clientParams;
		this.projectId = projectId;
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}
	/**
	* Registration of a new user with passkey.
	* Creates a new user and adds a credential to it.
	*/
	async Registration(beginParams) {
		const headers = new Headers({
			"Content-Type": "application/json",
			"x-project-id": this.projectId
		});
		const beginResponse = await fetch(`${this.baseUrl}/user/register/begin`, {
			method: "POST",
			headers,
			credentials: "include",
			body: JSON.stringify(beginParams)
		});
		if (!beginResponse.ok) {
			const errorData = await beginResponse.json();
			throw new Error(errorData.error);
		}
		const { options, user } = await beginResponse.json();
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
			credentials: "include",
			body: JSON.stringify(completeParams)
		});
		if (!completeResponse.ok) {
			const errorData = await completeResponse.json();
			throw new Error(errorData.error);
		}
		const response = await completeResponse.json();
		if (!response) throw new Error("No registration response from server");
		return response;
	}
	/**
	* Add credential to existing user.
	* Requires valid user authentication token (log user in first which will set a user token cookie, then call this).
	*/
	async AddCredential(beginParams) {
		const headers = new Headers({
			"Content-Type": "application/json",
			"x-project-id": this.projectId
		});
		const beginResponse = await fetch(`${this.baseUrl}/user/credential/begin`, {
			method: "POST",
			headers,
			credentials: "include",
			body: JSON.stringify(beginParams)
		});
		if (!beginResponse.ok) {
			const errorData = await beginResponse.json();
			throw new Error(errorData.error);
		}
		const { options, user } = await beginResponse.json();
		const credential = await startRegistration({ optionsJSON: options });
		const completeParams = {
			userIdentifier: { userId: user.id },
			credential
		};
		const completeResponse = await fetch(`${this.baseUrl}/user/credential/complete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-project-id": this.projectId
			},
			credentials: "include",
			body: JSON.stringify(completeParams)
		});
		if (!completeResponse.ok) {
			const errorData = await completeResponse.json();
			throw new Error(errorData.error);
		}
		const response = await completeResponse.json();
		if (!response) throw new Error("No credential registration response from server");
		return response;
	}
	/**
	* Performs a login ceremony.
	*/
	async Login(beginParams) {
		const beginResponse = await fetch(`${this.baseUrl}/login/begin`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-project-id": this.projectId
			},
			credentials: "include",
			body: JSON.stringify(beginParams)
		});
		if (!beginResponse.ok) {
			const errorData = await beginResponse.json();
			throw new Error(errorData.error);
		}
		const beginResponseData = await beginResponse.json();
		if (!beginResponseData.options) throw new Error("No options found in login begin response");
		const authenticationResponse = await startAuthentication({ optionsJSON: beginResponseData.options });
		if (!authenticationResponse) throw new Error("No authentication response from browser");
		const completeParams = { authenticationResponse };
		const verificationResponse = await fetch(`${this.baseUrl}/login/complete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-project-id": this.projectId
			},
			credentials: "include",
			body: JSON.stringify(completeParams)
		});
		if (!verificationResponse.ok) {
			const errorData = await verificationResponse.json();
			throw new Error(errorData.error);
		}
		const verificationResponseData = await verificationResponse.json();
		if (!verificationResponseData) throw new Error("No login verification response from server");
		return verificationResponseData;
	}
};

//#endregion
export { PlainKeyClient };
//# sourceMappingURL=index.mjs.map