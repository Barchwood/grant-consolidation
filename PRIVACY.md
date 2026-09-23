# FundMatch privacy notice

**Last updated: 2026-09-23**

FundMatch is currently a prototype and should not be used to submit sensitive identity, financial, education, health, immigration, or benefit records. It is a funding-opportunity discovery tool, not a lender, school, government agency, benefits administrator, or financial adviser.

## What this prototype processes

- Search text is sent to the FundMatch server only to request opportunity results.
- The optional EIN field is intentionally not sent to the server in this prototype. Do not enter an SSN, bank credentials, transcript, or other sensitive data.
- Saved opportunities are stored in the browser's local storage on the device. No account or server-side profile is currently implemented.
- Provider API credentials are server-side environment variables and are not included in browser responses.

## Security boundaries

The server applies security headers, request-size limits, basic rate limiting, input validation, provider timeouts, safe static-file resolution, and generic error responses. These are safeguards, not a certification or guarantee.

Before public production use, the operator must complete a legal and security review, establish a privacy policy and terms appropriate to its jurisdictions, sign any required vendor agreements, perform a threat model and penetration test, configure HTTPS and secret management, add authentication and encrypted storage only where necessary, establish retention/deletion and incident-response procedures, and verify every provider's terms and data-use permissions.

Do not claim HIPAA, FERPA, GLBA, COPPA, GDPR, CCPA/CPRA, or other compliance solely because this prototype has security headers. Applicability depends on the business model, data flows, users, jurisdictions, and contracts. Obtain qualified privacy counsel before collecting regulated data.

## Contact and deletion

Because accounts are not implemented, saved items can be deleted by clearing this site's local storage or browser data. A production release must provide a verified privacy contact, authenticated access/deletion/export workflows, consent records, retention periods, and a formal data-subject request process.
