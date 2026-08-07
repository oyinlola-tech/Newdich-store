const PUBLIC_ROUTES = {
    home: { path: '/' },
    products: { path: '/products' },
    productDetail: { path: '/product-detail', params: ['id'] },
    cart: { path: '/cart' },
    checkout: { path: '/checkout' },
    orderConfirmation: { path: '/order-confirmation', params: ['orderId'] },
    account: { path: '/account' },
    wishlist: { path: '/wishlist' },
    returns: { path: '/returns' },
    contact: { path: '/contact' },
    login: { path: '/login', params: ['redirect'] },
    register: { path: '/register', params: ['redirect'] },
    forgotPassword: { path: '/forgot-password' },
    resetPassword: { path: '/reset-password', params: ['token'] },
    otp: { path: '/otp', params: ['purpose', 'email', 'redirect'] },
    notFound: { path: '/404' }
};

const PATH_TO_KEY = new Map(
    Object.entries(PUBLIC_ROUTES).map(([key, route]) => [route.path, key])
);

function getRouteKeyFromPath(path, fallbackKey = 'home') {
    try {
        const pathname = new URL(path, window.location.origin).pathname;
        return PATH_TO_KEY.get(pathname) || fallbackKey;
    } catch (error) {
        return fallbackKey;
    }
}

function sanitizeParamValue(value) {
    if (value === null || value === undefined) return null;
    const str = String(value);
    if (!str || str.length > 200) return null;
    return str;
}

function buildUrl(routeKey, params = {}, fallbackKey = 'home') {
    const route = PUBLIC_ROUTES[routeKey] || PUBLIC_ROUTES[fallbackKey];
    const url = new URL(route.path, window.location.origin);
    const allowed = route.params || [];
    allowed.forEach((key) => {
        const safeValue = sanitizeParamValue(params[key]);
        if (safeValue !== null) {
            url.searchParams.set(key, safeValue);
        }
    });
    const query = url.searchParams.toString();
    return url.pathname + (query ? `?${query}` : '');
}

export function sanitizeRedirect(redirect, fallbackPath = '/') {
    const fallbackKey = getRouteKeyFromPath(fallbackPath, 'home');
    if (!redirect) return buildUrl(fallbackKey);
    if (!redirect.startsWith('/') || redirect.startsWith('//') || redirect.includes('..') || redirect.includes('\\')) {
        return buildUrl(fallbackKey);
    }
    let url;
    try {
        url = new URL(redirect, window.location.origin);
    } catch (error) {
        return buildUrl(fallbackKey);
    }
    const routeKey = PATH_TO_KEY.get(url.pathname);
    if (!routeKey) return buildUrl(fallbackKey);
    const params = {};
    (PUBLIC_ROUTES[routeKey].params || []).forEach((key) => {
        const safeValue = sanitizeParamValue(url.searchParams.get(key));
        if (safeValue !== null) params[key] = safeValue;
    });
    return buildUrl(routeKey, params, fallbackKey);
}

export function getSafeRedirectRoute(fallbackKey = 'home') {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const safe = sanitizeRedirect(redirect, PUBLIC_ROUTES[fallbackKey].path);
    const url = new URL(safe, window.location.origin);
    const routeKey = PATH_TO_KEY.get(url.pathname) || fallbackKey;
    const routeParams = {};
    (PUBLIC_ROUTES[routeKey].params || []).forEach((key) => {
        const safeValue = sanitizeParamValue(url.searchParams.get(key));
        if (safeValue !== null) routeParams[key] = safeValue;
    });
    return { routeKey, params: routeParams };
}

export function cleanRedirectParam(fallbackPath = '/') {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('redirect');
    if (!redirect) return;
    const safe = sanitizeRedirect(redirect, fallbackPath);
    if (safe !== redirect) {
        url.searchParams.delete('redirect');
        history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
}

export function navigateToRoute(routeKey, params = {}, fallbackKey = 'home') {
    const target = buildUrl(routeKey, params, fallbackKey);
    window.location.assign(target);
}
