# ElectionLive

**Real-time election results on a live map of Cameroon.**

Polling-station results entered by field agents (*scrutateurs*) appear **instantly** on an interactive map and in the charts of every connected browser, aggregated through the electoral hierarchy: region → department → district (*arrondissement*) → voting centre → polling station.

GIS course project, built in 2024–2025 with [James Nyemeck](https://github.com/NyemeckJames) and our project group.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django)
![Channels](https://img.shields.io/badge/Django_Channels-WebSocket-44B78B)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)

> All candidates, parties, voters and results in this repository are **fictitious**.

---

## Contents

- [Features](#features)
- [How the live update works](#how-the-live-update-works)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API overview](#api-overview)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

## Features

- **Electoral model**: regions, departments, districts, voting centres and polling stations (number of registered voters, votes, blank votes, scanned official report *procès-verbal* as PDF).
- **Administrative boundaries in PostGIS**: GADM 4.1 polygons for Cameroon's regions, departments and districts, served as GeoJSON.
- **Live choropleth map** (Leaflet): each area takes the colour of the leading candidate; clicking it shows the detailed figures.
- **Live charts**: votes per candidate and vote evolution over time, updated over WebSocket.
- **Role-based dashboards**:

  | Role | What they do |
  |---|---|
  | `ADMINISTRATEUR` | Manages users, voting centres and polling stations, consults and enters results |
  | `SCRUTATEUR` | Enters and corrects the results of the polling station they are assigned to, uploads the official report |
  | `ENROLEUR` | Registers voters |
  | `SUPERVISEUR` | Manages users |

- **Exports**: polling stations as CSV, regional results as PDF.
- **Authentication**: JWT (Simple JWT), login by email.

## How the live update works

```text
 Scrutateur ──POST /users/resultats-de-vote/──▶ Django view
                                                  │ 1. save ResultatDeVote
                                                  │ 2. recompute totals and leaders
                                                  ▼
                                    channel_layer.group_send("vote_results")
                                                  │  (Redis channel layer)
                                                  ▼
                              VoteResultsConsumer (ws://…/ws/vote-results/)
                                                  │
                         every connected browser ─┴─▶ map recolours, charts update
```

When a browser connects, the consumer first sends the results accumulated so far, then pushes each update to the whole `vote_results` group. Because the channel layer is Redis, several server processes can share the same group.

## Architecture

```text
 ┌──────────────────────────────┐
 │  Frontend_Projet_SIG         │  Next.js 15, React 19, Leaflet (react-leaflet),
 │  http://localhost:3000       │  Recharts, SCSS
 └──────────────┬───────────────┘
                │  REST (JWT) + WebSocket
 ┌──────────────▼───────────────┐
 │  Backend_Projet_SIG          │  Django 5.1, Django REST Framework, DRF-GIS,
 │  http://localhost:8000       │  Django Channels + Daphne (ASGI)
 └──────┬────────────────┬──────┘
        │                │
 ┌──────▼──────┐   ┌─────▼─────┐
 │ PostgreSQL  │   │   Redis   │  channel layer for the WebSocket groups
 │ + PostGIS   │   │           │
 └─────────────┘   └───────────┘
```

## Repository layout

```text
ElectionLive/
├── docker-compose.yml               PostGIS + Redis + Django API
├── Backend_Projet_SIG/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── backend/                     Django project (run manage.py from here)
│       ├── backend/                 Settings, ASGI app, WebSocket routing
│       ├── circonscription/         Electoral hierarchy, boundaries, exports
│       │   └── management/commands/seed_demo.py   Demo data loader
│       ├── users/                   Users and roles, results, WebSocket consumer
│       ├── cameroun.geojson                  Regions (GADM 4.1, level 1)
│       ├── cameroun-department.geojson       Departments (level 2)
│       └── data_Cameroon.json                Districts (level 3)
└── Frontend_Projet_SIG/frontend_sig/
    ├── app/HomePage/                Public live map and charts
    ├── app/Login/
    ├── app/Interfaces/              Dashboards and forms (users, centres, polling stations, results)
    └── app/components/              Map, charts, sidebar, selectors
```

## Getting started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Docker](https://docs.docker.com/get-docker/) + Compose | any recent | Runs PostGIS, Redis and the API (GDAL is installed in the image) |
| [Node.js](https://nodejs.org/) | 20 or later | For the front end |

### 1. Clone the repository

```bash
git clone https://github.com/JuveHeydene/ElectionLive.git
cd ElectionLive
```

### 2. Start the database, Redis and the API

```bash
docker compose up -d --build
```

The first build takes a few minutes (it installs GDAL). Migrations run when the container starts; the API listens on <http://localhost:8000>.

### 3. Load the demo data

```bash
docker compose exec backend python manage.py seed_demo
```

This loads the administrative boundaries, creates the Centre and Littoral regions with their departments, districts, voting centres and polling stations, four fictitious candidates and three demo accounts:

| Email | Role | Password |
|---|---|---|
| `admin@electionlive.local` | ADMINISTRATEUR | `demo1234` |
| `scrutateur@electionlive.local` | SCRUTATEUR (assigned to the first polling station) | `demo1234` |
| `enroleur@electionlive.local` | ENROLEUR | `demo1234` |

### 4. Start the front end

```bash
cd Frontend_Projet_SIG/frontend_sig
npm install
npm run dev
```

Open <http://localhost:3000> to see the live map.

### 5. See a result appear live

1. Keep the home page open in one window.
2. In another window, sign in as `scrutateur@electionlive.local` and use **Voting result → Edit office result** to enter the votes of the polling station.
3. The map and the charts of the first window update without reloading.

### Running the API without Docker

You need Python 3.11, PostgreSQL with PostGIS, Redis and the GDAL library (`sudo apt install gdal-bin` on Ubuntu; on Windows install OSGeo4W and set `GDAL_LIBRARY_PATH`).

```bash
cd Backend_Projet_SIG
python -m venv env && source env/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

## Configuration

The API reads its settings from environment variables (set in `docker-compose.yml` when using Docker):

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | development key | Django secret key, set your own outside development |
| `DJANGO_DEBUG` | `true` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated host names |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `sigproject` / `postgres` / `postgres` | Database |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Database server (Docker exposes it on host port **5434**) |
| `REDIS_HOST` / `REDIS_PORT` | `127.0.0.1` / `6379` | Redis server used by the channel layer |
| `GDAL_LIBRARY_PATH` | *(auto)* | Only if GDAL is not found automatically (Windows) |

The front end expects the API on `http://localhost:8000`.

## API overview

| Endpoint | Purpose |
|---|---|
| `POST /users/login/` | Sign in → JWT access and refresh tokens, user and role |
| `POST /users/resultats-de-vote/` | Enter a polling-station result (broadcast over WebSocket) |
| `GET /users/total_votes_per_candidate/`, `/users/get_vote_evolution/` | Totals and evolution |
| `GET /users/get_winner_by_region/`, `…_departement/`, `…_arrondissement/`, `…_centreDeVote/` | Leading candidate per area (map colours) |
| `GET /circonscription/region_units/`, `/department_units/`, `/administrative_units/` | Boundaries as GeoJSON |
| `/circonscription/voting_centers_list/`, `/voting_office_list/`, `create_new_…`, `…/update/`, `…/delete/` | Voting centres and polling stations |
| `POST /circonscription/upload_pv/<id>/` | Upload the official report (PDF) |
| `GET /circonscription/export/csv/bureaux/`, `/export/pdf/regions/` | Exports |
| `ws://localhost:8000/ws/vote-results/` | WebSocket: live results |

## Known limitations

This is the version built for the course, not a production system:

- A result is stored per polling station and candidate; a correction replaces the figures instead of keeping the history.
- The front end calls `http://localhost:8000` directly (no environment variable yet).
- The demo data covers two regions (Centre and Littoral).
- No automated tests.

## Roadmap

Ideas for a version built for election-night scale:

- **Event sourcing**: never overwrite a result; each entry or correction becomes an event, and the totals are a projection of the event log (full audit trail).
- **Horizontal WebSocket fan-out** behind a load balancer, sharing updates through Redis pub/sub.
- **Load testing** with k6 (thousands of concurrent viewers, latency of the updates).
- Front-end configuration through environment variables, CI and tests.

## Authors

**Adriel Juve SALONG** — [github.com/JuveHeydene](https://github.com/JuveHeydene)
with [James Nyemeck](https://github.com/NyemeckJames) and project group 3.
