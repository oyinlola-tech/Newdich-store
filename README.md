# Telente Store

> A production-grade, modular-monolith e-commerce platform — full-featured storefront, admin dashboard, and REST API in a single deployable service.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/status-active-success)

Built by **Oluwayemi Oyinlola Michael**.

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database & ERD](#database--erd)
7. [API Overview](#api-overview)
8. [Modules](#modules)
9. [Frontend](#frontend)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Scripts](#scripts)
13. [Testing](#testing)
14. [Security](#security)
15. [Deployment](#deployment)
16. [Roadmap](#roadmap)
17. [Author](#author)

---

## Overview

Telente Store is a complete e-commerce platform designed as a **modular monolith**: 24 feature modules, each with a clean hexagonal (ports & adapters) layout, unified through a lightweight dependency-injection container and CQRS-style command/query buses.

One Node.js process serves everything:

- A **REST API** (Fastify) with 150+ routes, JWT auth, role-based access control, and Swagger docs.
- A **vanilla HTML/CSS/JS storefront** (editorial design system) with clean URLs.
- A **full admin dashboard** for catalog, orders, inventory, users, returns, and support.

The database layer is **Prisma + MySQL** with 31 relational models covering the entire commerce domain: catalog, inventory with variants, carts, orders, payments, shipping, returns, refunds, coupons, reviews, notifications, and email delivery tracking.

---

## Feature Highlights

**Customer experience**

- Editorial storefront (home, product listing, product detail with image gallery)
- Cart, checkout (coupons + tax + shipping), order confirmation
- Customer account: profile, order history, wishlist, returns
- OTP-based auth flow and password reset
- Real-time order tracking by order number (public)

**Admin suite**

- Dashboard with analytics (stats, recent orders, top products)
- Product, category, brand, and variant management
- Inventory management with low-stock thresholds and stock-movement ledger
- Order management (status workflow, notes, status history)
- Shipments (create, tracking, status), returns and refunds processing
- User/staff management with roles and granular permissions
- Coupons, tax rules, store settings, media uploads
- Contact inbox, notifications broadcast, payment administration

**Platform**

- Paystack payment integration with webhooks
- Email delivery (Resend / SendByte) with delivery-status tracking
- Rate limiting, Helmet, CORS hardening, branded HTML error pages
- Clean-URL routing with server-side static serving
- Dockerized MySQL + backend with health checks

---

## Tech Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Language | **TypeScript 5.9** (strict, ESM, NodeNext) | Type-safe codebase |
| Runtime | **Node.js 20+ / 24** (`node:24-alpine` in Docker) | Server runtime |
| Web framework | **Fastify 5** | HTTP server + plugin ecosystem |
| ORM | **Prisma 6.19** (`prisma-client-js`) | Type-safe database access + migrations |
| Database | **MySQL 8.4** | Relational storage |
| Validation | **Zod** | Env config + input/DTO validation |
| Auth | **jsonwebtoken** (JWT), **bcryptjs** | Access/refresh tokens, password hashing |
| Logging | **Pino** (+ `pino-pretty`) | Structured logging |
| Testing | **Vitest 4** | Unit/integration/e2e (scaffolded) |
| Lint/Format | **ESLint** (typescript-eslint), **Prettier** | Code quality |
| Dev runner | **tsx** | Hot-reload TypeScript execution |

### Fastify plugins

`@fastify/cors` · `@fastify/helmet` · `@fastify/jwt` · `@fastify/multipart` · `@fastify/rate-limit` · `@fastify/sensible` · `@fastify/static` · `@fastify/swagger` · `@fastify/swagger-ui`

### Integrations (adapters)

| Integration | Domain | Status |
|---|---|---|
| **Paystack** | Payment gateway (intent, confirm, verify, refund, webhooks) | Active |
| **Flutterwave** | Payment provider adapter | Available |
| **Nomba** | Payment provider adapter | Available |
| **Resend** | Email provider | Available |
| **SendByte** | Email provider + webhook event tracking | Available |
| **Cloudinary** | Media/CDN uploads | Available |
| **Google Maps** | Address/geo integration | Available |
| **Shipping provider** | Carrier integration (stub with mock tracking) | Stub |

### Frontend

| Technology | Usage |
|---|---|
| **HTML5 + CSS3** (custom properties, design tokens) | Storefront + admin, no framework |
| **Vanilla JS (ES modules)** | Page logic, API clients, sanitizers |
| **Font Awesome 6** | Icons |
| **Google Fonts** (Poppins, Space Grotesk, Playfair Display) | Typography |
| **`Intl.NumberFormat`** | NGN currency formatting |
| **sessionStorage** | Auth token + profile storage |

### Infrastructure

| Tool | Purpose |
|---|---|
| **Docker Compose** | MySQL 8.4 + backend with health checks and volumes |
| **Docker (multi-stage)** | Build → runtime image (Node 24 Alpine) |
| **`_headers`** | Netlify-style CSP/referrer/permissions headers |
| **Git + GitHub** | Version control and collaboration |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            HTTP Clients                             │
│     Storefront (public/)      Admin (public/admins/)      Swagger   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Fastify (app.ts)                            │
│  Helmet · CORS · Rate-limit · Multipart · Static · Swagger          │
│  Central error handler (JSON + branded HTML error pages)            │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                     DI Container + Buses (core)                     │
│   CommandBus ──► Command Handlers      QueryBus ──► Query Handlers  │
│              (in-process, class-keyed)                              │
└───────────────┬──────────────────────────────────┬──────────────────┘
                │                                  │
┌───────────────▼────────────────┐   ┌─────────────▼──────────────────┐
│        24 Feature Modules      │   │        Shared Core (core/)     │
│  presentation ──► application  │   │  domain errors/value-objects   │
│  domain        ──► infrastructure│   │  logger · cache · queue ·      │
│  (controllers, services,       │   │  storage · email · prisma      │
│   ports, Prisma repositories)  │   │  pagination · id generators    │
└───────────────┬────────────────┘   └─────────────┬──────────────────┘
                │                                  │
                │            ┌─────────────────────▼──────────────┐
                └────────────►│     Prisma Client (schema)        │
                              │     MySQL 8.4  —  31 models       │
                              └───────────────────────────────────┘
```

**Key design decisions**

- **Modular monolith**: one deployable, easy to evolve; modules can be split into services later without rewrites.
- **Hexagonal modules**: each module has `presentation/` (HTTP), `application/` (use cases), `domain/` (business rules), and `infrastructure/` (Prisma adapters). Dependencies point inward.
- **CQRS-lite**: commands and queries are dispatched through shared buses with class-keyed handler maps.
- **Ports & adapters**: repositories are interfaces in `application/`, implemented with Prisma in `infrastructure/` — swapping databases or integrations is isolated.
- **Zod-validated config**: the app refuses to boot with invalid/missing env vars.

---

## Project Structure

```
telente-store/
├── src/                          # TypeScript backend (ESM)
│   ├── main.ts                   # Entry point
│   ├── app/                      # Fastify assembly, DI container, routes, static routes
│   ├── config/                   # Zod-validated env configuration (9 configs)
│   ├── core/                     # Shared framework layer
│   │   ├── application/          # command-bus, query-bus, ports
│   │   ├── domain/               # errors, value-objects, events
│   │   ├── infrastructure/       # prisma, email, logger, cache, queue, storage
│   │   └── shared/               # pagination, validators, id-generator
│   ├── database/prisma/          # schema.prisma, migrations, seed.ts
│   ├── docs/                     # OpenAPI/Swagger
│   ├── integrations/             # paystack, flutterwave, nomba, resend, sendbyte,
│   │                             # cloudinary, google-maps, shipping-provider
│   └── modules/                  # 24 feature modules (one folder each)
│       └── <module>/
│           ├── <module>.module.ts      # DI wiring + route registration
│           ├── presentation/           # controllers, routes, validators, guards
│           ├── application/            # services, commands/queries + handlers, ports
│           ├── domain/                 # errors, value-objects, types
│           └── infrastructure/         # prisma repositories, mappers
├── public/                       # Storefront + admin (served by Fastify)
│   ├── index.html                # Homepage
│   ├── css/                      # base, layout, components, pages, error
│   ├── js/                       # ESM page logic + api clients + security helpers
│   ├── apis/                     # storefront API fetch wrappers
│   ├── products/  pages/  auths/ # HTML pages
│   ├── admins/                   # admin dashboard (css, js, pages)
│   └── errors/  admins/errors/   # branded HTML error pages (400–504)
├── tests/                        # e2e / integration / unit / fixtures (scaffolded)
├── scripts/                      # utility scripts (reserved)
├── uploads/                      # runtime file uploads
├── docker-compose.yml            # MySQL + backend
├── Dockerfile                    # multi-stage build
├── _headers                      # CSP / security headers
└── package.json
```

---

## Database & ERD

**Database**: MySQL 8.4 · **ORM**: Prisma 6.19 · `schema.prisma` lives at `src/database/prisma/schema.prisma`.

**Conventions**: all IDs are `cuid` strings; all monetary values are `Decimal(10,2)`; timestamps are UTC; soft-delete via status enums where needed.

### Entity-Relationship Diagram

```mermaid
erDiagram
    %% ════════════════════════════
    %% IDENTITY & ACCESS
    %% ════════════════════════════
    USER {
        string id PK
        string name
        string email UK
        string phone
        string passwordHash
        enum role "CUSTOMER | ADMIN | SUPER_ADMIN | STAFF"
        enum status "ACTIVE | SUSPENDED"
        json permissions
        datetime emailVerifiedAt
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }
    SESSION {
        string id PK
        string userId FK
        string refreshTokenHash UK
        string userAgent
        string ip
        datetime expiresAt
        datetime revokedAt
        datetime createdAt
    }
    PASSWORD_RESET {
        string id PK
        string email FK "references User.email"
        string tokenHash UK
        datetime expiresAt
        datetime usedAt
        datetime createdAt
    }
    OTP {
        string id PK
        string email FK "references User.email"
        enum purpose "REGISTER | LOGIN | RESET_PASSWORD | ADMIN_LOGIN | CHANGE_EMAIL"
        string codeHash
        string tokenHash UK
        datetime expiresAt
        int attempts
        int maxAttempts
        datetime verifiedAt
        datetime createdAt
    }
    %% ════════════════════════════
    %% CATALOG
    %% ════════════════════════════
    CATEGORY {
        string id PK
        string name
        string slug UK
        string parentId FK "self-reference"
        string imageUrl
        int sortOrder
        enum status "ACTIVE | INACTIVE"
        datetime createdAt
        datetime updatedAt
    }
    BRAND {
        string id PK
        string name UK
        string slug UK
        string description
        string logoUrl
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    PRODUCT {
        string id PK
        string name
        string slug UK
        string description "TEXT"
        decimal price "Decimal(10,2)"
        decimal compareAtPrice
        string sku
        string barcode
        string brandId FK
        enum status "DRAFT | ACTIVE | ARCHIVED"
        boolean featured
        datetime createdAt
        datetime updatedAt
    }
    PRODUCT_VARIANT {
        string id PK
        string productId FK
        string name
        string sku
        json attributes
        decimal priceDelta
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
    PRODUCT_IMAGE {
        string id PK
        string productId FK
        string url
        string alt
        int position
        datetime createdAt
    }
    CATEGORY_PRODUCT {
        string categoryId PK, FK
        string productId PK, FK
        datetime createdAt
    }
    INVENTORY {
        string productId PK, FK
        string variantId UK, FK "per-variant inventory"
        int quantity
        int lowStockThreshold
        int reservedQuantity
        datetime updatedAt
    }
    STOCK_MOVEMENT {
        string id PK
        string productId FK
        string variantId FK
        string inventoryId FK
        enum type "INITIAL | RESTOCK | ADJUSTMENT | SALE | RESERVED | RELEASED | RETURN"
        int quantity
        string reason
        string refType
        string refId
        datetime createdAt
    }
    %% ════════════════════════════
    %% CUSTOMERS & WISHLIST
    %% ════════════════════════════
    ADDRESS {
        string id PK
        string userId FK
        string label
        string firstName
        string lastName
        string phone
        string line1
        string line2
        string city
        string state
        string country "default NG"
        string postalCode
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
    CART {
        string id PK
        string userId UK, FK "one cart per user"
        datetime createdAt
        datetime updatedAt
    }
    CART_ITEM {
        string id PK
        string cartId FK
        string productId FK
        string variantId FK
        int quantity
        datetime createdAt
        datetime updatedAt
    }
    WISHLIST_ITEM {
        string id PK
        string userId FK
        string productId FK
        datetime createdAt
    }
    %% ════════════════════════════
    %% ORDERS, PAYMENTS, SHIPPING
    %% ════════════════════════════
    ORDER {
        string id PK
        string orderNumber UK
        string userId FK
        enum status "PENDING | PAID | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED"
        decimal subtotal
        decimal discountAmount
        decimal taxAmount
        decimal shippingAmount
        decimal total
        string currency "default NGN"
        string couponCode
        string note
        datetime placedAt
        datetime updatedAt
    }
    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        string variantId FK
        string name
        decimal price
        int quantity
        decimal total
    }
    ORDER_STATUS_HISTORY {
        string id PK
        string orderId FK
        enum status "OrderStatus"
        string note
        datetime createdAt
    }
    PAYMENT {
        string id PK
        string orderId FK
        enum method "CARD | TRANSFER | PAY_ON_DELIVERY | WALLET"
        decimal amount
        enum status "PENDING | AUTHORIZED | PAID | FAILED | REFUNDED"
        string provider
        string reference UK
        json metadata
        datetime paidAt
        datetime createdAt
    }
    SHIPMENT {
        string id PK
        string orderId UK, FK "one shipment per order"
        string addressId FK
        enum method "STANDARD | EXPRESS | SAME_DAY"
        string carrier
        string trackingNumber
        enum status "PENDING | PROCESSING | IN_TRANSIT | DELIVERED | RETURNED"
        datetime shippedAt
        datetime deliveredAt
        datetime createdAt
        datetime updatedAt
    }
    %% ════════════════════════════
    %% DISCOUNTS, REVIEWS, RETURNS
    %% ════════════════════════════
    COUPON {
        string id PK
        string code UK
        enum discountType "PERCENTAGE | FIXED"
        decimal discountValue
        decimal minOrderAmount
        decimal maxDiscountAmount
        int usageLimit
        int usedCount
        datetime validFrom
        datetime validUntil
        enum status "ACTIVE | EXPIRED | DISABLED"
        datetime createdAt
    }
    REVIEW {
        string id PK
        string productId FK
        string userId FK
        int rating
        string title
        string comment
        boolean isVerifiedPurchase
        datetime createdAt
        datetime updatedAt
    }
    RETURN {
        string id PK
        string orderId UK, FK "one return per order"
        string userId FK
        enum reason "WRONG_ITEM | DEFECTIVE | NOT_AS_DESCRIBED | SIZE_FIT | OTHER"
        string detail
        enum status "REQUESTED | APPROVED | REJECTED | PICKED_UP | REFUNDED | CLOSED"
        json notes
        datetime approvedAt
        datetime createdAt
        datetime updatedAt
    }
    REFUND {
        string id PK
        string returnId UK, FK "one refund per return"
        string userId FK
        decimal amount
        enum status "PENDING | PROCESSING | COMPLETED | FAILED"
        string provider
        string reference
        datetime refundedAt
        datetime createdAt
    }
    %% ════════════════════════════
    %% NOTIFICATIONS, MEDIA, SETTINGS
    %% ════════════════════════════
    NOTIFICATION {
        string id PK
        string userId FK
        enum type "ORDER | PRODUCT | PROMOTION | SYSTEM"
        string title
        string body
        datetime readAt
        datetime createdAt
    }
    MEDIA {
        string id PK
        string filename
        string originalName
        string mimeType
        int size
        enum type "IMAGE | VIDEO | DOCUMENT"
        string url
        string alt
        datetime createdAt
    }
    STORE_SETTINGS {
        string key PK
        json value
        string description
        datetime updatedAt
    }
    TAX_RULE {
        string id PK
        string country
        string state
        decimal rate "Decimal(5,2)"
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
    %% ════════════════════════════
    %% CONTACT & EMAIL
    %% ════════════════════════════
    CONTACT_MESSAGE {
        string id PK
        string name
        string email
        string subject
        string message "TEXT"
        enum status "NEW | READ | REPLIED | CLOSED"
        string reply
        datetime repliedAt
        datetime createdAt
        datetime updatedAt
    }
    EMAIL_LOG {
        string id PK
        string to
        string subject
        string purpose
        string provider
        string emailId UK
        enum status "QUEUED | SENT | DELIVERED | OPENED | CLICKED | BOUNCED | COMPLAINED | UNSUBSCRIBED | FAILED"
        json eventRaw
        datetime createdAt
        datetime updatedAt
    }
    %% ════════════════════════════
    %% RELATIONSHIPS — IDENTITY
    %% ════════════════════════════
    USER ||--o{ SESSION : "owns sessions"
    USER ||--o{ PASSWORD_RESET : "requests resets"
    USER ||--o{ OTP : "receives otps"
    USER ||--o{ NOTIFICATION : "receives notifications"
    USER ||--o{ ADDRESS : "has addresses"
    USER ||--o| CART : "has one cart"
    USER ||--o{ WISHLIST_ITEM : "wishes for"
    USER ||--o{ ORDER : "places orders"
    USER ||--o{ REVIEW : "writes reviews"
    USER ||--o{ RETURN : "files returns"
    USER ||--o{ REFUND : "receives refunds"
    %% ════════════════════════════
    %% RELATIONSHIPS — CATALOG
    %% ════════════════════════════
    CATEGORY ||--o{ CATEGORY : "parent has children"
    CATEGORY ||--o{ CATEGORY_PRODUCT : "groups"
    PRODUCT ||--o{ CATEGORY_PRODUCT : "belongs to"
    BRAND ||--o{ PRODUCT : "manufactures"
    PRODUCT ||--o{ PRODUCT_VARIANT : "has variants"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has images"
    PRODUCT ||--o| INVENTORY : "has stock (product-level)"
    PRODUCT ||--o{ STOCK_MOVEMENT : "ledger entries"
    PRODUCT_VARIANT ||--o| INVENTORY : "has stock (variant-level)"
    PRODUCT_VARIANT ||--o{ STOCK_MOVEMENT : "ledger entries"
    INVENTORY ||--o{ STOCK_MOVEMENT : "records movements"
    COUPON }o--o{ PRODUCT : "applies to products"
    %% ════════════════════════════
    %% RELATIONSHIPS — COMMERCE
    %% ════════════════════════════
    CART ||--o{ CART_ITEM : "contains"
    CART_ITEM }o--|| PRODUCT : "references"
    CART_ITEM }o--o| PRODUCT_VARIANT : "references"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }o--|| PRODUCT : "snapshot of"
    ORDER_ITEM }o--o| PRODUCT_VARIANT : "snapshot of"
    ORDER ||--o{ ORDER_STATUS_HISTORY : "status timeline"
    ORDER ||--o{ PAYMENT : "paid via"
    ORDER ||--o| SHIPMENT : "shipped as"
    ORDER ||--o| RETURN : "may be returned"
    ADDRESS ||--o{ SHIPMENT : "shipping address"
    RETURN ||--o| REFUND : "results in"
    PRODUCT ||--o{ REVIEW : "receives"
    PRODUCT ||--o{ WISHLIST_ITEM : "wished for"
    PRODUCT ||--o{ CART_ITEM : "in carts"
```

> The diagram mirrors `src/database/prisma/schema.prisma` — 31 models and 20 enums. Composite `(categoryId, productId)` and `(cartId, productId, variantId)` unique constraints are enforced at the database level.

### Domain at a glance

| Domain | Models |
|---|---|
| Identity & Access | `User`, `Session`, `PasswordReset`, `Otp` |
| Catalog | `Category`, `Brand`, `Product`, `ProductVariant`, `ProductImage`, `CategoryProduct`, `Inventory`, `StockMovement` |
| Customers | `Address`, `Cart`, `CartItem`, `WishlistItem` |
| Commerce | `Order`, `OrderItem`, `OrderStatusHistory`, `Payment`, `Shipment`, `Coupon` |
| Post-purchase | `Return`, `Refund`, `Review` |
| Platform | `Notification`, `Media`, `StoreSettings`, `TaxRule`, `ContactMessage`, `EmailLog` |

---

## API Overview

- **Base URL**: `http://localhost:3000/api/v1` (the app default). **Note**: `.env.example` sets `API_PREFIX=/api` and the frontend `config.js` targets `/api` — make sure they agree.
- **Interactive docs**: Swagger UI at [`http://localhost:3000/docs`](http://localhost:3000/docs).
- **Response envelope**: `{ "error": { "code", "message", "details?" } }` for errors; branded HTML pages for browser requests.
- **Auth**: Bearer token (`Authorization: Bearer <access-token>`) obtained from `/auth/login`. Access tokens default to 15 min; refresh tokens rotate with 30-day lifetime.
- **Access levels**:
  - **Public** — no auth
  - **Auth** — any signed-in user
  - **Admin** — `ADMIN` / `SUPER_ADMIN` / `STAFF`
  - **SuperAdmin** — staff management only
  - **Permission** — granular capability checks (e.g. `products.manage`)
- **Health**: `GET /health`, `GET /health/live`, `GET /health/ready` (DB ping).

---

## Modules

| Module | Purpose | Sample endpoints |
|---|---|---|
| **health** | Liveness/readiness | `GET /health*` |
| **auth** | Register, login, OTP, password reset, tokens | `POST /auth/login`, `/auth/register`, `/auth/otp/*`, `POST /admin/auth/*` |
| **users** | Profiles, admin user management, staff | `GET /users/profile`, `GET /admin/users`, `GET /admin/staff` |
| **categories** | Nested category tree | `GET /categories`, `/categories/tree`, `POST /admin/categories` |
| **brands** | Brand catalog | `GET /brands`, `POST /admin/brands` |
| **products** | Products + search + uploads | `GET /products`, `/products/search`, `POST /admin/products` |
| **product-variants** | Variant CRUD per product | `GET /products/:productId/variants`, `POST /admin/products/:productId/variants` |
| **inventory** | Stock levels, reservation, check | `GET /inventory/:productId`, `POST /inventory/check`, `PUT /admin/inventory/:productId` |
| **media** | File uploads (local storage) | `POST /admin/media/upload` |
| **settings** | Store settings | `GET /settings`, `PUT /admin/settings` |
| **addresses** | Customer address book | `GET /addresses`, `POST /addresses`, `PUT /addresses/:id` |
| **carts** | Cart + items | `GET /cart`, `POST /cart/items`, `PUT /cart/items/:itemId` |
| **orders** | Order lifecycle | `GET /orders`, `POST /orders`, `GET /orders/track/:orderNumber`, `PUT /admin/orders/:id/status` |
| **payments** | Paystack intents, verify, refunds | `POST /payments/intent`, `POST /payments/webhook/paystack`, `POST /admin/payments/:id/refund` |
| **checkout** | Order orchestration (cart→coupon→tax→payment) | `POST /checkout`, `GET /checkout/shipping-options` |
| **shipping** | Shipments & tracking | `GET /orders/:orderId/shipment`, `POST /admin/shipments` |
| **wishlists** | Wishlist items | `GET /wishlist`, `POST /wishlist/items`, `/wishlist/toggle` |
| **reviews** | Ratings & comments | `GET /products/:productId/reviews`, `POST /products/:productId/reviews` |
| **returns** | Return requests & refunds | `POST /returns`, `PUT /admin/returns/:id/status`, `POST /admin/returns/:id/refund` |
| **notifications** | User notifications + broadcast | `GET /notifications`, `POST /admin/notifications/broadcast` |
| **coupons** | Discount codes | `GET /coupons/validate`, `POST /admin/coupons` |
| **tax** | Tax rules | `GET /tax-rules/default`, `POST /admin/tax-rules` |
| **contact** | Support inbox | `POST /contact`, `PUT /admin/contact/:id/status` |
| **analytics** | Admin stats | `GET /admin/stats`, `/admin/orders/recent`, `/admin/products/top` |
| **webhooks** | SendByte email events | `POST /webhooks/sendbyte` |

---

## Frontend

The frontend is **server-rendered static HTML** with progressive enhancement via ES modules — no build step, no framework.

- **Storefront**: `public/` — home, products, product detail (gallery), cart, checkout, order confirmation, account, wishlist, returns, contact.
- **Auth pages**: `public/auths/` — login, register, OTP, forgot/reset password.
- **Admin**: `public/admins/` — dashboard, orders, products, categories, inventory, users, returns, contact, auth.
- **Error pages**: branded 400–504 HTML pages for storefront and admin.
- **CSS**: design-token system (`base.css`) → layout → components → pages; dedicated `error.css`.
- **API clients**: `public/apis/` (storefront) and `public/admins/api/` (admin) fetch wrappers; token injected from `sessionStorage`.
- **Security**: ReDoS-safe validators, HTML/attribute escaping, safe redirects, CSP meta tags, reset tokens stripped from URLs.
- **Currency**: all prices rendered with `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.

Clean URLs are resolved server-side by `src/app/static-routes.ts` (e.g. `/products` → `public/products/products.html`).

---

## Getting Started

### Prerequisites

- Node.js **20+** (24 recommended)
- Docker (optional — for the MySQL container)
- npm

### 1. Clone & install

```bash
git clone git@github.com:oyinlola-tech/Newdich-store.git
cd Newdich-store
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — at minimum set:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/telente_store"
JWT_SECRET="a-strong-secret-at-least-16-chars"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="a-strong-password"
```

### 3. Start MySQL (option A — Docker)

```bash
docker compose up -d db
```

…or use any local MySQL 8.4 instance.

### 4. Prepare the database

```bash
npm run db:setup        # prisma db push + seed (admin user, categories, products…)
npm run prisma:generate # ensure the Prisma client is generated
```

### 5. Run

```bash
npm run dev             # http://localhost:3000
```

| What | URL |
|---|---|
| Storefront | http://localhost:3000 |
| Swagger API docs | http://localhost:3000/docs |
| Health check | http://localhost:3000/health |
| Admin dashboard | http://localhost:3000/admin |

### Docker (full stack)

```bash
docker compose up --build
```

Runs MySQL + backend with health checks; uploads persist in a named volume.

---

## Environment Variables

| Group | Variables | Default |
|---|---|---|
| **App** | `NODE_ENV`, `PORT`, `HOST`, `API_PREFIX`, `CORS_ORIGIN`, `PUBLIC_BASE_URL`, `LOG_LEVEL` | `development`, `3000`, `0.0.0.0`, `/api/v1`, `http://localhost:3000` |
| **Auth** | `JWT_SECRET` (≥16 chars), `JWT_EXPIRES_IN`, `REFRESH_TOKEN_DAYS`, `OTP_REQUIRED`, `OTP_LIFETIME_MINUTES`, `BCRYPT_ROUNDS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` | `15m`, `30`, `true`, `10`, `10` |
| **Database** | `DATABASE_URL` | *required* |
| **Email** | `EMAIL_PROVIDER` (`console`/`resend`/`sendbyte`), `RESEND_API_KEY`, `SEND_BYTE_API_KEY`, `SEND_BYTE_BASE_URL`, `SEND_BYTE_WEBHOOK_SECRET`, `EMAIL_FROM` | `console` |
| **Payments** | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `NOMBA_API_KEY` | — |
| **Shipping** | `SHIPPING_PROVIDER`, `SHIPPING_API_KEY` | `local` |
| **Storage** | `UPLOADS_DIR`, `MAX_UPLOAD_MB`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | `uploads`, `10` |
| **Cache/Queue** | `REDIS_URL` | optional |
| **Security** | `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS` | `100`, `60000`, `10`, `60000` |

All variables are validated with **Zod** at boot — invalid config fails fast with a clear error.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled build (`node dist/main.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm test` / `npm run test:watch` | Run Vitest suites |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run db:seed` | Seed the database |
| `npm run db:setup` | Push schema + seed |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Testing

Vitest is configured as the test runner with the `tests/` directory scaffolded for three layers:

```
tests/
├── e2e/          # end-to-end API tests
├── integration/  # module integration tests
├── unit/         # unit tests
└── fixtures/     # test data
```

Run the suite with `npm test`.

---

## Security

- **Helmet** security headers + CSP meta tags on all pages
- **CORS** locked down (refuses `*` in production), rate limiting (global + auth routes)
- **JWT** access tokens (15 min default) + rotating refresh tokens (hashed at rest)
- **bcrypt** password hashing; **hashed** OTP codes and reset tokens
- **Role-based access control** (`ADMIN`/`SUPER_ADMIN`/`STAFF`) + granular permission guards (e.g. `products.manage`)
- **Ownership checks** on customer resources (orders, returns, payments, profile)
- **Webhook security** — signature/secret verification (Paystack, SendByte)
- **Input validation** — Zod on every route; XSS-safe rendering on the frontend
- **Branded HTML error pages** (400–504) for storefront and admin, JSON envelope for API clients

Vulnerability reporting policy: see [`SECURITY.md`](SECURITY.md).

---

## Deployment

The included `Dockerfile` produces a minimal multi-stage production image:

1. **Builder**: install deps → `prisma generate` → `npm run build`
2. **Runtime**: `node:24-alpine` + production deps + `dist/` + generated Prisma client

```bash
docker build -t telente-store .
docker run -p 3000:3000 --env-file .env telente-store
```

Platform notes:

- The `_headers` file provides Netlify-style CSP/referrer headers for static hosting; `connect-src` must point at your HTTPS API in production.
- The API serves the frontend itself — a single container is enough for the whole product.
- Uploads persist via a volume (Docker named volume `telente_uploads`, or bind-mount `./uploads`).

---

## Roadmap

- [ ] Implement the `discounts`, `refunds` (standalone), and `search` modules (folders scaffolded)
- [ ] Wire the Redis cache and queue providers (currently no-op adapters)
- [ ] Expand Swagger/OpenAPI docs to cover all modules
- [ ] Real shipping-provider integration (currently a stub)
- [ ] Populate `tests/` with unit, integration, and e2e suites

---

## Author

**Oluwayemi Oyinlola Michael** — Full-stack developer & architect of Telente Store.

Questions, feedback, or collaboration? Open an issue or reach out via the repository.

---

© 2026 Oluwayemi Oyinlola Michael · Telente Store. All rights reserved.
