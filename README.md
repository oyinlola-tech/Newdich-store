# Newdich Store

Premium e‑commerce storefront + admin dashboard built with vanilla HTML, CSS, and JS modules.  
This repo ships a complete public shopping flow and an admin management suite.

## Highlights
- Product listing + detail view
- Cart, checkout, and order confirmation
- Wishlist
- Account profile + order history
- Returns request flow (email OTP gated)
- Admin dashboard: orders, products, users, categories, inventory
- OTP verification (email) for:
  - Registration
  - Password reset
  - Login from unknown device
- Password reset (public + admin)

## Project Structure
```
public/
  api/               # Frontend API helpers
  css/               # Split CSS: base/layout/components/pages
  js/                # Frontend logic
  *.html             # Public pages

admin/
  api/               # Admin API helpers
  css/               # Admin styles
  js/                # Admin logic
  *.html             # Admin pages
```

## CSS Organization
The public styles are split for easier maintenance:
- `public/css/base.css` (reset, tokens, typography)
- `public/css/layout.css` (header, footer, hero)
- `public/css/components.css` (buttons, cards, forms)
- `public/css/pages.css` (page‑specific layouts)
- `public/css/style.css` (imports the four files above)

Admin styles remain in `admin/css/admin.css`.

## Currency
All UI uses **₦ (NGN)** and formats amounts with commas using:
```
Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
```

## OTP Flow (Email)
OTP is used for registration, password reset, and unknown device login.

**Public**
- Request OTP: `POST /auth/otp/request` (used for resend)
- Verify OTP: `POST /auth/otp/verify`

**Admin**
- Request OTP: `POST /admin/auth/otp/request` (used for resend)
- Verify OTP: `POST /admin/auth/otp/verify`

The OTP page is:
- `public/otp.html`
- `admin/otp.html`

## Password Reset
**Public**
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Admin**
- `POST /admin/auth/forgot-password`
- `POST /admin/auth/reset-password`

The reset token can come from:
- URL query `?token=...`
- OTP verification response (stored in sessionStorage)

## Key Pages
**Public**
- `index.html`, `products.html`, `product-detail.html`
- `cart.html`, `checkout.html`, `order-confirmation.html`
- `account.html`, `wishlist.html`, `returns.html`, `settings.html`
- `login.html`, `register.html`, `forgot-password.html`, `reset-password.html`, `otp.html`
- `404.html`

**Admin**
- `index.html`, `orders.html`, `order-detail.html`
- `products.html`, `categories.html`, `inventory.html`, `users.html`, `settings.html`
- `login.html`, `forgot-password.html`, `reset-password.html`, `otp.html`

## Running Locally
This is a static frontend:
1. Open any HTML file directly in your browser, or
2. Serve with a static server (recommended).

Example (Node):
```
npx serve public
```

## Environment & API
Public API base is defined in:
```
public/api/config.js
```
Admin API base is defined in:
```
admin/api/config.js
```

Update these to your backend URL.

## Notes
- If your backend uses different OTP/password endpoints, update:
  - `public/api/otp.js`
  - `public/api/password.js`
  - `admin/api/admin-otp.js`
  - `admin/api/admin-password.js`
- OTP verification stores tokens in `sessionStorage`.

---
If you want the admin CSS split into multiple files or need a deeper UI refresh, just say the word.
