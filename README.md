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
marked with `@Public()`. Accounts, categories and transactions belong to the signed-in
user, and other users' records answer `404`.

## Demo account

`POST /auth/demo` signs in as a shared demo user (`demo@centsible.app`), creating it
on first use. Every call resets that user's data to a generated sample: three accounts
(PLN, EUR, USD), twelve categories and about sixty transactions over the last four
months. The dates are built from today's date, so the data always looks current.

The demo user has a random password that nobody knows, so the only way in is this
endpoint. To keep the database calm, the reset runs at most once every 30 seconds and
simultaneous requests share one reset. The demo account is shared, so concurrent
visitors see each other's changes.

## Money

All amounts are whole numbers in minor units (cents): `1250` means 12.50. That keeps
sums exact. `startingBalance` and a transaction's `amount` use this format. Accounts
also return a `balance`, calculated on every request as the starting balance plus income
minus expenses.

## Endpoints

| Method | Path                | Auth | Description                                 |
| ------ | ------------------- | ---- | ------------------------------------------- |
| POST   | `/auth/register`    | no   | Create a user, sign in, set the cookie      |
| POST   | `/auth/login`       | no   | Sign in, set the cookie                     |
| POST   | `/auth/demo`        | no   | Reset the demo data and sign in as the demo |
| POST   | `/auth/logout`      | no   | Clear the cookie                            |
| GET    | `/auth/me`          | yes  | The signed-in user                          |
| GET    | `/accounts`         | yes  | List your accounts, with balances           |
| GET    | `/accounts/:id`     | yes  | Get one account                             |
| POST   | `/accounts`         | yes  | Create an account                           |
| PATCH  | `/accounts/:id`     | yes  | Update an account                           |
| DELETE | `/accounts/:id`     | yes  | Delete an account and its transactions      |
| GET    | `/categories`       | yes  | List your categories                        |
| GET    | `/categories/:id`   | yes  | Get one category                            |
| POST   | `/categories`       | yes  | Create a category                           |
| PATCH  | `/categories/:id`   | yes  | Update a category                           |
| DELETE | `/categories/:id`   | yes  | Delete a category that has no transactions  |
| GET    | `/transactions`     | yes  | List your transactions, newest first        |
| GET    | `/transactions/:id` | yes  | Get one transaction                         |
| POST   | `/transactions`     | yes  | Create a transaction                        |
| PATCH  | `/transactions/:id` | yes  | Update a transaction                        |
| DELETE | `/transactions/:id` | yes  | Delete a transaction                        |

`GET /transactions` accepts the optional filters `accountId`, `categoryId`, `from` and
`to` (ISO dates). The range is half-open: `from` is included, `to` is not, so a month
is `from=2026-11-01&to=2026-12-01`.

An account, a category and a transaction look like this:

```json
{
  "id": "clx...",
  "name": "Main Account",
  "currency": "PLN",
  "startingBalance": 120000,
  "balance": 109350
}
```

```json
{
  "id": "clx...",
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "red",
  "type": "expense"
}
```

```json
{
  "id": "clx...",
  "accountId": "clx...",
  "categoryId": "clx...",
  "amount": 1250,
  "date": "2026-11-24T00:00:00.000Z",
  "note": "Lunch"
}
```

Rules for transactions: the `amount` is always positive (the category's type decides
whether it is income or expense), the account and the category must be yours, and
the `date` is a calendar day stored at midnight UTC.

Bodies are validated: invalid input answers `400`, a missing or invalid session `401`,
an unknown record `404`, and a conflict `409`: a duplicate email, a duplicate category
(same name and type for the same user), or deleting a category that still has
transactions.

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

## Testing

Jest (`npm test`). Covered so far: the demo data (references, amounts, dates, balances
for several "today" values) and the demo service (reset, cooldown, concurrent
requests, retry after a failure).

## Deployment

Deployed on Render. Build command `npm install && npx prisma migrate deploy && npm run build`,
start command `npm run start:prod`. Migrations run on every deploy, and a failed
migration keeps the previous version running.

The web app reaches the API through a Vercel rewrite from `/api`, so browser and API
share one origin and the session cookie stays first-party.

## Not done yet

- Tests for auth, accounts, categories and transactions
- Pagination for the transactions list
- Refresh tokens and a way to revoke a token before it expires
- Rate limiting on sign-in
- Email verification and password reset
- Upgrading Nest to v12 to pick up the latest Fastify fixes
