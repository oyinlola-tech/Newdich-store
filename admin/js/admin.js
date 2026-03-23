import { adminLogout } from '../api/admin-auth.js';

// Check if user is admin (optional: we could verify via token)
// For now, we assume the backend will enforce admin role.
// But we can also check user role from sessionStorage if stored.

export function checkAdminAuth() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        const currentPage = window.location.pathname.split('/').pop() || '/admin';
        window.location.href = `/admin/login?redirect=${encodeURIComponent(currentPage)}`;
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
            window.location.href = '/admin/login';
        });
    }
});


