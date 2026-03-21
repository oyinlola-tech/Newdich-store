import { API_BASE_URL, getHeaders } from './config.js';

// Get current user's profile
export async function getUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        return data.user; // assume { id, name, email, ... }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }
        const data = await response.json();
        return data.user; // updated user
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}