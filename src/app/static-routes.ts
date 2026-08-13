import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appConfig } from '../config/index.js';

const PUBLIC_DIR = join(process.cwd(), 'public');

const HTML_ROUTES: Record<string, string> = {
  '/products': 'products/products.html',
  '/product-detail': 'products/product-detail.html',
  '/cart': 'pages/cart.html',
  '/checkout': 'pages/checkout.html',
  '/order-confirmation': 'pages/order-confirmation.html',
  '/account': 'pages/account.html',
  '/wishlist': 'pages/wishlist.html',
  '/returns': 'pages/returns.html',
  '/contact': 'pages/contact.html',
  '/login': 'auths/login.html',
  '/register': 'auths/register.html',
  '/forgot-password': 'auths/forgot-password.html',
  '/reset-password': 'auths/reset-password.html',
  '/otp': 'auths/otp.html',
  '/admin': 'admins/index.html',
  '/admin/orders': 'admins/products/orders.html',
  '/admin/order-detail': 'admins/products/order-detail.html',
  '/admin/products': 'admins/products/products.html',
  '/admin/categories': 'admins/products/categories.html',
  '/admin/inventory': 'admins/products/inventory.html',
  '/admin/users': 'admins/pages/users.html',
  '/admin/returns': 'admins/pages/returns.html',
  '/admin/contact': 'admins/pages/contact.html',
  '/admin/payment-settings': 'admins/pages/payment-settings.html',
  '/admin/analytics': 'admins/pages/analytics.html',
  '/admin/coupons': 'admins/pages/coupons.html',
  '/admin/newsletter': 'admins/pages/newsletter.html',
  '/admin/admins': 'admins/pages/admins.html',
  '/admin/audit': 'admins/pages/audit.html',
  '/admin/emails': 'admins/pages/emails.html',
  '/admin/achievements': 'admins/pages/achievements.html',
  '/admin/login': 'auths/login.html',
  '/admin/forgot-password': 'auths/forgot-password.html',
  '/admin/reset-password': 'auths/reset-password.html',
  '/admin/otp': 'auths/otp.html',
  '/track': 'pages/track.html',
  '/about': 'pages/about.html',
  '/terms': 'pages/terms.html',
  '/privacy': 'pages/privacy.html',
  '/cookies': 'pages/cookies.html',
  '/faqs': 'pages/faqs.html',
  '/achievements': 'pages/achievements.html',
  '/addresses': 'pages/addresses.html',
  '/notifications': 'pages/notifications.html',
  '/payment-methods': 'pages/payment-methods.html',
  '/reviews': 'pages/reviews.html',
  '/unsubscribe': 'pages/unsubscribe.html',
  '/cancel-order': 'pages/cancel-order.html',
  '/brands': 'products/brands.html',
  '/categories': 'products/categories.html'
};

export function isApiRoute(url: string): boolean {
  return url.startsWith(appConfig.API_PREFIX);
}

export function wantsHtml(request: FastifyRequest): boolean {
  if (isApiRoute(request.url)) return false;
  const accept = request.headers.accept || '';
  return accept.includes('text/html') || accept.includes('*/*') || accept === '';
}

export async function registerStaticRoutes(app: FastifyInstance): Promise<void> {
  const seoScript = '<script type="module" src="/js/main/seo.js"></script>';

  for (const [route, file] of Object.entries(HTML_ROUTES)) {
    app.get(route, async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        let html = await readFile(join(PUBLIC_DIR, file), 'utf-8');
        if (!html.includes('js/main/seo.js')) {
          html = html.replace('</head>', `${seoScript}</head>`);
        }
        return reply.type('text/html').send(html);
      } catch {
        return reply.code(500).type('text/html').send('<h1>500 - Internal Server Error</h1>');
      }
    });
  }

  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    if (isApiRoute(request.url) || !wantsHtml(request)) {
      return reply.code(404).send({
        error: { code: 'NOT_FOUND', message: 'Resource not found' }
      });
    }

    try {
      const isAdminRoute = request.url.startsWith('/admin');
      const errorFile = isAdminRoute ? 'admins/errors/404.html' : 'errors/404.html';
      const html = await readFile(join(PUBLIC_DIR, errorFile), 'utf-8');
      return reply.code(404).type('text/html').send(html);
    } catch {
      return reply.code(404).type('text/html').send('<h1>404 - Not Found</h1>');
    }
  });
}
