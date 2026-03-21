import { logoutUser } from '../../public/api/auth.js';

// Check if user is admin (optional: we could verify via token)
// For now, we assume the backend will enforce admin role.
// But we can also check user role from localStorage if stored.

export function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../public/login.html?redirect=../admin/index.html';
        return false;
    }
    return true;
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            window.location.href = '../public/index.html';
        });
    }
});