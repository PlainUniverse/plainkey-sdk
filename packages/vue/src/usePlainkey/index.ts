import { Ref, ref } from "vue"
import { PlainKeyClient } from "@plainkey/browser"
import {
  RegistrationCompleteResponse,
  UserCredentialCompleteResponse,
  LoginCompleteResponse
} from "@plainkey/browser/"

import {
  LoginBeginRequest,
  RegistrationBeginRequest,
  UserCredentialBeginRequest
} from "@plainkey/browser/"

export type ErrorResponse = {
  error: string
}

export type usePlainKeyParams = {
  projectId: string
}

export function usePlainKey(usePlainKeyParams: usePlainKeyParams) {
  const { projectId } = usePlainKeyParams
  const plainKeyClient = new PlainKeyClient({ projectId })

  // Registration (user creation + passkey registration)
  const isRegistering = ref(false)
  const registerError: Ref<string | null> = ref(null)
  const registerSuccess = ref(false)
  const registeredCredential: Ref<RegistrationCompleteResponse["credential"] | null> = ref(null)
  const registeredResponse: Ref<RegistrationCompleteResponse | null> = ref(null)

  // Credential registration (passkey registration to existing user)
  const isAddingCredential = ref(false)
  const addCredentialError: Ref<string | null> = ref(null)
  const addCredentialSuccess = ref(false)
  const addedCredentialResponse: Ref<UserCredentialCompleteResponse | null> = ref(null)

  // Login
  const isLoggingIn = ref(false)
  const loginError: Ref<string | null> = ref(null)
  const loginSuccess = ref(false)
  const loggedInResponse: Ref<LoginCompleteResponse | null> = ref(null)

  async function register(
    beginParams: RegistrationBeginRequest
  ): Promise<RegistrationCompleteResponse | ErrorResponse> {
    try {
      isRegistering.value = true
      registerError.value = null
      registerSuccess.value = false
      registeredCredential.value = null

      const registrationResult: RegistrationCompleteResponse =
        await plainKeyClient.Registration(beginParams)

      registerSuccess.value = registrationResult.success
      registeredCredential.value = registrationResult.credential
      registeredResponse.value = registrationResult
      return registrationResult
    } catch (err) {
      registerError.value = err instanceof Error ? err.message : "Registration failed"
      return { error: registerError.value }
    } finally {
      isRegistering.value = false
    }
  }

  async function addCredential(
    beginParams: UserCredentialBeginRequest
  ): Promise<UserCredentialCompleteResponse | ErrorResponse> {
    try {
      isAddingCredential.value = true
      addCredentialError.value = null
      addCredentialSuccess.value = false
      addedCredentialResponse.value = null

      const credentialResult: UserCredentialCompleteResponse =
        await plainKeyClient.AddCredential(beginParams)

      addCredentialSuccess.value = credentialResult.success
      addedCredentialResponse.value = credentialResult
      return credentialResult
    } catch (err) {
      addCredentialError.value = err instanceof Error ? err.message : "Add credential failed"
      return { error: addCredentialError.value }
    } finally {
      isAddingCredential.value = false
    }
  }

  async function login(beginParams: LoginBeginRequest): Promise<LoginCompleteResponse> {
    try {
      isLoggingIn.value = true
      loginError.value = null
      loginSuccess.value = false
      loggedInResponse.value = null

      const loginResult: LoginCompleteResponse = await plainKeyClient.Login(beginParams)

      // Update refs
      loginSuccess.value = loginResult.verified
      loggedInResponse.value = loginResult
      return loginResult
    } catch (err) {
      loginError.value = err instanceof Error ? err.message : "Login failed"
      return {
        verified: false,
        user: { id: "" },
        token: { sessionId: "", token: "", expiresInSeconds: 0, tokenType: "", refreshToken: "" }
      }
    } finally {
      isLoggingIn.value = false
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
  }
}
