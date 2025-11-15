import { PlainKey } from "@plainkey/browser"
import { UserIdentifier } from "@plainkey/types"

/**
 *
 * @param projectId - Your PlainKey project ID. You can find it in the PlainKey admin dashboard.
 * @param baseUrl - Set by default to https://api.plainkey.io/api. Change only for development purposes.
 *
 * Docs: https://plainkey.io/docs
 *
 * @example
 * const { login, createUserWithPasskey, addPasskey } = usePlainKey("projectId")
 */
export function usePlainKey(projectId: string, baseUrl?: string) {
  const plainKey = new PlainKey(projectId, baseUrl)

  /**
   * Authenticates a user. Can be used for login, verification, 2FA, etc.
   * Will require user interaction to authenticate.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  function authenticate(userIdentifier?: UserIdentifier) {
    return plainKey.authenticate(userIdentifier)
  }

  /**
   * Registration of a new user with a passkey. Will require user interaction to create a passkey.
   *
   * @param userName - A stable unique identifier for the user, like an email address or username.
   * Can be empty for usernameless login.
   */
  function createUserWithPasskey(userName?: string) {
    return plainKey.createUserWithPasskey(userName)
  }

  /**
   * Adds a passkey to an existing user. Will require user interaction to create a passkey.
   *
   * @param userToken - The user authentication token, obtained from login.
   * Do NOT store it in local storage, database, etc. Always keep it in memory.
   *
   * @param userIdentifier - An object with either the user's PlainKey User ID or their userName.
   */
  function addPasskey(userToken: string, userIdentifier: UserIdentifier) {
    return plainKey.addPasskey(userToken, userIdentifier)
  }

  return {
    authenticate,
    createUserWithPasskey,
    addPasskey
  }
}
