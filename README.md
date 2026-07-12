# Order Management System

A full-stack **Order Management System** built entirely with **Next.js, React, Node.js, and MongoDB** in plain JavaScript. The application supports multi-store order management, role-based access control, real-time order updates, and analytics — all within a single unified Next.js codebase.

---
## Demo Accounts

All seeded accounts use the password (`password123`)

| Role          | Email                     |
|---------------|---------------------------|
| Admin         | admin@oms.com             |
| Store Manager | manager.northside@oms.com |
| Customer      | casey@oms.com             |

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Core APIs](#core-apis)
- [Real-Time Updates](#real-time-updates)
- [Analytics & Archival](#analytics--archival)
- [Security](#security)
- [Design Highlights](#design-highlights)
- [Known Limitations](#known-limitations)
- [Author](#author)

---

## Features

- Multi-store order management
- Role-based access for **Admin**, **Store Manager**, and **Customer**
- Create, view, and update orders
- Order status flow: `PLACED → PREPARING → COMPLETED`
- Real-time notifications via Socket.IO
- MongoDB analytics using aggregation pipelines
- Order archival for historical data
- Pagination, search, and filtering
- JWT-based authentication
- Refresh token rotation and logout revocation
- Centralized API validation and error handling

---

## Tech Stack

| Layer          | Technology                       |
|----------------|----------------------------------|
| Frontend       | Next.js, React, hand-written CSS |
| Backend        | Next.js Route Handlers, Node.js  |
| Database       | MongoDB with Mongoose            |
| Real-time      | Socket.IO                        |
| Authentication | JWT and bcrypt                   |

---

## Project Structure

```text
oms-nextjs/
├── app/            # Pages and API routes
├── components/     # Reusable React components
├── contexts/       # Auth and Toast contexts
├── hooks/          # Socket.IO hooks
├── lib/            # Database, auth, and shared utilities
├── models/         # Mongoose models
├── scripts/        # Database seed script
└── server.js       # Next.js + Socket.IO server
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local instance or a cloud connection string)

### Installation

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Demo Accounts

All seeded accounts use the password `password123`.

| Role | Email |
|---|---|
| Admin | admin@oms.com |
| Store Manager | manager.northside@oms.com |
| Customer | casey@oms.com |

---

## Core APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Get role-scoped orders |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |

---

## Real-Time Updates

Socket.IO powers live order events across the application:

- `new-order` — sent when a customer places a new order
- `status-updated` — sent whenever an order's status changes

Store managers receive real-time new-order notifications, while customers receive live updates as their order status changes.

---

## Analytics & Archival

Admin analytics include:

- Orders per day
- Revenue per store
- Top-selling products
- Order and revenue summary

Old completed orders can be moved into a separate archive collection to keep the primary orders collection lean.

---

## Security

- JWT-based authentication
- Refresh token rotation
- Role-based access control
- Password hashing with bcrypt
- API rate limiting
- Server-side validation on every request
- Centralized error handling

---

## Design Highlights

- Single, unified Next.js full-stack architecture
- Native `fetch` instead of Axios
- React Context API for state management
- Hand-written CSS design system
- Server-side order status transition validation
- Database indexing and pagination
- MongoDB aggregation pipelines for analytics

---

## Known Limitations

- The in-memory rate limiter is designed for a single server instance and does not share state across multiple instances.
- Store managers may need to log in again after their store assignment to pick up the association.
- Automated tests are not currently included.

---

## Author

**Yash Gadekar**
Computer Engineering Graduate | Full-Stack Developer
