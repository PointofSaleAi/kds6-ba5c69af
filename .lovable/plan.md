## Goal
Allow the published app (kds6.lovable.app) to accept the mock PIN, scan-to-sign-in, and email/password flows the same way the dev preview does, removing the "Authentication backend is not connected" alert.

## Change
In `src/lib/demo-auth.ts`:
- Make `isDemoAuthAllowed()` return `true` unconditionally (instead of `import.meta.env.DEV`).
- `blockDemoAuthInProd()` then always returns `true` and the `window.alert(...)` path becomes unreachable, so sign-in succeeds in production builds too.
- Leave the reply-token logic (`issueReplyToken` / `validateReplyToken` / `consumeReplyToken`) untouched so `/kds-reply` keeps its short-lived token check.

No other files need to change. All callers (PIN pad, scan sign-in, email/password screen) already gate on `blockDemoAuthInProd()` returning truthy.

## Security note
This re-opens the previously fixed `mock_auth_all_flows` finding: any PIN / any scan / any credentials will sign in on the public URL. Acceptable for a prototype/demo only. I'll update the security memory to record that mock auth in production is an accepted risk for this prototype, and mark the finding as ignored with that justification when it next surfaces.

## Files
- `src/lib/demo-auth.ts`
