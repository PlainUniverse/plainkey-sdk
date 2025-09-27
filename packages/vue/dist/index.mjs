import { ref } from "vue";
import { PlainKeyClient } from "@plainkey/browser";

//#region src/usePlainkey/index.ts
function usePlainKey(usePlainKeyParams) {
	const { clientId } = usePlainKeyParams;
	const plainKeyClient = new PlainKeyClient({ clientId });
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
	async function register(beginParams) {
		try {
			isRegistering.value = true;
			registerError.value = null;
			registerSuccess.value = false;
			registeredCredential.value = null;
			const registrationResult = await plainKeyClient.Registration(beginParams);
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
	async function addCredential(beginParams) {
		try {
			isAddingCredential.value = true;
			addCredentialError.value = null;
			addCredentialSuccess.value = false;
			addedCredentialResponse.value = null;
			const credentialResult = await plainKeyClient.AddCredential(beginParams);
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
	async function login(beginParams) {
		try {
			isLoggingIn.value = true;
			loginError.value = null;
			loginSuccess.value = false;
			loggedInResponse.value = null;
			const loginResult = await plainKeyClient.Login(beginParams);
			loginSuccess.value = loginResult.verified;
			loggedInResponse.value = loginResult;
			return loginResult;
		} catch (err) {
			loginError.value = err instanceof Error ? err.message : "Login failed";
			return {
				verified: false,
				user: { id: "" },
				token: {
					sessionId: "",
					token: "",
					expiresInSeconds: 0,
					tokenType: "",
					refreshToken: ""
				}
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