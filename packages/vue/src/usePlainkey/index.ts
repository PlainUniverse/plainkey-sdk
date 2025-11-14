import { PlainKey } from "@plainkey/browser"

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
  return new PlainKey(projectId, baseUrl)
}
