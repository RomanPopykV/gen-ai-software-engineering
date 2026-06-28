# Codebase Research — Bug #4

## Metadata

- **Folder**: `context/bugs/4/`
- **Matched to**: Bug #4 — Unauthenticated Environment Variable Disclosure Endpoint
- **Researcher stage**: Stage 1 (Bug Researcher)
- **Date**: 2026-06-16
- **Source files read**: `src/app.ts`

---

## Issue: `/debug/env` Exposes Full `process.env` and Request Headers Without Authentication

### Category

Security Vulnerability — Sensitive Information Disclosure (OWASP A02)

### Severity

High

### File & Location

`src/app.ts` — lines 20–25

```typescript
app.get("/debug/env", (req: Request, res: Response) => {
  res.json({
    env: process.env,
    headers: req.headers,
    requestId: (req as any).requestId,
  });
});
```

### Root Cause

The endpoint is registered with no authentication, no allowlist, and no environment guard. It returns:

- `process.env` — the complete set of runtime environment variables, potentially containing API keys, database credentials, tokens, and secrets
- `req.headers` — all client and proxy headers, which may expose internal routing information

Any unauthenticated HTTP client that can reach the server can read all secrets.

### Impact

- Credential and token leakage
- Full infrastructure enumeration
- Potential account and service compromise
- Compliance violations (PCI-DSS, SOC2, GDPR)
- Zero-click attack: `curl http://localhost:3000/debug/env` dumps all secrets

### Expected Fix

Remove the endpoint entirely from production code. If needed for debugging, restrict it:

```typescript
if (config.isDevelopment) {
  app.get("/debug/env", (req, res) => {
    /* ... */
  });
}
```

Or remove unconditionally.

---

## Statistics

| Metric             | Value |
| ------------------ | ----- |
| Total issues found | 1     |
| Critical           | 0     |
| High               | 1     |
| Medium             | 0     |
| Low                | 0     |
| Files analyzed     | 1     |
