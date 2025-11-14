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

  // .bind() attaches the class method to the plainKey instance so it can be used as a standalone function.
  return {
    authenticate: plainKey.authenticate.bind(plainKey),
    createUserWithPasskey: plainKey.createUserWithPasskey.bind(plainKey),
    addPasskey: plainKey.addPasskey.bind(plainKey)
  }
}
