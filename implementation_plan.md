# Implementation Plan: Secure 20-Digit Host Mode Authentication System

## Security Threat Model

### Component Overview
The Sati International application includes a "Host Mode" that permits catalog management (adding, editing, and deleting products, replacing photos, and updating price tags). Previously, Host Mode was activated via a simple URL parameter (`?host=true`) or unauthenticated local storage toggle. The user requested a 20-digit confidential passcode required to enter Host Mode, with zero client-side exposure of the password so no attacker/hacker inspecting the website code can uncover the secret.

### Entry Points and Untrusted Inputs
| Entry Point | Type | Trusted? | Validation |
|---|---|---|---|
| `POST /api/verify-host-code` | HTTP API | No (untrusted user input) | Strict 20-digit format regex (`^\d{20}$`), rate-limiting by IP, constant-time SHA-256 verification against server-side secret |
| `POST /api/verify-host-session` | HTTP API | No (session token from client) | HMAC-SHA256 signature verification, expiry check (12h TTL) |
| `POST /api/change-host-code` | HTTP API | No (current code + new code) | Strict format regex, current code re-authentication, constant-time comparison |
| UI Passcode Modal Input | Client UI Form | No (user-typed) | Numeric input filtering, length restriction (max 20 digits), auto-trim |
| URL Search Parameters (`?host=true`) | Query String | No (previously used bypass) | **REMOVED** - URL parameters can no longer activate host privileges |

### Trust Boundaries and Auth Assumptions
- **Client / Browser (Untrusted Zone)**: The browser contains only presentation logic and sends candidate passcodes to the server. The secret 20-digit passcode is NEVER bundled in client scripts (`.js`), HTML, or public assets.
- **Server Runtime (Trusted Zone)**: Express backend server (`server.ts`) securely stores and verifies the 20-digit passcode from `process.env.HOST_SECURITY_CODE` (with a secure server-side default) using constant-time crypto comparison. Issues signed, time-limited HMAC tokens upon success.
- **Session Management**: Temporary session tokens stored in client `sessionStorage` or local memory, validated against the server on startup or state restoration.

### Sensitive Data Paths
| Data Type | Source | Destination | Protection |
|---|---|---|---|
| 20-digit Host Passcode | Server Environment (`process.env.HOST_SECURITY_CODE`) | Server Memory only | Never sent to client, never logged, compared via timing-safe hash comparison |
| Candidate Passcode | User UI Form | Server API (`/api/verify-host-code`) | Sent via POST body, rate-limited, never stored in history |
| Host Session Token | Server (`crypto.randomBytes` + HMAC) | Client `sessionStorage` | Signed with server-side ephemeral secret, 12-hour expiry |

### Privileged Actions
| Action | Location | Guard |
|---|---|---|
| Enter Host Mode | Client UI / `src/App.tsx` | Requires valid server-verified session token from `POST /api/verify-host-code` |
| Add/Edit/Delete Catalog Items | Client UI & Host Modals | Gated behind active `isHostMode` backed by verified server session |
| Change Host Code | Server `/api/change-host-code` | Requires valid current 20-digit code verification |

### Priority Review Areas
1. **Zero Secret Leakage in Client Assets**: Ensure no secret code is present in Vite client build output or environment variables prefixed with `VITE_`.
2. **Brute-Force Prevention**: Implement sliding window rate-limiting on `/api/verify-host-code` (maximum 5 failed attempts per IP per 15 minutes, with cooldown).
3. **Timing Attack Resistance**: Use `crypto.timingSafeEqual` over SHA-256 hashes rather than raw string equality (`===`).
4. **Eliminate URL Bypass**: Remove `urlParams.get('host') === 'true'` completely from `src/App.tsx`.

---

## Verification Plan

### Security Verification
- **Security Scan**: Inspect all newly created and modified files (`server.ts`, `.env.example`, `src/App.tsx`, `src/components/HostAuthModal.tsx`) for common CWE vulnerabilities (CWE-259 hardcoded secrets, CWE-307 brute force, CWE-208 timing discrepancy, CWE-384 session fixation).
- **Security Audit**: Audit the implementation against the component's threat model (`## Security Threat Model`). Document all findings, dispositions, and remediations in `walkthrough.md` using the `generate-security-audit-report` skill.
- **PoC Verification**: Detail an exploit scenario in `walkthrough.md` using the `run-poc` skill demonstrating why an attacker inspecting source code or attempting automated brute-force attacks is blocked.

### Functional Verification
- **TypeScript & Linting**: Run `lint_applet` (`tsc --noEmit`) to ensure clean compilation.
- **Build Verification**: Run `compile_applet` to confirm the production build completes successfully.
- **Server Verification**: Test the Express + Vite server bootstrap on port 3000.
