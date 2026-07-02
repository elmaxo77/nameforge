# NameForge

A local-first naming engine that generates 500 pronounceable startup names, scores each one, checks domains through live public RDAP services, and supports filtering, shortlisting, notes, and CSV export.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Domain availability

The server uses IANA's RDAP bootstrap registry to discover the authoritative service for each extension. A `200` response means registered, `404` means no registration record, and rate limits or inconclusive responses remain `unknown`. Checks are limited to 25 domains per request to respect public registry infrastructure.

After verification, registered domains are enriched with their public homepage title or meta description. Available names are matched against Wikipedia's public search endpoint for a short, one-line context description. Website requests have strict timeouts and private-network protections.

Main results compare every selected extension at once. Available domains appear green; registered domains appear red and link to the live site. Every registered domain gets its own one-line homepage description, ordered with `.ai` first for AI briefs, `.io` first for fintech briefs, and `.com` first otherwise. Wikipedia is used only when every selected domain is available. Name exploration lives exclusively in the Forge workshop.

Starred names enter a persistent Name Workshop. Each workshop session can generate eight scored variants with live domain checks, preserve the current name length by default or target 3–12 letters with a stepper, highlight variants with at least one available selected extension, follow a chosen variant into another generation, and step backward through its independent history.

## Storage

Shortlist names and notes are saved to browser `localStorage`. The rest of the app is stateless and requires no database for the MVP.
