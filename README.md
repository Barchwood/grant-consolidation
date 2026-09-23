# FundMatch

FundMatch is a front-end MVP plus a small Node.js server for discovering business funding, education aid, and personal assistance resources.

## Run it

```bash
cp .env.example .env
npm start
```

Open http://localhost:8080. Node 18 or newer is required.

## Live provider integrations

Credentials stay server-side and are never sent to the browser:

1. Create a free SAM.gov account and request an Assistance Listings API key. Put it in `SAM_API_KEY`.
2. Review the current Grants.gov API documentation at https://www.grants.gov/api/ and set the current applicant API endpoint in `GRANTS_GOV_API_URL`. Add `GRANTS_GOV_API_KEY` only if that endpoint requires it.
3. Restart the server after changing `.env`.

The server exposes:

- `GET /api/opportunities?path=business|school|personal&query=...`
- `GET /api/health`

StudentAid.gov, USA.gov benefits, SBA resources, state programs, and private scholarships do not provide one universal public real-time search API. The UI therefore links users to their official portals, while the adapter layer can be extended with approved feeds or scheduled imports. Do not scrape sites or bypass rate limits. Add each provider as a documented server-side adapter with source URL, last-verified date, terms compliance, and normalized records.

The current server returns clearly labeled demo records when live credentials are absent or a provider is unavailable. It never presents demo data as an official award or guaranteed eligibility.

## Security notes

- Never put API keys, EINs, transcripts, or sensitive personal information in client-side JavaScript, URLs, logs, or analytics.
- This prototype only uses the EIN field as optional search context; it does not verify an EIN or call the IRS.
- Production work should add authentication, encrypted storage, consent, retention/deletion controls, provider attribution, rate limiting, input validation, and a real database.

## Official source references

- Grants.gov: https://www.grants.gov/
- SAM.gov Assistance Listings: https://sam.gov/assistance-listings
- Federal Student Aid: https://studentaid.gov/
- USA.gov benefits: https://www.usa.gov/benefits
- SBA funding: https://www.sba.gov/funding-programs
