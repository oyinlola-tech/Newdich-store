import { API_BASE_URL } from './config.js';

export async function requestPasswordReset(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request password reset');
        }
        return await response.json();
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
}

export async function resetPassword(token, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
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
        console.error('Reset password error:', error);
        throw error;
    }
}


