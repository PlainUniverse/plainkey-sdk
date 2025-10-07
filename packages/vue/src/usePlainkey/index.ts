import { Ref, ref } from "vue"
import { PlainKeyClient } from "@plainkey/browser"
import type {
  RegistrationCompleteResponse,
  UserCredentialCompleteResponse,
  LoginCompleteResponse,
  UserIdentifier
} from "@plainkey/types"

import type {
  LoginBeginRequest,
  RegistrationBeginRequest,
  UserCredentialBeginRequest
} from "@plainkey/types"

export type ErrorResponse = {
  error: string
}

export type usePlainKeyParams = {
  projectId: string
}

export type LoginParams = {
  userIdentifier: UserIdentifier
}

export type AddCredentialParams = {
  userIdentifier: UserIdentifier
  userToken: string
}

export type RegisterParams = {
  userName?: string
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
    registerParams: RegisterParams
  ): Promise<RegistrationCompleteResponse | ErrorResponse> {
    try {
      isRegistering.value = true
      registerError.value = null
      registerSuccess.value = false
      registeredCredential.value = null

      const registrationResult: RegistrationCompleteResponse = await plainKeyClient.Registration({
        projectId,
        userName: registerParams?.userName
      } satisfies RegistrationBeginRequest)

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

  /**
   * The user must be logged in first. Pass in their user token and project ID in beginParams.
   * However, do not store the token in local storage, database, etc. Always keep it in memory.
   */
  async function addCredential(
    addCredentialParams: AddCredentialParams
  ): Promise<UserCredentialCompleteResponse | ErrorResponse> {
    try {
      isAddingCredential.value = true
      addCredentialError.value = null
      addCredentialSuccess.value = false
      addedCredentialResponse.value = null

      const credentialResult: UserCredentialCompleteResponse = await plainKeyClient.AddCredential({
        projectId,
        userIdentifier: addCredentialParams.userIdentifier,
        userToken: addCredentialParams.userToken
      } satisfies UserCredentialBeginRequest)

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

  async function login(loginParams: LoginParams): Promise<LoginCompleteResponse> {
    try {
      isLoggingIn.value = true
      loginError.value = null
      loginSuccess.value = false
      loggedInResponse.value = null

      const loginResult: LoginCompleteResponse = await plainKeyClient.Login({
        projectId,
        userIdentifier: loginParams.userIdentifier
      } satisfies LoginBeginRequest)

      // Update refs
      loginSuccess.value = loginResult.verified
      loggedInResponse.value = loginResult
      return loginResult
    } catch (err) {
      loginError.value = err instanceof Error ? err.message : "Login failed"
      return {
        verified: false,
        user: { id: "" },
        token: { token: "", expiresInSeconds: 0, tokenType: "" },
        session: undefined
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
