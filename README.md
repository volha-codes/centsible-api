# Centsible API

Backend for [Centsible](https://github.com/volha-codes/centsible), a budget tracker.
Work in progress.

**Live:** https://centsible-api-22kx.onrender.com

## Stack

NestJS 11 (Fastify adapter) · Prisma · PostgreSQL (Neon) · class-validator

## Endpoints

| Method | Path            | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/accounts`     | List accounts     |
| GET    | `/accounts/:id` | Get one account   |
| POST   | `/accounts`     | Create an account |
| PATCH  | `/accounts/:id` | Update an account |
| DELETE | `/accounts/:id` | Delete an account |

An account looks like this:

```json
{
  "id": "clx...",
  "name": "Main Account",
  "currency": "PLN",
  "startingBalance": 1200
}
```

`name` must be a non-empty string, `currency` a string and `startingBalance` a number.
Invalid bodies are rejected with `400`.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in DATABASE_URL
npx prisma migrate deploy
npm run start:dev
```

The server listens on port 3000.

## Environment variables

| Name           | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                                              |
| `CORS_ORIGINS` | Allowed web origins, comma separated. Defaults to `http://localhost:5173` |
| `PORT`         | Port to listen on. Defaults to `3000`                                     |

## Deployment

Deployed on Render. Build command `npm install && npm run build`, start command
`npm run start:prod`.

## Not done yet

- Authentication: the API is open, so don't store real data in it
- Categories and transactions
- A proper `404` for unknown ids
- Upgrading Nest to v12 to pick up the latest Fastify fixes
