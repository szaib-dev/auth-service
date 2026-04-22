# Auth Service

## Requirements

- Node.js
- pnpm
- Docker
- `.env.dev` file in the project root

## Install Dependencies

```powershell
pnpm install
```

## Start Server Locally

To start the server in development mode:

```powershell
pnpm dev
```

This command runs the server with `NODE_ENV=dev`.

## Run Database on Docker Without Docker Compose

This project includes a script to start the PostgreSQL database directly with Docker.

First, make sure the Docker network exists:

```powershell
docker network create coder-gyan-network
```

If the network already exists, Docker will show an error. You can ignore it and continue.

Start the database container:

```powershell
pnpm docker:db
```

This runs PostgreSQL 17 with:

- container name: `mernpg-container`
- user: `root`
- password: `root`
- host port: `5000`
- container port: `5432`
- docker volume: `pgmern`
- docker network: `coder-gyan-network`

## Run Server on Docker Without Docker Compose

Before starting the server container, make sure:

- Docker is running
- `.env.dev` exists in the project root
- the `coder-gyan-network` Docker network exists
- the database container is running
- the `auth-service:latest` Docker image exists

Start the server container:

```powershell
pnpm docker:dev
```

This runs the auth service container with `.env.dev`, sets `NODE_ENV=dev`, connects it to `coder-gyan-network`, and maps port `5500` on your machine to port `5501` inside the container.

## Run Prisma Migration

If you want to run Prisma migration with the `.env.dev` file, set `NODE_ENV` to `dev` before running the migration command.

In PowerShell, run:

```powershell
$env:NODE_ENV="dev"; pnpm prisma migrate dev --name [name]
```

Replace `[name]` with your migration name.

Example:

```powershell
$env:NODE_ENV="dev"; pnpm prisma migrate dev --name init
```
