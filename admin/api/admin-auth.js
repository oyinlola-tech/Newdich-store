import { API_BASE_URL, getHeaders } from './config.js';

// Admin login
export async function adminLogin(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Admin login failed');
        }
        const data = await response.json();
        if (data.requiresOtp || data.otpRequired) {
            return data;
        }
        if (data.token) {
            sessionStorage.setItem('authToken', data.token);
            if (data.admin) {
                sessionStorage.setItem('admin', JSON.stringify(data.admin));
            }
        }
        return data;
    } catch (error) {
        console.error('Admin login error:', error);
        throw error;
    }
}

// Admin logout
export async function adminLogout() {
    try {
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
    } catch (error) {
        console.error('Admin logout error:', error);
    } finally {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('admin');
    }
}

// Fetch current admin profile
export async function fetchAdminProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch admin profile');
        const data = await response.json();
        return data.admin || data;
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        throw error;
    }
}

