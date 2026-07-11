# Order Management System

**Tech stack: Next.js, React, Node.js, and MongoDB — nothing else.** This is a
from-scratch rebuild of the same assessment as a single Next.js application:
plain JavaScript (no TypeScript), no Express, no Tailwind, no Zod, no Axios,
no state-management library. React's built-in Context API replaces
Zustand/TanStack Query, native `fetch` replaces Axios, hand-written CSS
replaces Tailwind, and hand-written validation functions replace Zod.

Covers the same three integrated capabilities as the original spec:
1. **Multi-store order management** with role-based access control (Admin / Store Manager / Customer)
2. **Real-time notifications** via Socket.IO (`new-order`, `status-updated`)
3. **Data archival & analytics** using MongoDB aggregation pipelines

---

## Why a custom `server.js`

A plain `next start` can't host a persistent Socket.IO server. `server.js`
creates one HTTP server, hands normal requests to Next.js, and attaches
Socket.IO to that same server. Because everything runs in a single
long-lived Node process (not per-request serverless functions), API route
handlers reach the same Socket.IO instance via `global.io` to emit
`new-order` / `status-updated` — see `lib/socketEmit.js`.

## Why `"type": "module"` in package.json

`server.js` and `scripts/seed.js` run directly via plain `node` (not through
Next's bundler), while everything under `app/`, `lib/`, and `models/` is
imported by both Next's bundler *and* those standalone scripts. Mixing
CommonJS (`require`/`module.exports`) and ESM (`import`/`export`) across
that boundary causes exactly the kind of errors you might expect, so the
whole project is standardized on native ES Modules — still plain
JavaScript, just modern syntax.

---

## Project structure

```
oms-nextjs/
├── server.js                 # custom Node server: Next.js + Socket.IO
├── lib/
│   ├── db.js                  # Mongoose connection singleton
│   ├── auth.js                # JWT sign/verify + bcrypt hashing
│   ├── authHelpers.js          # shared auth route helpers
│   ├── apiResponse.js           # response envelope + ApiError + error wrapper
│   ├── requireAuth.js            # reads/verifies the access token per request
│   ├── validators.js              # hand-written validation (no Zod)
│   ├── pagination.js               # pagination helpers
│   ├── rateLimit.js                 # tiny in-memory rate limiter (no extra dep)
│   ├── socketEmit.js                 # server-side emit helpers (new-order, status-updated)
│   └── socketClient.js                # client-side Socket.IO connector
├── models/                     # Mongoose schemas (User, Store, Product, Order, OrderArchive)
├── contexts/
│   ├── AuthContext.js           # React Context auth store (replaces Zustand)
│   └── ToastContext.js           # toast notifications (replaces react-hot-toast)
├── hooks/useOrderSocket.js        # subscribes to real-time order events
├── components/                     # DashboardShell, OrdersTable, StatusBadge, ...
├── app/
│   ├── api/                          # every backend route (Route Handlers)
│   ├── (landing, login, register)
│   ├── admin/ store/ customer/        # the three dashboards
│   └── globals.css                     # hand-written design system (no Tailwind)
├── scripts/seed.js
├── Dockerfile
└── docker-compose.yml
```

---

## Getting started (local, without Docker)

### Prerequisites
- Node.js 20+
- MongoDB running locally (or a connection string to Atlas)

```bash
cp .env.example .env      # edit MONGO_URI / JWT secrets if needed
npm install
npm run seed                # populates sample admin, managers, customers, stores, products, orders
npm run dev                  # starts the app + Socket.IO on http://localhost:3000
```

### Seeded accounts (password for all: `password123`)

| Role | Email |
|---|---|
| Admin | admin@oms.com |
| Store Manager (Northside Grocers) | manager.northside@oms.com |
| Store Manager (Downtown Fresh Mart) | manager.downtown@oms.com |
| Customer | casey@oms.com |
| Customer | jordan@oms.com |

---

## Getting started with Docker

```bash
docker-compose up --build
```

This starts two containers: `mongo` (MongoDB 7) and `app` (the Next.js app + Socket.IO server) on port 3000.

Seed the database once the app container is healthy:

```bash
docker-compose exec app npm run seed:prod
```

Visit `http://localhost:3000`.

---

## API overview

All responses use a consistent envelope:

```json
{ "success": true, "message": "...", "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

### Auth
| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` | Public. `role` defaults to `customer`. Rate limited. |
| POST | `/api/auth/login` | Sets an httpOnly refresh-token cookie. Rate limited. |
| POST | `/api/auth/refresh` | Rotates the refresh token; issues a new access + refresh pair. Rate limited. |
| POST | `/api/auth/logout` | Revokes all outstanding refresh tokens for the user. |
| GET | `/api/auth/me` | Requires access token. |

### Stores / Products (Task 1)
Standard CRUD under `/api/stores` and `/api/products`, with pagination (`page`, `limit`), search (`search`), and store scoping (`storeId`). Creation/update/delete is restricted to Admin (stores) and Admin/Store Manager (products). Creating a store also links the owner's `storeId` automatically.

### Orders (Task 1)
| Method | Route | Role |
|---|---|---|
| POST | `/api/orders` | Customer |
| GET | `/api/orders` | Any authenticated role — automatically scoped: customers see their own orders, store managers see their store's orders, admins see everything (optionally filtered by `storeId`/`status`) |
| GET | `/api/orders/:id` | Any authenticated role (with ownership/store checks) |
| PATCH | `/api/orders/:id/status` | Store Manager, Admin. Enforces `PLACED → PREPARING → COMPLETED` transition order. |

### Real-time (Task 2)
Socket.IO connections authenticate via a JWT passed in `socket.handshake.auth.token`. On connect, sockets automatically join:
- `store:<storeId>` (store managers)
- `admins` (admins)
- `user:<userId>` (everyone, for personal order updates)

Events emitted by the server: `new-order` and `status-updated`. The client (`hooks/useOrderSocket.js`) refetches the relevant data and shows a toast on each event, and reconnects automatically via socket.io-client's built-in reconnection logic (with connection-state recovery enabled on the server).

### Analytics & archival (Task 3)
| Method | Route | Description |
|---|---|---|
| GET | `/api/analytics/orders-per-day?days=30` | Daily order count + revenue, via `$group` on a formatted date |
| GET | `/api/analytics/revenue-per-store` | Revenue and order count per store, via `$group` + `$lookup` |
| GET | `/api/analytics/top-selling-items?limit=10` | Best-selling products, via `$unwind` + `$group` |
| GET | `/api/analytics/summary` | Total orders/revenue + status breakdown |
| POST | `/api/archive-old-orders` | Moves orders older than `ageInDays` (default 30) from `orders` into `orders_archive`, transactionally when the MongoDB deployment supports it |

All analytics/archival routes require the Admin role.

Full request/response examples: import `postman/order-management-system.postman_collection.json` into Postman (set `baseUrl` to `http://localhost:3000/api`).

---

## Security hardening

- **Refresh token rotation**: each call to `/api/auth/refresh` verifies a `version` claim against the user's `refreshTokenVersion` in MongoDB, then issues a brand-new access + refresh token pair and bumps the version — making every refresh token single-use.
- **Logout revocation**: logout increments `refreshTokenVersion`, immediately invalidating any outstanding refresh token for that user.
- **Rate limiting**: `/api/auth/register`, `/login`, and `/refresh` are limited to 30 requests per 15 minutes per IP via a small hand-rolled in-memory limiter (`lib/rateLimit.js`) — no extra dependency needed.

## Design notes

- **Validation** happens at the top of each route handler via hand-written functions in `lib/validators.js`, so downstream code only ever sees well-formed input.
- **Errors** funnel through `withErrorHandling` (`lib/apiResponse.js`), which understands `ApiError`, Mongoose `ValidationError`/`CastError`, and duplicate-key errors, and always returns the same JSON envelope.
- **Order pricing is snapshotted** at creation time (`name`/`price` copied onto each order item), so later product price changes never retroactively alter historical order totals or archived records.
- **Status transitions are enforced server-side** (`PLACED → PREPARING → COMPLETED` only), not just in the UI.
- **Archival tries a MongoDB session/transaction first**, and falls back to a sequential best-effort archive if the deployment is a standalone `mongod` without a replica set (transactions require one) — this keeps `npm run seed` + local Docker + a bare local MongoDB install all working without extra configuration.

## Known limitations

- A store manager who registers before their store exists won't have `storeId` set on their JWT until they log in again after an admin creates the store and assigns them as owner (`POST /api/stores` with `ownerId`). The Products page shows an explanatory empty state for this case.
- The in-memory rate limiter is per-process — fine for a single instance, but would need a shared store (e.g. a MongoDB collection, since that's the only extra service in this stack) for a multi-instance deployment.
- No automated test suite is included; the API was verified manually via the Postman collection and end-to-end through the UI.
