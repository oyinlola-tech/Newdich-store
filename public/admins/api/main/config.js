// Admin API Configuration - same-origin relative path so it works on any port/host
export const API_BASE_URL = window.__API_BASE__ || '/api';

// Common headers (includes auth token)
export const getHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

