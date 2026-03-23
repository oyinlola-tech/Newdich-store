export function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (ch) => {
        switch (ch) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return ch;
        }
    });
}

export function escapeAttr(value) {
    return escapeHtml(value);
}

export function sanitizeUrl(url, fallback = '') {
    if (!url) return fallback;
    try {
        const parsed = new URL(url, window.location.origin);
        const protocol = parsed.protocol.toLowerCase();
        if (protocol !== 'http:' && protocol !== 'https:') return fallback;
        return parsed.href;
    } catch (error) {
        return fallback;
    }
}
