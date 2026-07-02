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

Taken domains can be explored for close available alternatives. The engine tries letter reshuffles first, then small pronounceable insertions, substitutions, and endings, checking at most 40 variants through RDAP. When found, the available alternative replaces the taken candidate directly in its result row.

## Storage

Shortlist names and notes are saved to browser `localStorage`. The rest of the app is stateless and requires no database for the MVP.
