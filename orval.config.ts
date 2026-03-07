import { defineConfig } from "orval"

export default defineConfig({
  "browser-api": {
    input: "https://api.plainkey.io/browser/openapi",
    output: {
      mode: "single",
      client: "fetch",
      target: "./packages/browser/src/generated/api.ts"
    }
  },
  "server-api": {
    input: "https://api.plainkey.io/server/openapi",
    output: {
      mode: "single",
      client: "fetch",
      target: "./packages/server/src/generated/api.ts"
    }
  }
})
