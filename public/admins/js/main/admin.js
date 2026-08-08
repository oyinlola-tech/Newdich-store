import { adminLogout, fetchAdminProfile } from '../../api/accounts/admin-auth.js';
import { navigateToRoute } from './security.js';

export function getAdminProfile() {
    try {
        const raw = sessionStorage.getItem('admin');
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

export function isSuperAdmin() {
    return getAdminProfile()?.role === 'superadmin';
}

export function hasPermission(permission) {
    const profile = getAdminProfile();
    if (!profile) return false;
    if (profile.role === 'superadmin') return true;
    const permissions = Array.isArray(profile.permissions) ? profile.permissions : [];
    // Admins without explicit permissions get full access by default.
    return permissions.length === 0 || permissions.includes(permission);
}

// Hide sidebar links the current admin has no permission for.
export function applySidebarPermissions() {
    const links = document.querySelectorAll('.sidebar-nav a[data-permission]');
    links.forEach((link) => {
        const required = link.getAttribute('data-permission');
        if (required && !hasPermission(required)) {
            link.parentElement.style.display = 'none';
        }
    });

    const superLinks = document.querySelectorAll('.sidebar-nav a[data-superadmin]');
    const isSuper = isSuperAdmin();
    superLinks.forEach((link) => {
        if (!isSuper) {
            link.parentElement.style.display = 'none';
        }
    });
}

// Frontend gate for superadmin-only pages: redirect non-superadmins away.
export function requireSuperAdminPage() {
    if (!isSuperAdmin()) {
        navigateToRoute('adminHome');
        return false;
    }
    return true;
}

// Frontend gate for permission-protected pages.
export function requirePermissionPage(permission) {
    if (!hasPermission(permission)) {
        navigateToRoute('adminHome');
        return false;
    }
    return true;
}

export function checkAdminAuth() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        const currentPage = window.location.pathname.split('/').pop() || '/admin';
        const redirectPath = currentPage === 'admin' ? '/admin' : `/admin/${currentPage}`;
        navigateToRoute('adminLogin', { redirect: redirectPath }, 'adminLogin');
        return false;
    }
    return true;
}

// Refresh the admin profile (permissions) from the server and apply sidebar rules.
export async function refreshAdminProfile() {
    try {
        const profile = await fetchAdminProfile();
        if (profile && profile.id) {
            sessionStorage.setItem('admin', JSON.stringify(profile));
            applySidebarPermissions();
            const nameEl = document.getElementById('admin-name');
            if (nameEl) nameEl.textContent = profile.name || 'Admin';
        }
    } catch (error) {
        console.error('Failed to refresh admin profile:', error);
    }
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            adminLogout();
            navigateToRoute('adminLogin');
        });
    }
});
