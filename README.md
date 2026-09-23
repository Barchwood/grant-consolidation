# FundMatch

FundMatch is a funding-opportunity discovery MVP with a small Node.js server.

## Run it

```bash
cp .env.example .env
npm start
```

Open http://localhost:8080. Node 18 or newer is required.

## Security and compliance status

This commit adds a defensive baseline: security headers, production HSTS, same-origin API behavior, rate limiting, bounded input, provider timeouts, safe file serving, generic errors, server-side secrets, and client-side exclusion of EIN from requests. Saved results use browser local storage and no sensitive profile is persisted server-side.

**It is not certified compliant and is not ready to claim compliance or collect regulated data.** The operator must obtain legal/privacy/security review for the actual jurisdictions and business model. See `PRIVACY.md` and `SECURITY.md` for launch requirements. Do not collect SSNs, bank credentials, transcripts, health information, immigration records, or other sensitive data in this prototype.

## Live provider integrations

1. Request a SAM.gov Assistance Listings API key and put it in `SAM_API_KEY`.
2. Review current Grants.gov API documentation at https://www.grants.gov/api/ and set `GRANTS_GOV_API_URL`.
3. Keep `.env` outside source control and restart after changing it.

The API exposes `GET /api/opportunities?path=business|school|personal&query=...` and `GET /api/health`. StudentAid.gov, USA.gov benefits, SBA resources, state programs, and private scholarship sources do not provide one universal public real-time search API; add only documented, permitted adapters with attribution and last-verified timestamps.

## Official sources

- Grants.gov: https://www.grants.gov/
- SAM.gov Assistance Listings: https://sam.gov/assistance-listings
- Federal Student Aid: https://studentaid.gov/
- USA.gov benefits: https://www.usa.gov/benefits
- SBA funding: https://www.sba.gov/funding-programs
