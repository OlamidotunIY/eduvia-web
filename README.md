# Eduvia Web

## Local domain development

Eduvia web runs locally with the same hostname used in production: `app.eduvia.name.ng`.

Open an elevated PowerShell once and run:

```powershell
cd E:\Projects\Eduvia\eduvia-web
pwsh -File scripts\setup-local-domain.ps1
```

The script maps `app.eduvia.name.ng` and `api.eduvia.name.ng` to `127.0.0.1`, creates a trusted local certificate using `mkcert`, and leaves certificate files untracked.

Then start the app:

```powershell
pnpm dev:domain
```

Open [https://app.eduvia.name.ng:5173](https://app.eduvia.name.ng:5173). Vite reads API and Socket origins from `.env.development`; production values belong in `.env.production` based on `.env.production.example`.
