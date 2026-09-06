# 3. PostgreSQL & Docker — A Real Database Server, Anywhere

## The problem this solves

SQLite is a file. PostgreSQL is a real, standalone database *server* — the same category of technology that runs production backends at real companies. Running it normally means installing it directly on your machine, fighting version mismatches, and hoping it behaves the same way on every teammate's computer and every deployment target.

Docker removes that problem entirely: instead of installing Postgres, you run an identical, disposable copy of it in a container.

## Images vs. containers — the one distinction that matters most

An **image** is a frozen, reusable package — think of it as a recipe. `postgres:16` is an official image containing everything Postgres needs to run.

A **container** is a live, running instance created from that image — the actual dish cooked from the recipe. You can create many containers from the same image, and each runs independently.

```
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres:16
```

This one command: downloads the image (if not already present), creates a container from it, names it `taskdb`, sets a password and database name, makes it reachable on your machine's port 5432, and runs it in the background.

## Volumes — solving the "containers are disposable" problem

Containers are meant to be thrown away and recreated freely — that's a feature, not a bug, for most software. But a database *can't* lose its data every time its container gets rebuilt.

The `-v taskdata:/var/lib/postgresql/data` flag creates a **volume** — storage that lives outside the container, on your actual disk, connected into the container at that specific folder. Delete the container entirely, recreate it, and as long as the volume still exists, every row is still there.

## Docker Compose — running the whole stack with one command

A real application usually needs more than one container — this project needs both the API and the database running together. `compose.yaml` describes the entire stack in one file:

```yaml
services:
  api:
    build: .
    environment:
      DATABASE_URL: postgres://postgres:dev@db:5432/tasks
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
```

One detail that trips up almost everyone the first time: inside this network, the app reaches the database by the **service name** (`db`), not `localhost`. Compose gives every service in the file its own private network where they can find each other by name.

The `healthcheck` exists because containers *starting* isn't the same as the software inside them being *ready*. Without it, the API container can try to connect to Postgres before Postgres has actually finished initializing — a real race condition, not a hypothetical one.

## What changed in the actual API code

The SQL placeholder syntax changed from `?` (SQLite) to `$1`, `$2` (Postgres). `INSERT ... RETURNING *` became available, handing back the newly created row in the same query instead of needing a second `SELECT`. And `done` became a genuine boolean column — no more 0/1 conversion anywhere.

Every route's actual behavior — status codes, response shapes, what each endpoint does — stayed exactly the same.