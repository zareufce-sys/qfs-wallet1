# QFS Wallet

A digital wallet management dashboard with user accounts, balance control, and transaction history.

## Features

- **Login** with username & password (JWT-secured)
- **Dashboard** — credit card visual, balance, stats, recent transactions
- **Transactions** — full history with credit/debit filtering
- **Account** — update display name & password
- **Admin panel** — create accounts, adjust balances, reset passwords, delete users

## Default Admin Account

| Username | Password  |
|----------|-----------|
| `admin`  | `admin123` |

> Change this password immediately after first login via the Account page.

---

## Running the App

### 1. Start the Backend (API)

```bash
cd backend
npm install      # only needed once
node server.js
```

The API runs on **http://localhost:3001**  
Data is persisted in `backend/data.json`.

### 2. Start the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install      # only needed once
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Publish As qfslogin (Phone + Desktop)

Use this to make a public link users can open on both mobile and computer.

### 1. Get Your Domain

- Register `qfslogin.com` if available.
- If it is not available, use a subdomain like `qfslogin.yourdomain.com`.

### 2. Deploy Backend (Render or Railway)

- Deploy the `backend` folder.
- Set start command: `node server.js`
- Add environment variables:
    - `PORT=3001`
    - `JWT_SECRET=<your-long-random-secret>`
    - `CORS_ORIGINS=https://qfslogin.com,https://www.qfslogin.com,http://localhost:5173,http://localhost:4173`

Example backend env template: [backend/.env.example](backend/.env.example)

### 3. Deploy Frontend (Vercel or Netlify)

- Deploy the `frontend` folder.
- Add environment variable:
    - `VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN`

Example frontend env template: [frontend/.env.example](frontend/.env.example)

### 4. Point Domain to Frontend

- In your DNS provider, point `qfslogin.com` (and optionally `www.qfslogin.com`) to your frontend host.
- Enable HTTPS/SSL.

### 5. Final Link To Share

- Share `https://qfslogin.com` with users.
- They can log in from both phone and desktop.

### 6. Important Notes

- Do not use `admin/admin123` in production.
- Change the default admin password immediately.
- Keep your backend always running; login depends on API availability.

---

## Worldwide Access (Phone Data + Wi-Fi + PC)

Use this path if you want one link that works for everyone worldwide, not only your local network.

### Fastest Option (Single Public URL)

1. Push this repository to GitHub.
2. Create a Render account and click **New +** -> **Blueprint**.
3. Select this repo so Render reads `render.yaml`.
4. Wait for deploy, then copy your public URL from Render.
5. Share that URL with users (works on Android/iPhone/desktop, mobile data, and Wi-Fi).

### Why This Works

- The backend now serves the built frontend in production.
- You only share one HTTPS link.
- SPA routing works correctly for direct opens/refreshes.

### DNS Error You Saw (NXDOMAIN)

If you see `DNS_PROBE_FINISHED_NXDOMAIN`, the domain/hostname does not exist in DNS yet. Use your deployed Render URL first, then connect your custom domain after DNS records are configured.

---

## Project Structure

```
crypto-wallet/
├── backend/
│   ├── server.js       # Express API (auth, users, transactions)
│   ├── package.json
│   └── data.json       # Auto-created on first run (all data stored here)
│
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx   # JWT auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── Account.jsx
    │   │   └── Admin.jsx             # Admin-only
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── Sidebar.jsx
    │   ├── App.jsx                   # Routes & auth guards
    │   └── index.css                 # All styles
    └── vite.config.js                # Proxies /api → localhost:3001
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | User | Get own profile |
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user / balance |
| DELETE | `/api/users/:id` | Admin | Delete user |
| GET | `/api/transactions` | User | Get transactions |
| POST | `/api/transactions` | Admin | Add/remove funds |
