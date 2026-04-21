# PlainKey SDK - Claude Instructions

## Overview
Monorepo containing all PlainKey SDK packages. Public, customer-facing. DX is top priority — must be dead easy to use.

## Packages (`packages/`)
- `@plainkey/browser` - Browser SDK for customer frontends
- `@plainkey/server` - Server SDK for customer backends
- `@plainkey/vue` - Vue composables wrapping the browser SDK

## Tech Stack
- **Build**: tsdown (per-package)
- **Language**: TypeScript, ESM only

## Commands
- `npm run build` (in a package directory) - Build that package
- `npm run prepublishOnly` - Builds before publish

## Publishing
- All packages have `"publishConfig": { "access": "public" }`
- Only bump the version of packages that have actually changed — no need to bump all together.
- **Dependency rule:** `@plainkey/vue` depends on `@plainkey/browser`. If browser changes, bump both browser and vue, and update the `@plainkey/browser` version reference in `packages/vue/package.json`.
- `@plainkey/server` is fully independent — bump only when it has changes.
- Workflow for any changed package:
  1. Bump version in the relevant `package.json` file(s)
  2. `npm install` from monorepo root (re-wires workspace inter-package deps)
  3. Build the changed package(s): `npm run build -w @plainkey/<package>`
  4. Publish: `npm run publish:<package>` from root (e.g. `npm run publish:browser`)

## Critical Rule
Never write SDK methods, types, params, or result objects without first reading the corresponding endpoint in `plainkey-backend/src/routes/` and its associated request/response schemas in `plainkey-backend/src/schema/requests.ts` and `src/schema/responses.ts`. The SDK must exactly match what the backend expects and returns.

## orval (Type Generation)
Internal request/response types are auto-generated from the live OpenAPI specs using orval. Run `npm run generate` from the monorepo root whenever the backend API changes.

- orval fetches directly from `https://api.plainkey.io/browser/openapi` and `https://api.plainkey.io/server/openapi` — no local spec files
- Generated files live in `packages/browser/src/generated/api.ts` and `packages/server/src/generated/api.ts` — do NOT edit them manually, and do NOT re-export them from package indexes
- All types and fetch functions are bundled into a single `api.ts` per package (no separate model/ directory)
- Internal generated types must NOT leak into public API signatures
- Public-facing types live in `packages/browser/src/types.ts` and `packages/server/src/types.ts`
- `ServerCredential` is derived directly from the orval-generated `GetCredential200` type — stays in sync automatically
- `@plainkey/browser` re-exports key `@simplewebauthn/browser` types: `RegistrationResponseJSON`, `AuthenticationResponseJSON`, `PublicKeyCredentialCreationOptionsJSON`, `PublicKeyCredentialRequestOptionsJSON`

## Code Style & DX Philosophy
Always read existing code before modifying — follow established patterns closely.
Public types live in each package's `src/types.ts`, not in a shared package.
Keep public APIs minimal and intuitive. Less is more.

### Browser SDK (`@plainkey/browser`)
- Methods **never throw**. All public methods return `{ success: boolean, data?: {...}, error?: { message: string } }`.
- Errors are caught internally and returned as `{ success: false, error: { message } }`.
- This makes it easy for customers to handle errors without try/catch.

### Server SDK (`@plainkey/server`)
- Methods **throw on error** — appropriate for server-side code where the caller controls error handling.
- **Exception:** `verifyAuthenticationToken` returns `{ success: boolean, data?: { userId }, error?: { message } }` instead of throwing on an invalid token, because an invalid/expired token is a normal expected outcome (user needs to re-authenticate), not an exceptional error.
- Access token management is internal and automatic (`ensureAccessToken`). Customers never deal with tokens.
- Clean, single-purpose async methods with descriptive names.

### Both
- Every public method has a JSDoc comment explaining what it does and what each param means.
- Method signatures are self-explanatory — prefer explicit param names over option bags where possible.
- Follow the naming already established (e.g. `verifyAuthenticationToken`, not `verify` or `verifyToken`).
