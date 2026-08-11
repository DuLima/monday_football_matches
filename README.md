# Segundas Mágicas

Personal site tracking Monday-night friendlies between **SL Amigos do Chiti** and **Túnel do Grilo FC**.

Built with Vite + React + TypeScript + Tailwind + Recharts. Ships to GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Production build

```bash
npm run build
```

Output lands in `dist/`.

## Deploy

Push to `main` and the workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. Enable Pages in the repo settings once, set source to **GitHub Actions**.

## Data

All match, roster, and MOTM data lives in `src/data/season.ts` (typed in `src/data/types.ts`). Edit that file and redeploy to update the site. A future edit-mode UI (gated by owner email via Firebase) will replace hand-editing.
