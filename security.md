# Security Review Findings

Date: 2026-05-23
Scope: Entire repository (`jjesse/nfl-stats-dashboard`)

## Critical/High Issues

### 1) DOM-based XSS risk from unescaped dynamic HTML rendering
- **Affected files:** `app.js`, `archive.html`
- **Risk:** Multiple UI render paths inserted API/data values directly into `innerHTML`. If upstream data is ever tainted, script injection could execute in users’ browsers.
- **Fix applied:** Added centralized HTML escaping and sanitized all dynamic values rendered through template strings. Updated search “no results” row to use `textContent` instead of interpolated HTML.
- **Status:** ✅ Fixed

### 2) Insecure TLS configuration in data fetch script
- **Affected file:** `scripts/fetch-data.js`
- **Risk:** `NODE_TLS_REJECT_UNAUTHORIZED=0` disabled certificate verification globally, enabling MITM attacks during data fetch jobs.
- **Fix applied:** Removed unconditional insecure TLS behavior. Added explicit opt-in via `ALLOW_INSECURE_TLS=true` for emergency troubleshooting only, with warning output.
- **Status:** ✅ Fixed

## Defense-in-Depth Improvements

### 3) Missing restrictive browser security policy headers
- **Affected file:** `_headers`
- **Risk:** Browser lacked explicit CSP and Permissions-Policy controls.
- **Fix applied:** Added `Content-Security-Policy` and `Permissions-Policy` headers for HTML responses.
- **Status:** ✅ Fixed

## Remaining Work

No additional exploitable security issues were identified that require immediate code changes in this repository after the fixes above.
