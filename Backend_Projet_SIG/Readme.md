# ElectionLive — back end

Django 5.1 + Django REST Framework + Django Channels API, with PostgreSQL/PostGIS and Redis.

The setup (Docker or manual), the demo data and the configuration are described in the [main README](../README.md#getting-started).

Quick reference (from `Backend_Projet_SIG/backend/`):

```bash
python manage.py migrate      # create the tables
python manage.py seed_demo    # boundaries, electoral hierarchy, candidates, demo accounts
python manage.py runserver    # HTTP + WebSocket (Daphne) on http://localhost:8000
```
