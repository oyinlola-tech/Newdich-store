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
        if (data.requiresOtp || data.otpRequired) {
            return data;
        }
        if (data.token) {
            sessionStorage.setItem('authToken', data.token);
            if (data.user) {
                sessionStorage.setItem('user', JSON.stringify(data.user));
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
        if (data.requiresOtp || data.otpRequired) {
            return data;
        }
        if (data.token) {
            sessionStorage.setItem('authToken', data.token);
            if (data.user) {
                sessionStorage.setItem('user', JSON.stringify(data.user));
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
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
}

// Check if user is logged in
export function isLoggedIn() {
    return !!sessionStorage.getItem('authToken');
}

// Get current user from sessionStorage
export function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}


