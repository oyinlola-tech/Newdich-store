// Admin API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Common headers (includes auth token)
export const getHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

