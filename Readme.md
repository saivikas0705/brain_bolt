# BrainBolt – Adaptive Infinite Quiz Platform

One question at a time; difficulty adapts from your score and streak. Live leaderboards for total score and current streak.

## Single command to run the entire stack

From the project root (where `docker-compose.yml` lives):

```bash
docker-compose up --build
```

This starts:

- **MongoDB** on port 27017  
- **Redis** on port 6379  
- **Backend API** on port 4000 (seeds questions on first run)  
- **Frontend** on port 3000  

Open **http://localhost:3000** in your browser.

---

## Run locally (without Docker)

You need **Node.js 18+**, **MongoDB**, and **Redis** available (Mongo and Redis can be local installs or run in Docker).

### Option A: Only MongoDB + Redis in Docker (easiest)

Start just the databases, then run backend and frontend on your machine:

**Terminal 1 – start Mongo + Redis**
```powershell
cd Brain_bolt
docker-compose up mongo redis
```
Leave this running. (Or run `docker-compose up -d mongo redis` to run in background.)

**Terminal 2 – backend**
```powershell
cd Brain_bolt\backend
npm install
npm run build
npm run seed
npm start
```
Backend will use `mongodb://localhost:27017/brainbolt` and `redis://localhost:6379` by default.

**Terminal 3 – frontend**
```powershell
cd Brain_bolt\Frontend
npm install
$env:NEXT_PUBLIC_API_URL="http://localhost:4000"
npm run dev
```

Open **http://localhost:3000** in your browser.

---

### Option B: Fully local (no Docker)

Install **MongoDB** and **Redis** on your machine, then:

**Terminal 1 – backend**
```powershell
cd Brain_bolt\backend
npm install
npm run build
npm run seed
npm start
```
Set env vars only if your Mongo/Redis are not on localhost:
- `$env:MONGO_URI="mongodb://localhost:27017/brainbolt"`
- `$env:REDIS_URL="redis://localhost:6379"`

**Terminal 2 – frontend**
```powershell
cd Brain_bolt\Frontend
npm install
$env:NEXT_PUBLIC_API_URL="http://localhost:4000"
npm run dev
```

Open **http://localhost:3000**.

---

### Development (backend with auto-reload)

```powershell
cd backend
npm install
npm run seed
npm run dev
```
Uses `ts-node-dev` so the API restarts on file changes. Mongo and Redis must be running.

---

## API (Backend)

- `GET /v1/quiz/next?userId=...` – Next question and current state  
- `POST /v1/quiz/answer` – Submit answer (idempotent); returns result and ranks  
- `GET /v1/quiz/metrics?userId=...` – User metrics  
- `GET /v1/leaderboard/score` – Top by total score  
- `GET /v1/leaderboard/streak` – Top by max streak  

---

## Features

- **Adaptive difficulty:** Increases after correct answers (with stabilizers to avoid ping-pong), decreases after wrong.  
- **Streak:** Resets on wrong answer; optional decay after inactivity; capped multiplier for scoring.  
- **Scoring:** Difficulty weight + streak multiplier; no negative points.  
- **Live leaderboards:** Score and streak; updated after each answer; current user rank shown.  
- **Idempotent answer submission:** Duplicate submits do not double-count.  
- **Design system:** Tokens for colors, spacing, typography, radius, shadows; light/dark mode.  
- **SSR:** Leaderboard page uses server-side fetch for initial data.  

---

## Docs

- **Low-level design:** [docs/LLD.md](docs/LLD.md) – modules, API schemas, DB, cache, adaptive and score pseudocode, leaderboard strategy.  
- **Edge cases:** [docs/EDGE_CASES.md](docs/EDGE_CASES.md) – adaptive, scoring, streak, idempotency, boundaries.  

---

## Demo video

A demo video explaining features and a walkthrough of the Frontend and Backend codebases must be placed in the **project root folder** for submission.


# Single command to build and run the entire BrainBolt stack
cd "C:\Users\Vikas\OneDrive\Desktop\Brain_bolt"; docker-compose ps; docker ps --format "table {{.Names}}\t{{.Ports}}"; Write-Host "Frontend: http://localhost:3000`nBackend: http://localhost:4000"; docker-compose logs --tail 200 --follow backend frontend

//  I WILL PASTE THE GOOGLE DRIVE LINK HERE PLEASE CHECKOUT

https://drive.google.com/file/d/14o-cW-O66Y35y7WqqTBEGbzyeDxoumjn/view?usp=drive_link
