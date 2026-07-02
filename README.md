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

## Storage

Shortlist names and notes are saved to browser `localStorage`. The rest of the app is stateless and requires no database for the MVP.
