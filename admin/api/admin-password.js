import { API_BASE_URL } from './config.js';

export async function requestAdminPasswordReset(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request reset');
        }
        return await response.json();
    } catch (error) {
        console.error('Admin forgot password error:', error);
        throw error;
    }
}

export async function resetAdminPassword(token, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }
        return await response.json();
    } catch (error) {
        console.error('Admin reset password error:', error);
        throw error;
    }
}


