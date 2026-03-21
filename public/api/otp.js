import { API_BASE_URL } from './config.js';

export async function requestOtp(email, purpose) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request OTP');
        }
        return await response.json();
    } catch (error) {
        console.error('OTP request error:', error);
        throw error;
    }
}

export async function verifyOtp(email, code, purpose, otpToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, purpose, otpToken })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to verify OTP');
        }
        return await response.json();
    } catch (error) {
        console.error('OTP verify error:', error);
        throw error;
    }
}

