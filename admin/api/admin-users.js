import { API_BASE_URL, getHeaders } from './config.js';

// Fetch all users (admin view) with optional search
export async function fetchAdminUsers(search = '') {
    const url = `${API_BASE_URL}/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Fetch a single user by ID
export async function fetchUserById(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Update user role and/or status
export async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user');
        }
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}