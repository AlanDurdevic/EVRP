# Informations

- Domain: nlukic.com
- Frontend: evrp.nlukic.com
- Backend API: evrp-api.nlukic.com
- VPS: Hetzner
- Repo: <https://github.com/AlanDurdevic/EVRP> (branch: fullstack)

# Architecture

Both subdomains point to the same VPS IP. Caddy handles TLS automatically for both.
Docker Compose runs two containers, built directly on the VPS:

```
frontend → evrp.nlukic.com     → serves React static files
         → evrp-api.nlukic.com → reverse proxies to backend (internal only)

backend  → Spring app on port 8080, NOT exposed to the internet
```

Key files at project root:

- `Caddyfile` — single config for both subdomains, baked into the frontend image at build time
- `docker-compose.yml` — builds both images on the VPS and runs them
- `frontend/Dockerfile` — built from project root context: `docker build -f frontend/Dockerfile .`
- `backend/Dockerfile` — built from backend context: `docker build ./backend`

# Deploy

```bash
# First time
git clone https://github.com/AlanDurdevic/EVRP.git -b fullstack /opt/evrp
cd /opt/evrp
# create backend/.env (see backend/.env.example)
docker compose up --build -d

# Updates
cd /opt/evrp
git pull
docker compose up --build -d
```

# Go-Live Checklist

## Phase 0 — Local prep (before touching the VPS)

- [x] Write `Dockerfile` for Spring backend
- [x] Write multi-stage `Dockerfile` for React frontend (Node builds → Caddy serves)
- [x] Write `docker-compose.yml` with `frontend` and `backend` services
- [x] Write `Caddyfile` for `evrp.nlukic.com` and `evrp-api.nlukic.com`
- [x] Verify both images build and run locally with `docker compose up --build`

## Phase 1 — VPS setup

- [ ] Install Docker + Docker Compose plugin on Hetzner VPS
- [x] Configure UFW firewall: allow 22, 80, 443 — deny everything else
- [ ] Clone repo: `git clone https://github.com/AlanDurdevic/EVRP.git -b fullstack /opt/evrp`
- [ ] Create `/opt/evrp/backend/.env` from `backend/.env.example`:

  ```
  APP_USERNAME=...
  APP_PASSWORD=...
  CORS_ORIGIN=https://evrp.nlukic.com
  ```

## Phase 2 — DNS (must be done before first deploy)

- [x] Add A record: `evrp.nlukic.com` → VPS IP
- [x] Add A record: `evrp-api.nlukic.com` → VPS IP
- [x] Wait for propagation (`dig evrp.nlukic.com` to verify)

## Phase 3 — First deploy

- [ ] `cd /opt/evrp && docker compose up --build -d`
- [ ] Confirm containers are up: `docker compose ps`
- [ ] Confirm Caddy provisioned TLS for both subdomains
- [ ] Smoke test `evrp-api.nlukic.com` (API responds)
- [ ] Smoke test `evrp.nlukic.com` (React app loads)
- [ ] End-to-end test
