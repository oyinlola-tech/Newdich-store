# Newdich-store Codebase Audit Report

## 1. COMPLETE LIST OF ALL API ENDPOINTS

### Health
- `GET /health`
- `GET /health/live`
- `GET /health/ready`

### Auth (Public)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh-token`
- `POST /auth/change-password`
- `POST /auth/logout`
- `GET /auth/me`

### Auth (Admin)
- `POST /admin/auth/login`
- `POST /admin/auth/otp/request`
- `POST /admin/auth/otp/verify`
- `POST /admin/auth/forgot-password`
- `POST /admin/auth/reset-password`
- `POST /admin/auth/change-password`
- `POST /admin/auth/logout`
- `GET /admin/auth/me`

### Users
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/:id`
- `GET /admin/users`
- `GET /admin/users/:id`
- `PUT /admin/users/:id`

### Staff
- `GET /admin/staff`
- `GET /admin/staff/roles`
- `GET /admin/staff/:id`
- `POST /admin/staff`
- `PUT /admin/staff/:id`
- `DELETE /admin/staff/:id`

### Categories
- `GET /categories`
- `GET /categories/tree`
- `GET /categories/:idOrSlug`
- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/:id`
- `DELETE /admin/categories/:id`

### Products
- `GET /products`
- `GET /products/search`
- `GET /products/:idOrSlug`
- `GET /admin/products`
- `GET /admin/products/:id`
- `POST /admin/products`
- `PUT /admin/products/:id`
- `DELETE /admin/products/:id`

### Product Variants
- `GET /products/:productId/variants`
- `POST /admin/products/:productId/variants`
- `PUT /admin/variants/:id`
- `DELETE /admin/variants/:id`

### Inventory
- `GET /admin/inventory`
- `GET /admin/inventory/variants/:variantId`
- `PUT /admin/inventory/variants/:variantId`

### Media
- `POST /admin/media/upload`
- `DELETE /admin/media`

### Settings
- `GET /settings`
- `GET /admin/settings`
- `PUT /admin/settings`

### Addresses
- `GET /addresses`
- `POST /addresses`
- `PUT /addresses/:id`
- `DELETE /addresses/:id`

### Cart
- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

### Orders
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/track/:orderNumber`
- `GET /admin/orders`
- `GET /admin/orders/:id`
- `PUT /admin/orders/:id/status`

### Payments
- `POST /payments/intent`
- `GET /payments/verify`
- `POST /payments/webhook/paystack`
- `GET /payments/orders/:orderId`
- `GET /admin/payments`
- `POST /admin/payments/:paymentId/refund`
- `PUT /admin/payments/:paymentId/status`

### Checkout
- `GET /checkout/shipping-options`
- `POST /checkout`

### Shipping
- `GET /orders/:orderId/shipment`
- `POST /admin/shipments`
- `PUT /admin/shipments/:id/status`
- `PUT /admin/shipments/:id/tracking`
- `GET /admin/shipments`

### Wishlists
- `GET /wishlist`
- `POST /wishlist/items`
- `POST /wishlist/toggle`
- `DELETE /wishlist/items/:itemId`

### Reviews
- `GET /products/:productId/reviews`
- `POST /products/:productId/reviews`
- `GET /admin/reviews`
- `DELETE /admin/reviews/:id`

### Returns
- `POST /returns`
- `GET /returns`
- `GET /admin/returns`
- `GET /admin/returns/:id`
- `PUT /admin/returns/:id/status`
- `POST /admin/returns/:id/notes`
- `POST /admin/returns/:id/refund`
- `GET /admin/refunds`

### Notifications
- `GET /notifications`
- `GET /notifications/unread-count`
- `PUT /notifications/:id/read`
- `PUT /notifications/read-all`
- `POST /admin/notifications/broadcast`

### Coupons
- `GET /coupons/validate`
- `GET /admin/coupons`
- `POST /admin/coupons`
- `PUT /admin/coupons/:id`
- `DELETE /admin/coupons/:id`

### Tax
- `GET /tax-rules/default`
- `GET /admin/tax-rules`
- `POST /admin/tax-rules`
- `PUT /admin/tax-rules/:id`
- `DELETE /admin/tax-rules/:id`

### Contact
- `POST /contact`
- `GET /admin/contact`
- `GET /admin/contact/:id`
- `PUT /admin/contact/:id/status`
- `POST /admin/contact/:id/reply`

### Analytics
- `GET /admin/stats`
- `GET /admin/orders/recent`
- `GET /admin/products/top`

### Webhooks
- `POST /webhooks/sendbyte`

### Brands
- `GET /brands`
- `GET /brands/:idOrSlug`
- `GET /admin/brands`
- `POST /admin/brands`
- `PUT /admin/brands/:id`
- `DELETE /admin/brands/:id`

---

## 2. BUGS FOUND

### Critical: `userId` vs `id` mismatch (affects ~9 controllers)
`AuthenticatedUser` (`src/core/infrastructure/http/request.types.ts:5`) defines `id`, but almost every controller destructures `userId` from `request.user`. This causes `userId` to be `undefined` at runtime, breaking all user-scoped operations.

Affected files & lines:
- `src/modules/addresses/presentation/controllers/address.controller.ts:8,14,38,64`
- `src/modules/carts/presentation/controllers/cart.controller.ts:12,40,55,70,77`
- `src/modules/checkout/presentation/controllers/checkout.controller.ts:8`
- `src/modules/notifications/presentation/controllers/notification.controller.ts:9,18,24,31`
- `src/modules/orders/presentation/controllers/order.controller.ts:11,17`
- `src/modules/payments/presentation/controllers/payment.controller.ts:10`
- `src/modules/returns/presentation/controllers/return.controller.ts:9,27`
- `src/modules/reviews/presentation/controllers/review.controller.ts:18`
- `src/modules/wishlists/presentation/controllers/wishlist.controller.ts:8,14,24,33`

### Error swallowing
- `src/modules/addresses/presentation/controllers/address.controller.ts:69` catches **all** exceptions in `delete` and returns `404`, hiding real server errors.

### Inefficient client-side filtering
- `src/modules/users/presentation/controllers/staff.controller.ts:14` and `:75` call `listStaff()` and filter with `.find()` instead of a dedicated `getStaffById`.

### Bulk data fetch for single record
- `src/modules/payments/presentation/controllers/payment.controller.ts:88` calls `paymentService.list(1, 200)` just to find one payment by ID.

### Memory-heavy multipart parsing
- `src/modules/products/presentation/controllers/product.controller.ts:198-221` and `src/modules/media/presentation/controllers/media.controller.ts:8-19` iterate `request.parts()` and call `part.toBuffer()` on every file, loading the entire upload into memory.

### Missing validation
- `src/modules/users/presentation/controllers/staff.controller.ts:32-51` and `:53-70` manually check/cast body fields instead of using Zod validators.
- `src/modules/product-variants/presentation/controllers/product-variant.controller.ts:22-31` and `:35-49` manually validate/cast body fields.
- `src/modules/contact/presentation/controllers/contact.controller.ts:11-15` defaults every field to an empty string and performs no required-field validation.
- `src/modules/reviews/presentation/controllers/review.controller.ts:21-23` accepts any numeric `rating` without range validation (e.g., 1–5).
- `src/modules/return/presentation/controllers/return.controller.ts:54-57` accepts any `status` string without enum validation.
- `src/modules/coupons/presentation/controllers/coupon.controller.ts:55-73` updates without validating `discountType`, `discountValue`, etc.
- `src/modules/tax/presentation/controllers/tax.controller.ts:35-44` updates without validating `rate` or `country`.

### Architectural / logic issues
- `src/modules/categories/presentation/controllers/category.controller.ts:54-58` `delete` has no check for products linked to the category.
- `src/modules/inventory/presentation/controllers/inventory.controller.ts:13` hardcodes the low-stock threshold to `10`.
- `src/modules/settings/presentation/controllers/settings.controller.ts:24-29` iterates over **all** body keys and writes them to the settings store without allowlisting.
- `src/modules/analytics/presentation/controllers/analytics.controller.ts:5` depends directly on `PrismaClient`, bypassing the repository pattern used everywhere else.

---

## 3. SECURITY ISSUES

### Frontend/Backend API prefix mismatch
- The frontend base URL is `http://localhost:3000/api` (`public/apis/main/config.js:2`, `public/admins/api/main/config.js:2`), but backend routes are registered without the `/api` prefix. `API_PREFIX` is defined in `src/config/app.config.ts:7` but **never applied** to routes.

### Webhook signature verification is broken
- `src/modules/payments/presentation/controllers/payment.controller.ts:57` and `src/modules/webhooks/presentation/controllers/webhook.controller.ts:17` compute HMACs over `JSON.stringify(request.body)`. Fastify's JSON parser may reorder keys or change number formatting, producing a digest that does not match the raw payload. This can cause valid webhooks to be rejected or, worse, allow tampered payloads to pass if the parser normalizes them identically.

### Replay attack on SendByte webhook
- `src/modules/webhooks/presentation/controllers/webhook.controller.ts:38-51` verifies the signature but ignores the timestamp in the `sendbyte-signature` header, allowing an attacker to replay a captured valid request.

### Public order tracking leaks data
- `GET /orders/track/:orderNumber` (`src/modules/orders/presentation/routes/order.route.ts:13`) is unauthenticated and returns full order line items, totals, and status history. If order numbers are guessable, this exposes customer purchase history.

### Wildcard CORS default
- `src/config/app.config.ts:8` defaults `CORS_ORIGIN` to `*`, which in production allows any website to make cross-origin requests to the API.

### Missing dedicated rate limiting on password reset
- `POST /auth/reset-password` and `POST /admin/auth/reset-password` (`src/modules/auth/presentation/routes/auth.route.ts:15`, `admin-auth.route.ts:14`) have no specific rate-limit configuration (only the global 100 req/min applies).

### User enumeration / privacy leak
- `GET /users/:id` (`src/modules/users/presentation/routes/user.route.ts:16`) is protected by auth but allows **any** authenticated user to fetch **any** other user's profile.

### Arbitrary settings injection
- `PUT /admin/settings` (`src/modules/settings/presentation/controllers/settings.controller.ts:24-29`) blindly writes every body key to the settings store.

### Tight coupling in brand routes
- `src/modules/brands/presentation/routes/brand.route.ts:15,20,25` calls `container.get('user.repository').getPermissions.bind(...)` at **route-registration time**, creating a crash risk if registration order changes.

---

## 4. MISSING FRONTEND PAGES (README vs actual files)

The README documents flat file paths under `public/` and `admin/`, but the actual files live in subdirectories, and the top-level `admin/` directory **does not exist**.

| README Route | README Expected Path | Actual Path |
|---|---|---|
| `/` | `public/index.html` | `public/index.html` |
| `/products` | `public/products.html` | `public/products/products.html` |
| `/product-detail` | `public/product-detail.html` | `public/products/product-detail.html` |
| `/cart` | `public/cart.html` | `public/pages/cart.html` |
| `/checkout` | `public/checkout.html` | `public/pages/checkout.html` |
| `/order-confirmation` | `public/order-confirmation.html` | `public/pages/order-confirmation.html` |
| `/account` | `public/account.html` | `public/pages/account.html` |
| `/wishlist` | `public/wishlist.html` | `public/pages/wishlist.html` |
| `/returns` | `public/returns.html` | `public/pages/returns.html` |
| `/contact` | `public/contact.html` | `public/pages/contact.html` |
| `/login` | `public/login.html` | `public/auths/login.html` |
| `/register` | `public/register.html` | `public/auths/register.html` |
| `/forgot-password` | `public/forgot-password.html` | `public/auths/forgot-password.html` |
| `/reset-password` | `public/reset-password.html` | `public/auths/reset-password.html` |
| `/otp` | `public/otp.html` | `public/auths/otp.html` |
| `/404` | `public/404.html` | `public/errors/404.html` |
| `/admin` | `admin/index.html` | `public/admins/index.html` |
| `/admin/orders` | `admin/orders.html` | `public/admins/products/orders.html` |
| `/admin/order-detail` | `admin/order-detail.html` | `public/admins/products/order-detail.html` |
| `/admin/products` | `admin/products.html` | `public/admins/products/products.html` |
| `/admin/categories` | `admin/categories.html` | `public/admins/products/categories.html` |
| `/admin/inventory` | `admin/inventory.html` | `public/admins/products/inventory.html` |
| `/admin/users` | `admin/users.html` | `public/admins/pages/users.html` |
| `/admin/returns` | `admin/returns.html` | `public/admins/pages/returns.html` |
| `/admin/contact` | `admin/contact.html` | `public/admins/pages/contact.html` |
| `/admin/login` | `admin/login.html` | `public/admins/auth/login.html` |
| `/admin/forgot-password` | `admin/forgot-password.html` | `public/admins/auth/forgot-password.html` |
| `/admin/reset-password` | `admin/reset-password.html` | `public/admins/auth/reset-password.html` |
| `/admin/otp` | `admin/otp.html` | `public/admins/auth/otp.html` |
| `/admin/404` | `admin/404.html` | `public/admins/errors/404.html` |

Additionally, the README references `public/api/config.js` and `admin/api/config.js`, which **do not exist**. The real configs are at:
- `public/apis/main/config.js`
- `public/admins/api/main/config.js`

---

## 5. MISSING BACKEND ENDPOINTS

The following endpoints are called by the frontend JavaScript but are **not implemented** in the backend:

| Missing Endpoint | Used By | File |
|---|---|---|
| `POST /api/orders` | `submitOrder` | `public/apis/products/orders.js:6` |
| `POST /api/inventory/check` | `checkAvailability` | `public/apis/products/inventory.js:21` |
| `GET /api/inventory/:productId` | `fetchInventory` | `public/apis/products/inventory.js:6` |
| `POST /api/payments/:id/confirm` | `confirmPayment` | `public/apis/main/payments.js:25` |
| `GET /api/payments/methods` | `fetchPaymentMethods` | `public/apis/main/payments.js:43` |
| `POST /admin/orders/:id/notes` | `addOrderNote` | `public/admins/api/products/admin-orders.js:60` |
| `GET /admin/orders/:id/status-history` | `fetchOrderStatusHistory` | `public/admins/api/products/admin-orders.js:79` |
| `PUT /admin/inventory/:productId` | `updateInventory` | `public/admins/api/products/admin-inventory.js:23` |

---

## 6. SUGGESTED IMPROVEMENTS

1. **Fix the `userId` mismatch**: Either rename the property in `AuthenticatedUser` to `userId` or update all 9 affected controllers to destructure `id` instead of `userId`.
2. **Apply `API_PREFIX`**: Register routes under `appConfig.API_PREFIX` (e.g., using Fastify prefixing) **or** update the frontend `API_BASE_URL` to remove `/api`.
3. **Webhook hardening**: Read the raw request body before JSON parsing for signature verification (e.g., via `@fastify/raw-body`). Add timestamp validation to the SendByte webhook to prevent replay attacks.
4. **Restrict public order tracking**: Return only a minimal tracking payload (status, ETA) or require a short-lived tracking token.
5. **Lock down CORS**: Change the `CORS_ORIGIN` default from `*` to a specific domain and enforce explicit configuration in production.
6. **Add dedicated rate limiting** to `/auth/reset-password` and `/admin/auth/reset-password`.
7. **Implement the 8 missing endpoints** listed in section 5, or remove/update the corresponding frontend API helpers.
8. **Add Zod validators** to all manually parsed bodies (`StaffController`, `ProductVariantController`, `MediaController`, etc.).
9. **Move `AnalyticsController` to a repository** instead of injecting `PrismaClient` directly.
10. **Stop swallowing errors**: In `AddressController.delete`, catch domain-specific not-found errors and return 404 only for those; let everything else bubble to the global error handler.
11. **Replace list-all-and-filter patterns**: Add `getStaffById` (and similar) to services instead of fetching all records in controllers.
12. **Validate enums/ranges**: Clamp review ratings to 1–5, whitelist return statuses, validate tax rates, etc.
13. **Fix cascade checks**: Prevent category deletion if products are linked (or cascade delete, depending on business rules).
14. **Make low-stock threshold configurable** instead of hardcoding `10`.
15. **Fix README and file structure**: Update the README to match the actual `public/admins/` and `public/apis/` layout, or restructure the repo to match the documented `admin/` and `public/api/` paths.
16. **Align response shapes**: Ensure backend responses match frontend expectations (e.g., cart endpoints should return structures the frontend can destructure without errors).
