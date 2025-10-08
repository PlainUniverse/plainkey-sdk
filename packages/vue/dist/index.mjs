import { ref } from "vue";
import { PlainKeyClient } from "@plainkey/browser";

//#region src/usePlainkey/index.ts
function usePlainKey(usePlainKeyParams) {
	const { projectId } = usePlainKeyParams;
	const plainKeyClient = new PlainKeyClient({ projectId });
	const isRegistering = ref(false);
	const registerError = ref(null);
	const registerSuccess = ref(false);
	const registeredCredential = ref(null);
	const registeredResponse = ref(null);
	const isAddingCredential = ref(false);
	const addCredentialError = ref(null);
	const addCredentialSuccess = ref(false);
	const addedCredentialResponse = ref(null);
	const isLoggingIn = ref(false);
	const loginError = ref(null);
	const loginSuccess = ref(false);
	const loggedInResponse = ref(null);
	async function register(registerParams) {
		try {
			isRegistering.value = true;
			registerError.value = null;
			registerSuccess.value = false;
			registeredCredential.value = null;
			const registrationResult = await plainKeyClient.Registration({ userName: registerParams?.userName });
			registerSuccess.value = registrationResult.success;
			registeredCredential.value = registrationResult.credential;
			registeredResponse.value = registrationResult;
			return registrationResult;
		} catch (err) {
			registerError.value = err instanceof Error ? err.message : "Registration failed";
			return { error: registerError.value };
		} finally {
			isRegistering.value = false;
		}
	}
	/**
	* The user must be logged in first. Pass in their user token and project ID in beginParams.
	* However, do not store the token in local storage, database, etc. Always keep it in memory.
	*/
	async function addCredential(addCredentialParams) {
		try {
			isAddingCredential.value = true;
			addCredentialError.value = null;
			addCredentialSuccess.value = false;
			addedCredentialResponse.value = null;
			const credentialResult = await plainKeyClient.AddCredential({
				userIdentifier: addCredentialParams.userIdentifier,
				userToken: addCredentialParams.userToken
			});
			addCredentialSuccess.value = credentialResult.success;
			addedCredentialResponse.value = credentialResult;
			return credentialResult;
		} catch (err) {
			addCredentialError.value = err instanceof Error ? err.message : "Add credential failed";
			return { error: addCredentialError.value };
		} finally {
			isAddingCredential.value = false;
		}
	}
	async function login(loginParams) {
		try {
			isLoggingIn.value = true;
			loginError.value = null;
			loginSuccess.value = false;
			loggedInResponse.value = null;
			const loginResult = await plainKeyClient.Login({ userIdentifier: loginParams.userIdentifier });
			loginSuccess.value = loginResult.verified;
			loggedInResponse.value = loginResult;
			return loginResult;
		} catch (err) {
			loginError.value = err instanceof Error ? err.message : "Login failed";
			return {
				verified: false,
				user: { id: "" },
				token: {
					token: "",
					expiresInSeconds: 0,
					tokenType: ""
				},
				session: void 0
			};
		} finally {
			isLoggingIn.value = false;
		}
	}
	return {
		register,
		isRegistering,
		error: registerError,
		registerSuccess,
		registeredCredential,
		registeredResponse,
		addCredential,
		isAddingCredential,
		addCredentialError,
		addCredentialSuccess,
		addedCredentialResponse,
		login,
		isLoggingIn,
		loginError,
		loginSuccess,
		loggedInResponse
	};
}

//#endregion
export { usePlainKey };
//# sourceMappingURL=index.mjs.map