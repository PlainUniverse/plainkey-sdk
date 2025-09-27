# PlainKey SDK

TypeScript SDK for passwordless authentication using WebAuthn/passkeys.

## Packages

- **`@plainkey/browser`** - JavaScript/TypeScript Browser SDK for client-side login and registration
- **`@plainkey/server`** - JavaScript/TypeScript Server SDK for server-side-only operations (coming soon)
- **`@plainkey/shared-types`** - Shared TypeScript types across packages
- **`@plainkey/vue`** - Vue.js components (coming soon)

## Browser Package

The browser package provides:

- **PlainKeyClient** - Main client class for WebAuthn operations
- **Registration** - Create new users with passkey credentials
- **Login** - Authenticate users with existing passkeys
- **AddCredential** - Add additional passkeys to existing users
- **Type definitions** - Full TypeScript support for all API interactions
