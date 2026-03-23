import { API_BASE_URL, getHeaders } from './config.js';

export async function changePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to change password');
        }
        return await response.json();
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
}
