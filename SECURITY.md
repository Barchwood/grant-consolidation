# Security readiness

## Implemented baseline

- Secrets remain in environment variables and are excluded from version control.
- API keys are never returned by the health endpoint.
- Strict security headers: CSP, frame denial, MIME sniffing protection, referrer policy, permissions policy, and production HSTS.
- Same-origin API only; no permissive CORS configuration.
- Per-client request rate limiting and query-size limits.
- Provider request timeout and generic upstream error messages.
- Path traversal protection for static files.
- No server logging of request URLs, search text, EINs, or provider credentials.
- EIN is not transmitted by the current browser flow.
- Results are inserted with `textContent` rather than trusting provider HTML.
- Sensitive data is not stored server-side in this prototype.

## Required before production

This repository is not a compliance certification. Before launch, use a qualified security/privacy professional to review applicable requirements, including privacy, consumer-finance, education, children’s-privacy, accessibility, and state/federal rules. Add an identity provider with MFA, secure HttpOnly/SameSite cookies, CSRF protection for state-changing routes, a database with envelope encryption and least-privilege access, audit logs with redaction, managed secrets, dependency/SAST/DAST scanning, backups and deletion workflows, monitoring, incident response, vendor DPAs/BAAs where applicable, consent and age handling, and a documented retention schedule.

Do not collect transcripts, SSNs, bank credentials, diagnoses, immigration documents, or precise financial data until the collection purpose, legal basis, retention, access controls, and deletion process are approved. Never call an IRS or school system using credentials without an authorized integration and contractual permission.
