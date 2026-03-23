export function sanitizeRedirect(redirect, fallback = '/admin') {
    if (!redirect) return fallback;
    if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('..') && !redirect.includes('\\')) {
        return redirect;
    }
    return fallback;
}

export function getSafeRedirect(fallback = '/admin') {
    const params = new URLSearchParams(window.location.search);
    return sanitizeRedirect(params.get('redirect'), fallback);
}
