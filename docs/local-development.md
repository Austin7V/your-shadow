# Local Development Setup

This guide explains how to run Your Shadow locally.

## Prerequisites

Install Git, Bun 1.3 or newer, and Docker Desktop.

```bash
git --version
bun --version
docker --version
docker compose version
```

## Install Dependencies

From the repository root:

```bash
bun install
```

## Configure Environment Variables

Create the local API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Do not commit `apps/api/.env`.

## Start PostgreSQL

```bash
docker compose up -d
docker compose ps
```

PostgreSQL is available on local port `5433`.

To stop it:

```bash
docker compose down
```

## Run Database Migrations

```bash
bun run db:migration:run
bun run db:migration:show
```

## Start the Applications

Start the API:

```bash
cd apps/api
bun run start:dev
```

Available API URLs:

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Swagger documentation: `http://localhost:3000/docs`

Start the web application in a separate terminal:

```bash
cd apps/web
bun run dev
```

The web application is available at `http://localhost:3001`.

## Run Project Checks

Run these commands from the repository root:

```bash
bun run contracts:build
bun run contracts:typecheck
bun run lint
bun run build
bun run test
bun run test:e2e
```

## Troubleshooting

### Docker is not running

Start Docker Desktop, then run:

```bash
docker compose up -d
```

### PostgreSQL port is already in use

Your Shadow uses local port `5433`. Check that no other local service is using this port.

### API cannot connect to the database

Check the PostgreSQL container:

```bash
docker compose ps
```

Then verify that `apps/api/.env` exists and contains a valid `DATABASE_URL`.

### Migration command fails

Make sure Docker is running and the environment file exists:

```bash
docker compose up -d
bun run db:migration:run
```
