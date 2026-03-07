# PlainKey SDK - Claude Instructions

## Overview
Monorepo containing all PlainKey SDK packages. Public, customer-facing. DX is top priority — must be dead easy to use.

## Packages (`packages/`)
- `@plainkey/browser` - Browser SDK for customer frontends
- `@plainkey/server` - Server SDK for customer backends
- `@plainkey/types` - Shared TypeScript types (used by both browser and server packages)
- `@plainkey/vue` - Vue composables wrapping the browser SDK

## Tech Stack
- **Build**: tsdown (per-package)
- **Language**: TypeScript, ESM only

## Commands
- `npm run build` (in a package directory) - Build that package
- `npm run prepublishOnly` - Builds before publish

## Publishing
- All packages have `"publishConfig": { "access": "public" }`
- All packages are always published together at the same version, even if a package has no changes. Keeps things simple.
- After finishing work on the SDK, always bump the version in all package.json files (browser, server, types, vue), then run `npm install` from the monorepo root (it's a workspace — this wires up inter-package dependencies), then `npm run build` to rebuild all in the correct order.

## Critical Rule
Never write SDK methods, types, params, or result objects without first reading the corresponding endpoint in `plainkey-backend/src/routes/` and its associated request/response schemas in `plainkey-backend/src/schema/requests.ts` and `src/schema/responses.ts`. The SDK must exactly match what the backend expects and returns.

## Code Style & DX Philosophy
Always read existing code before modifying — follow established patterns closely.
Types live in `@plainkey/types`, not in individual SDK packages.
Keep public APIs minimal and intuitive. Less is more.

### Browser SDK (`@plainkey/browser`)
- Methods **never throw**. All public methods return `{ success: boolean, data?: {...}, error?: { message: string } }`.
- Errors are caught internally and returned as `{ success: false, error: { message } }`.
- This makes it easy for customers to handle errors without try/catch.

### Server SDK (`@plainkey/server`)
- Methods **throw on error** — appropriate for server-side code where the caller controls error handling.
- **Exception:** `verifyAuthenticationToken` returns `{ valid: boolean, userId?: string, error?: string }` instead of throwing on an invalid token, because an invalid/expired token is a normal expected outcome (user needs to re-authenticate), not an exceptional error.
- Access token management is internal and automatic (`ensureAccessToken`). Customers never deal with tokens.
- Clean, single-purpose async methods with descriptive names.

### Both
- Every public method has a JSDoc comment explaining what it does and what each param means.
- Method signatures are self-explanatory — prefer explicit param names over option bags where possible.
- Follow the naming already established (e.g. `verifyAuthenticationToken`, not `verify` or `verifyToken`).
