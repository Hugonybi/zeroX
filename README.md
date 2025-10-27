# zeroX Marketplace Frontend

React + Vite single-page application for the Hedera-backed art marketplace. The UI consumes the NestJS backend in `backend/` for live artworks, checkout, and artist workflows.

## Prerequisites

- Node.js 20+
- pnpm or npm (examples use npm)
- Running backend API (`npm run start:dev` inside `backend/`) exposed on `http://localhost:4000`

## Environment Variables

Create a `.env` file at the repository root using `.env.example` as a template:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the NestJS API (defaults to `http://localhost:4000`). |
| `VITE_USE_MOCK_ARTWORKS` | When set to `true`, the gallery falls back to bundled mock data if the API is unreachable. |

## Development

```bash
npm install
npm run dev
```

The command starts the Vite dev server with HMR. Ensure the backend is running so API calls succeed.

## Building for Production

```bash
npm run build
npm run preview
```

`npm run build` transpiles the SPA and outputs static assets under `dist/`. `npm run preview` serves the production build locally for smoke testing.

## Linting

```bash
npm run lint
```

Runs ESLint across the frontend source tree using the configuration in `eslint.config.js`.
