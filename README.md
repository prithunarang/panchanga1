# Panchanga — Vedic Calendar

A location-aware, astronomically calculated Hindu Panchanga and Vedic calendar. Tithi, Nakshatra, Yoga, Karana,
sunrise/sunset, Ekadashi fasting + Parana times, and a growing set of Vaishnava/Gaudiya observances are all derived
from real Sun/Moon ephemeris data (`astronomy-engine`) for the location and tradition you select — nothing is a
hardcoded date list.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion, Lucide icons
- `astronomy-engine` for Sun/Moon positions (server-side only, in `src/app/api/panchanga/route.ts`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run the production build locally (after `build`)
- `npm run lint` — ESLint

## Architecture

- `src/lib/astronomy.ts` — the only file that talks to the ephemeris (Sun/Moon longitudes, sunrise/sunset,
  ayanamsa). Swappable for Swiss Ephemeris or another engine without touching anything downstream.
- `src/lib/panchanga/calculator.ts` — turns raw astronomy into a day's Tithi/Nakshatra/Yoga/Karana/Masa.
- `src/lib/festivals/` — the festival rule engine. `rules.ts` holds fixed-tithi observances; `ekadashi.ts` holds
  the Ekadashi-specific engine (including the kshaya/vriddhi exception handling and Parana timing).
- `src/app/api/panchanga/route.ts` — the one server endpoint the UI calls; all astronomy runs here, never in the
  client bundle.

No API keys or environment variables are required — everything is computed locally from the requested
latitude/longitude/timezone.

## Deploying

This is a standard Next.js app with one dynamic API route and no external services or secrets, so it deploys
anywhere Next.js runs:

**Vercel (recommended, zero config):**

```bash
npx vercel
```

or connect the repo at [vercel.com/new](https://vercel.com/new).

**Any Node host (self-managed):**

```bash
npm install
npm run build
npm run start   # serves on $PORT, default 3000
```

**Docker:** use Vercel's official [Next.js standalone Dockerfile guide](https://nextjs.org/docs/app/building-your-application/deploying#docker-image) if containerizing.

There is nothing environment-specific to configure — the app has no database, no auth, and no third-party API
keys.
