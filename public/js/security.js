export function sanitizeRedirect(redirect, fallback = '/') {
    if (!redirect) return fallback;
    if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('..') && !redirect.includes('\\')) {
        return redirect;
    }
    return fallback;
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
