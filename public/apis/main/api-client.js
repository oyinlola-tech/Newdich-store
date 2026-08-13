import { API_BASE_URL, getHeaders } from './config.js';
import { refreshToken } from '../accounts/auth.js';

let refreshPromise = null;

async function authFetch(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const options = { ...init, headers: { ...getHeaders(), ...(init.headers || {}) } };

    let response = await fetch(url, options);

    if (response.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
        if (!refreshPromise) {
            refreshPromise = refreshToken();
        }
        const success = await refreshPromise;
        refreshPromise = null;
        if (success) {
            options.headers = getHeaders();
            response = await fetch(url, options);
        }
    }

    return response;
}

export { authFetch };
