import { adminLogout } from '../api/admin-auth.js';
import { navigateTo } from './security.js';

// Check if user is admin (optional: we could verify via token)
// For now, I assume the backend will enforce admin role.
// But I can also check user role from sessionStorage if stored.

export function checkAdminAuth() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        const currentPage = window.location.pathname.split('/').pop() || '/admin';
        navigateTo(`/admin/login?redirect=${encodeURIComponent(currentPage)}`, '/admin/login');
        return false;
    }
    return true;
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            adminLogout();
            navigateTo('/admin/login');
        });
    }
});
