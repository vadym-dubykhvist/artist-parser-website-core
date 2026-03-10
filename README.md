# Artist Hub — artist-parser-website-core

Full-stack music discovery platform. Parses artist and track data from Spotify, YouTube Music, and Apple Music. Generates short links for each platform.

**Stack:** NestJS · PostgreSQL · Next.js 15 · Docker · AWS-ready

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   docker-compose                     │
│                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────┐  │
│  │  frontend     │  │     api       │  │postgres │  │
│  │  Next.js 15   │◄─►  NestJS       │◄─►  pg:16  │  │
│  │  :3001        │  │  :3000        │  │  :5432  │  │
│  └───────────────┘  └───────────────┘  └─────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Features

- Admin adds an artist by Spotify ID → system auto-fetches all data
- Syncs top tracks from Spotify, finds matching links on YouTube Music & Apple Music
- Each track gets a short link per platform (`/s/:code` → redirect)
- Click counter on every short link
- Public pages: artist list, artist detail, track detail

---

## Quick Start

### 1. Environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
APP_PORT=

# JWT
JWT_SECRET=your-secret-here

# Admin account (auto-created on first start)
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Spotify (required)
# Get at: https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# YouTube Data API v3 (optional)
# Get at: https://console.cloud.google.com → APIs & Services → YouTube Data API v3
YOUTUBE_API_KEY=

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3001
```

### 2. Run (Docker)

```bash
# Development — hot reload for both API and frontend
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build -d
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3001 |
| API      | http://localhost:3000 |

---

## API Reference

### Auth

```
POST /auth/login
Body: { "email": "...", "password": "..." }
→ { "access_token": "..." }
```

### Artists

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/artists` | public | List all artists |
| GET | `/artists/:slug` | public | Artist + tracks |
| POST | `/artists` | admin | Add artist by Spotify ID |
| DELETE | `/artists/:id` | admin | Delete artist |

**Add artist:**
```bash
curl -X POST http://localhost:3000/artists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "spotifyId": "3TVXtAsR1Inumwj472S9r4" }'
```

### Tracks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tracks/:slug` | public | Track + short links |

### Short Links

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/s/:code` | public | Redirect to platform + increment click count |

---

## Project Structure

```
artist-parser-website-core/
├── src/
│   ├── entities/           # TypeORM entities (User, Artist, Track, ShortLink)
│   ├── auth/               # JWT auth, guards, roles
│   ├── artist/             # Artist CRUD
│   ├── track/              # Track endpoints
│   ├── short-link/         # URL shortener
│   ├── spotify/            # Spotify Web API (Client Credentials)
│   ├── youtube/            # YouTube Data API v3
│   ├── apple-music/        # iTunes Search API
│   └── music-sync/         # Orchestrates artist sync across platforms
├── frontend/               # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx                    # Artists grid
│   │   ├── artists/[slug]/page.tsx     # Artist page
│   │   └── tracks/[slug]/page.tsx      # Track page
│   ├── components/
│   │   ├── ArtistCard.tsx
│   │   └── TrackRow.tsx
│   ├── lib/api.ts          # API fetch helpers
│   ├── Dockerfile          # Production
│   └── Dockerfile.dev      # Development
├── docker-compose.yml      # Production (3 services)
├── docker-compose.dev.yml  # Development (hot reload)
└── .env.example
```

---

## Database Migrations

TypeORM auto-syncs in development (`synchronize: true`). In production use migrations:

```bash
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

---

## AWS Deployment

### Option A: EC2 + docker-compose (recommended for start)

```bash
# On EC2 (Ubuntu, Docker installed)
git clone <repo>
cd artist-parser-website-core
cp .env.example .env  # fill in production values (use RDS endpoint for DB_HOST)
docker-compose up -d
```

Use an Application Load Balancer or Nginx in front. Point `DB_HOST` to RDS endpoint.

### Option B: ECS Fargate

- Push images to ECR
- Create Task Definitions for `api` and `frontend`
- Use RDS PostgreSQL (Aurora Serverless)
- ALB → ECS Services

---

## Local Development (without Docker)

```bash
# API
npm install
npm run dev   # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:3001
```

Requires a local PostgreSQL instance with credentials matching `.env`.

---

## Tests

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end
npm run test:cov    # coverage
```

---

## License

MIT
