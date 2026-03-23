const PUBLIC_ALLOWLIST = new Set([
    '/',
    '/products',
    '/product-detail',
    '/cart',
    '/checkout',
    '/order-confirmation',
    '/account',
    '/wishlist',
    '/returns',
    '/contact',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/otp',
    '/404'
]);

function getPathname(path) {
    try {
        return new URL(path, window.location.origin).pathname;
    } catch (error) {
        return '';
    }
}

export function sanitizeRedirect(redirect, fallback = '/') {
    if (!redirect) return fallback;
    if (!redirect.startsWith('/') || redirect.startsWith('//') || redirect.includes('..') || redirect.includes('\\')) {
        return fallback;
    }
    const pathname = getPathname(redirect);
    return PUBLIC_ALLOWLIST.has(pathname) ? redirect : fallback;
}

export function getSafeRedirect(fallback = '/') {
    const params = new URLSearchParams(window.location.search);
    return sanitizeRedirect(params.get('redirect'), fallback);
}

export function cleanRedirectParam(fallback = '/') {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('redirect');
    if (!redirect) return;
    const safe = sanitizeRedirect(redirect, fallback);
    if (safe !== redirect) {
        url.searchParams.delete('redirect');
        history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
}

export function navigateTo(path, fallback = '/') {
    const safePath = sanitizeRedirect(path, fallback);
    window.location.assign(safePath);
}
