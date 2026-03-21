import { adminLogout } from '../api/admin-auth.js';

// Check if user is admin (optional: we could verify via token)
// For now, we assume the backend will enforce admin role.
// But we can also check user role from localStorage if stored.

export function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
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
            window.location.href = 'login.html';
        });
    }
});
