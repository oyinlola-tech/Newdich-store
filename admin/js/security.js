const ADMIN_ALLOWLIST = new Set([
    '/admin',
    '/admin/orders',
    '/admin/order-detail',
    '/admin/products',
    '/admin/categories',
    '/admin/inventory',
    '/admin/users',
    '/admin/returns',
    '/admin/contact',
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password',
    '/admin/otp',
    '/admin/404'
]);

function getPathname(path) {
    try {
        return new URL(path, window.location.origin).pathname;
    } catch (error) {
        return '';
    }
}

export function sanitizeRedirect(redirect, fallback = '/admin') {
    if (!redirect) return fallback;
    if (!redirect.startsWith('/') || redirect.startsWith('//') || redirect.includes('..') || redirect.includes('\\')) {
        return fallback;
    }
    const pathname = getPathname(redirect);
    return ADMIN_ALLOWLIST.has(pathname) ? redirect : fallback;
}

export function getSafeRedirect(fallback = '/admin') {
    const params = new URLSearchParams(window.location.search);
    return sanitizeRedirect(params.get('redirect'), fallback);
}

export function cleanRedirectParam(fallback = '/admin') {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('redirect');
    if (!redirect) return;
    const safe = sanitizeRedirect(redirect, fallback);
    if (safe !== redirect) {
        url.searchParams.delete('redirect');
        history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
}

export function navigateTo(path, fallback = '/admin') {
    const safePath = sanitizeRedirect(path, fallback);
    window.location.assign(safePath);
}
