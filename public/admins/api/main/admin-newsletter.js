import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchNewsletterSubscribers(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const response = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers?${query.toString()}`, {
        headers: getHeaders()
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load newsletter subscribers');
    }
    return response.json();
}

export async function fetchNewsletterCounts() {
    const response = await fetch(`${API_BASE_URL}/admin/newsletter/counts`, {
        headers: getHeaders()
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load newsletter counts');
    }
    return response.json();
}
