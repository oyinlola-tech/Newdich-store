# Newdich Store

Premium e-commerce storefront and admin dashboard built with vanilla HTML, CSS, and JS modules. The repo ships a complete public shopping flow, plus a full admin management suite.

## Highlights
- Public storefront: home, product listing, product detail, cart, checkout, order confirmation
- Customer account: profile, order history, wishlist, returns
- Auth flows: register, login, OTP verification, password reset
- Admin: dashboard, orders, order detail, products, categories, inventory, users, returns, contact inbox
- Image uploads: up to 10 images per product (admin)
- Clean URLs: `/(page)` and `/admin/(page)`

## Clean URL Routing
All links and redirects use clean paths (no `.html`). Your server must rewrite these to the correct HTML files.

Public routes:
- `/` -> `public/index.html`
- `/products` -> `public/products.html`
- `/product-detail` -> `public/product-detail.html`
- `/cart` -> `public/cart.html`
- `/checkout` -> `public/checkout.html`
- `/order-confirmation` -> `public/order-confirmation.html`
- `/account` -> `public/account.html`
- `/wishlist` -> `public/wishlist.html`
- `/returns` -> `public/returns.html`
- `/contact` -> `public/contact.html`
- `/login` -> `public/login.html`
- `/register` -> `public/register.html`
- `/forgot-password` -> `public/forgot-password.html`
- `/reset-password` -> `public/reset-password.html`
- `/otp` -> `public/otp.html`
- `/404` -> `public/404.html`

Admin routes:
- `/admin` -> `admin/index.html`
- `/admin/orders` -> `admin/orders.html`
- `/admin/order-detail` -> `admin/order-detail.html`
- `/admin/products` -> `admin/products.html`
- `/admin/categories` -> `admin/categories.html`
- `/admin/inventory` -> `admin/inventory.html`
- `/admin/users` -> `admin/users.html`
- `/admin/returns` -> `admin/returns.html`
- `/admin/contact` -> `admin/contact.html`
- `/admin/login` -> `admin/login.html`
- `/admin/forgot-password` -> `admin/forgot-password.html`
- `/admin/reset-password` -> `admin/reset-password.html`
- `/admin/otp` -> `admin/otp.html`
- `/admin/404` -> `admin/404.html`

## Project Structure
```
public/
  api/               # Frontend API helpers
  css/               # base/layout/components/pages
  js/                # Frontend logic
  *.html             # Public pages

admin/
  api/               # Admin API helpers
  css/               # Admin styles
  js/                # Admin logic
  *.html             # Admin pages
```

## CSS Organization
Public styles are split for easier maintenance:
- `public/css/base.css` (reset, tokens, typography)
- `public/css/layout.css` (header, footer, hero)
- `public/css/components.css` (buttons, cards, forms)
- `public/css/pages.css` (page-specific layouts)
- `public/css/style.css` (imports the four files above)

Admin styles live in `admin/css/admin.css`.

## Currency
All UI uses `NGN` and formats with:
```
Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
```

## Categories and Products
- Categories are created only in **Admin -> Categories**.
- Products must use a category from the admin list.
- If no categories exist, products cannot be saved.

## Product Images
- Admin uploads images as files (no URL input).
- Up to **10 images per product**.
- Upload field name: `images` (multiple files).
- Public UI renders the first image when a gallery is provided.

If your backend expects a different field name or response shape, update:
- `admin/js/products-admin.js`
- `admin/api/admin-products.js`
- Public rendering helpers in `public/js/*.js`

## OTP Flow (Email)
Public:
- `POST /auth/otp/request`
- `POST /auth/otp/verify`

Admin:
- `POST /admin/auth/otp/request`
- `POST /admin/auth/otp/verify`

OTP pages:
- `public/otp.html`
- `admin/otp.html`

## Password Reset
Public:
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Admin:
- `POST /admin/auth/forgot-password`
- `POST /admin/auth/reset-password`

The reset token can come from:
- URL hash `#token=...` (preferred)
- OTP verification response (stored in `sessionStorage`)

## Local Development
This is a static frontend. You need a server that can rewrite clean URLs.

Simple option (Node `serve`):
```
npx serve public -s
```
This serves public routes. For admin routes, configure your server to map `/admin/*` to the `admin/` folder or host admin separately under `/admin`.

If you host on Netlify, add a `_redirects` file and map routes to the correct HTML.

## Environment & API
Public API base:
- `public/api/config.js`

Admin API base:
- `admin/api/config.js`

Update these to your backend URL.

## Notes
- If your backend uses different endpoints, update the matching files in:
  - `public/api/`
  - `admin/api/`
- OTP verification tokens are stored in `sessionStorage`.
- Auth tokens and user/admin profiles are stored in `sessionStorage` (per-session only).

## Security
See `SECURITY.md` for reporting guidelines.

Security hardening included in this frontend:
- Safe redirect helper only allows relative paths.
- DOM rendering uses HTML/attribute escaping helpers in `public/js/sanitize.js` and `admin/js/sanitize.js`.
- CSP and referrer meta tags are present in all HTML pages.
- Reset tokens are removed from the URL and stored in `sessionStorage` on load.
- Admin gating in the UI is for UX only; the backend must enforce auth and roles.
