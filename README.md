# Centsible API

Backend for [Centsible](https://github.com/volha-codes/centsible), a budget tracker.
Work in progress.

**Live:** https://centsible-api-22kx.onrender.com

## Stack

NestJS 11 (Fastify adapter) · Prisma · PostgreSQL (Neon) · class-validator · argon2

## Authentication

Users sign up with an email, a first name and a password. Passwords are hashed with
argon2id. Signing in returns a JWT valid for 7 days, stored in an `httpOnly` cookie
named `access_token` (`SameSite=Lax`, `Secure` in production).

A global guard protects every route by default; routes that need to be open are
marked with `@Public()`. Accounts and categories belong to the signed-in user, and
other users' records answer `404`.

## Endpoints

| Method | Path              | Auth | Description                            |
| ------ | ----------------- | ---- | -------------------------------------- |
| POST   | `/auth/register`  | no   | Create a user, sign in, set the cookie |
| POST   | `/auth/login`     | no   | Sign in, set the cookie                |
| POST   | `/auth/logout`    | no   | Clear the cookie                       |
| GET    | `/auth/me`        | yes  | The signed-in user                     |
| GET    | `/accounts`       | yes  | List your accounts                     |
| GET    | `/accounts/:id`   | yes  | Get one account                        |
| POST   | `/accounts`       | yes  | Create an account                      |
| PATCH  | `/accounts/:id`   | yes  | Update an account                      |
| DELETE | `/accounts/:id`   | yes  | Delete an account                      |
| GET    | `/categories`     | yes  | List your categories                   |
| GET    | `/categories/:id` | yes  | Get one category                       |
| POST   | `/categories`     | yes  | Create a category                      |
| PATCH  | `/categories/:id` | yes  | Update a category                      |
| DELETE | `/categories/:id` | yes  | Delete a category                      |

An account and a category look like this:

```json
{
  "id": "clx...",
  "name": "Main Account",
  "currency": "PLN",
  "startingBalance": 1200
}
```

```json
{
  "id": "clx...",
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "expense",
  "type": "expense"
}
```

Bodies are validated: invalid input answers `400`, a missing or invalid session `401`,
an unknown record `404`, and a duplicate email or category (same name and type for the
same user) `409`.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run start:dev
```

The server listens on port 3000. Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Environment variables

| Name            | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string                                              |
| `JWT_SECRET`    | Secret used to sign tokens. Use a long random value                       |
| `COOKIE_SECURE` | `true` in production so the cookie is only sent over HTTPS                |
| `CORS_ORIGINS`  | Allowed web origins, comma separated. Defaults to `http://localhost:5173` |
| `PORT`          | Port to listen on. Defaults to `3000`                                     |

## Deployment

Deployed on Render. Build command `npm install && npx prisma migrate deploy && npm run build`,
start command `npm run start:prod`. Migrations run on every deploy, and a failed
migration keeps the previous version running.

The web app reaches the API through a Vercel rewrite from `/api`, so browser and API
share one origin and the session cookie stays first-party.

## Not done yet

- Tests
- Refresh tokens and a way to revoke a token before it expires
- Rate limiting on sign-in
- Email verification and password reset
- Upgrading Nest to v12 to pick up the latest Fastify fixes
