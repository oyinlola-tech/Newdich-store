const ADMIN_ROUTES = {
    adminHome: { path: '/admin' },
    adminOrders: { path: '/admin/orders' },
    adminOrderDetail: { path: '/admin/order-detail', params: ['orderId'] },
    adminProducts: { path: '/admin/products' },
    adminCategories: { path: '/admin/categories' },
    adminInventory: { path: '/admin/inventory' },
    adminUsers: { path: '/admin/users' },
    adminReturns: { path: '/admin/returns' },
    adminContact: { path: '/admin/contact' },
    adminLogin: { path: '/admin/login', params: ['redirect'] },
    adminForgotPassword: { path: '/admin/forgot-password' },
    adminResetPassword: { path: '/admin/reset-password', params: ['token'] },
    adminOtp: { path: '/admin/otp', params: ['purpose', 'email', 'redirect'] },
    adminNotFound: { path: '/admin/404' }
};

const PATH_TO_KEY = new Map(
    Object.entries(ADMIN_ROUTES).map(([key, route]) => [route.path, key])
);

function getRouteKeyFromPath(path, fallbackKey = 'adminHome') {
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

function buildUrl(routeKey, params = {}, fallbackKey = 'adminHome') {
    const route = ADMIN_ROUTES[routeKey] || ADMIN_ROUTES[fallbackKey];
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

export function sanitizeRedirect(redirect, fallbackPath = '/admin') {
    const fallbackKey = getRouteKeyFromPath(fallbackPath, 'adminHome');
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
    (ADMIN_ROUTES[routeKey].params || []).forEach((key) => {
        const safeValue = sanitizeParamValue(url.searchParams.get(key));
        if (safeValue !== null) params[key] = safeValue;
    });
    return buildUrl(routeKey, params, fallbackKey);
}

export function getSafeRedirectRoute(fallbackKey = 'adminHome') {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const safe = sanitizeRedirect(redirect, ADMIN_ROUTES[fallbackKey].path);
    const url = new URL(safe, window.location.origin);
    const routeKey = PATH_TO_KEY.get(url.pathname) || fallbackKey;
    const routeParams = {};
    (ADMIN_ROUTES[routeKey].params || []).forEach((key) => {
        const safeValue = sanitizeParamValue(url.searchParams.get(key));
        if (safeValue !== null) routeParams[key] = safeValue;
    });
    return { routeKey, params: routeParams };
}

export function cleanRedirectParam(fallbackPath = '/admin') {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('redirect');
    if (!redirect) return;
    const safe = sanitizeRedirect(redirect, fallbackPath);
    if (safe !== redirect) {
        url.searchParams.delete('redirect');
        history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
}

export function navigateToRoute(routeKey, params = {}, fallbackKey = 'adminHome') {
    const target = buildUrl(routeKey, params, fallbackKey);
    window.location.assign(target);
}
