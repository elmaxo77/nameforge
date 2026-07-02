# NameForge

A local-first naming engine that generates 500 pronounceable startup names, scores each one, assigns deterministic placeholder domain statuses, and supports filtering, shortlisting, notes, and CSV export.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Domain availability

`lib/domain/provider.ts` defines the provider interface. The MVP uses `PlaceholderDomainProvider`, which returns stable demo statuses without making network requests. A real registrar/RDAP provider can implement the same interface later.

## Storage

Shortlist names and notes are saved to browser `localStorage`. The rest of the app is stateless and requires no database for the MVP.
