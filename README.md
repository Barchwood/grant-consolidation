# FundMatch

FundMatch is a polished front-end MVP for discovering business grants and loans, scholarships and school grants, and personal assistance programs in one place.

## Run locally

No build step is required. Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080.

## Included in this MVP

- Responsive landing page and visual design system
- Three personalized discovery paths: business, education, and personal life
- Conversational onboarding modal
- Dashboard preview with match scores and deadlines
- Saved-match interaction and toast notifications
- Accessible labels, keyboard escape handling, and mobile layout

## Next production steps

Connect the onboarding forms to a secure API and a verified opportunities database. Add account authentication, source verification timestamps, document handling, eligibility rules, deadline alerts, and a real application tracker. EINs and uploaded transcripts should be encrypted, minimized, and never exposed in URLs or analytics.

FundMatch is a discovery tool; final eligibility and approval are determined by each funding provider.
