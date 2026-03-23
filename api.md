# Newdich Store API Reference

This document lists every API endpoint referenced by the frontend code in `public/api/*` and `admin/api/*`.

Base URL (public + admin):
- `http://localhost:3000/api`

Notes:
- All endpoints are relative to the base URL above.
- `getHeaders()` adds `Content-Type: application/json` and `Authorization: Bearer <token>` when a token is present.
- Endpoints marked **Auth** require an authenticated user/admin.

Backend requirements (production):
- Use HttpOnly, Secure, SameSite cookies for auth.
- Enforce CSRF protection when using cookies.
- Enforce ownership checks and admin role checks server-side.
- Rate limit OTP/login endpoints.

---

## Public API

### Auth
- `POST /auth/login` — Login user
- `POST /auth/register` — Register user

### OTP
- `POST /auth/otp/request` — Request OTP (body: `email`, `purpose`)
- `POST /auth/otp/verify` — Verify OTP (body: `email`, `code`, `purpose`, `otpToken`)

### Password Reset
- `POST /auth/forgot-password` — Request password reset (body: `email`)
- `POST /auth/reset-password` — Reset password (body: `token`, `password`)

### Password Change **Auth**
- `POST /auth/change-password` — Change password (body: `currentPassword`, `newPassword`)

### Products
- `GET /products?featured=true&limit={n}` — Featured products
- `GET /products` — List products (optional query: `category`, `search`, `minPrice`, `maxPrice`)
- `GET /products/{id}` — Product by id

### Categories
- `GET /categories` — List categories
- `GET /categories/{id}` — Category by id or slug

### Cart **Auth**
- `GET /cart` — Get cart
- `POST /cart/items` — Add to cart (body: `productId`, `quantity`)
- `PUT /cart/items/{itemId}` — Update cart item quantity (body: `quantity`)
- `DELETE /cart/items/{itemId}` — Remove cart item

### Orders **Auth**
- `POST /orders` — Submit order
- `GET /orders` — List user orders
- `GET /orders/{orderId}` — Order details

### Payments **Auth**
- `POST /payments/intent` — Create payment intent
- `POST /payments/{paymentId}/confirm` — Confirm payment
- `GET /payments/methods` — List saved payment methods

### Inventory
- `GET /inventory/{productId}` — Inventory for product
- `POST /inventory/check` — Check availability (body: `productId`, `quantity`)

### Wishlist **Auth**
- `GET /wishlist` — Get wishlist
- `POST /wishlist/items` — Add to wishlist (body: `productId`)
- `DELETE /wishlist/items/{itemId}` — Remove wishlist item

### Returns **Auth**
- `POST /returns` — Submit return request

### User Profile **Auth**
- `GET /users/profile` — Current user profile
- `PUT /users/profile` — Update profile

### Contact
- `POST /contact` — Send contact message

---

## Admin API

### Admin Auth
- `POST /admin/auth/login` — Admin login
- `POST /admin/auth/logout` — Admin logout
- `GET /admin/auth/me` — Current admin profile

### Admin OTP
- `POST /admin/auth/otp/request` — Request admin OTP (body: `email`, `purpose`)
- `POST /admin/auth/otp/verify` — Verify admin OTP (body: `email`, `code`, `purpose`, `otpToken`)

### Admin Password Reset
- `POST /admin/auth/forgot-password` — Request reset (body: `email`)
- `POST /admin/auth/reset-password` — Reset password (body: `token`, `password`)

### Admin Products **Auth**
- `GET /admin/products` — List products
- `GET /admin/products/{productId}` — Product details
- `POST /admin/products` — Create product (JSON or `FormData`)
- `PUT /admin/products/{productId}` — Update product (JSON or `FormData`)
- `DELETE /admin/products/{productId}` — Delete product

### Admin Categories **Auth**
- `GET /admin/categories` — List categories
- `POST /admin/categories` — Create category
- `PUT /admin/categories/{categoryId}` — Update category
- `DELETE /admin/categories/{categoryId}` — Delete category

### Admin Inventory **Auth**
- `GET /admin/inventory` — List inventory (optional query: `search`, `lowStock`)
- `PUT /admin/inventory/{productId}` — Update inventory

### Admin Orders **Auth**
- `GET /admin/orders` — List orders (optional query: `status`, `search`)
- `GET /admin/orders/{orderId}` — Order details
- `PUT /admin/orders/{orderId}/status` — Update status
- `POST /admin/orders/{orderId}/notes` — Add admin note
- `GET /admin/orders/{orderId}/status-history` — Status history

### Admin Returns **Auth**
- `GET /admin/returns` — List returns (optional query: `status`, `search`)
- `GET /admin/returns/{returnId}` — Return details
- `PUT /admin/returns/{returnId}/status` — Update return status
- `POST /admin/returns/{returnId}/notes` — Add return note

### Admin Contact **Auth**
- `GET /admin/contact` — List contact messages (optional query: `status`, `search`)
- `GET /admin/contact/{messageId}` — Message details
- `PUT /admin/contact/{messageId}/status` — Update status
- `POST /admin/contact/{messageId}/reply` — Reply to message

### Admin Payments **Auth**
- `GET /admin/payments` — List payments (optional query: `status`, `search`)
- `POST /admin/payments/{paymentId}/refund` — Refund payment
- `PUT /admin/payments/{paymentId}/status` — Update payment status

### Admin Users **Auth**
- `GET /admin/users` — List users (optional query: `search`)
- `GET /admin/users/{userId}` — User details
- `PUT /admin/users/{userId}` — Update user role/status

### Admin Stats **Auth**
- `GET /admin/stats` — Dashboard stats
- `GET /admin/orders/recent?limit={n}` — Recent orders
