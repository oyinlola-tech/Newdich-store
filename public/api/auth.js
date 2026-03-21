import { API_BASE_URL, getHeaders } from './config.js';

// Login user
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Register user
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Logout user
export function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Check if user is logged in
export function isLoggedIn() {
    return !!localStorage.getItem('authToken');
}

// Get current user from localStorage
export function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}