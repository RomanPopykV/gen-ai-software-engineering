# Bug #4: Unauthenticated Environment Variable Disclosure Endpoint

## Location

File: src/app.ts
Route: GET /debug/env

## Severity

High - Sensitive information disclosure

## Description

A debug endpoint was exposed without authentication and returns full process environment variables and incoming request headers. This can leak secrets such as API keys, database credentials, tokens, internal hostnames, and deployment metadata.

## Current Buggy Behavior

The endpoint responds with:

- env: complete process.env object
- headers: all request headers
- requestId

Because no authentication or allowlist is applied, any client that can reach the API can read sensitive runtime values.

## Why This Is a Security Issue

Environment variables often contain secrets. Exposing them publicly enables attackers to:

- Steal credentials and tokens
- Pivot into other systems
- Enumerate infrastructure and internal configuration
- Abuse third-party services using leaked keys

## Reproduction Steps

1. Start the API server.
2. Send: curl http://localhost:3000/debug/env
3. Observe sensitive fields in response (for example variables ending with KEY, TOKEN, SECRET, PASSWORD).

## Impact

- Credential leakage
- Account and service compromise risk
- Potential compliance violations
- Increased blast radius if one service is exposed

## Expected Fix

- Remove the endpoint in production code.
- If debugging is required, gate access behind strict authentication and role checks.
- Never return raw process.env; return a minimal safe subset only.
- Redact sensitive keys by denylist/allowlist before returning any diagnostics.

## Safe Alternative

Create an internal-only health/debug endpoint that returns only non-sensitive metadata such as:

- application version
- uptime
- git commit SHA
- sanitized environment name
