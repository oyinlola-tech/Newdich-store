import { API_BASE_URL } from './config.js';

export async function requestAdminOtp(email, purpose) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/otp/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request verification code');
        }
        return await response.json();
    } catch (error) {
        console.error('Admin verification code request error:', error);
        throw error;
    }
}

export async function verifyAdminOtp(email, code, purpose, otpToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, purpose, otpToken })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to verify code');
        }
        return await response.json();
    } catch (error) {
        console.error('Admin verification code verify error:', error);
        throw error;
    }
}
