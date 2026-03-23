import { getUserProfile, updateUserProfile } from '../api/user.js';
import { fetchOrders } from '../api/orders.js';
import { isLoggedIn, logoutUser } from '../api/auth.js';
import { changePassword } from '../api/password-change.js';
import { updateCartCount } from './main.js';
import { formatCurrency } from './format.js';
import { escapeHtml, escapeAttr } from './sanitize.js';
import { navigateTo } from './security.js';
import { initPasswordToggles } from './password-toggle.js';

const container = document.getElementById('account-container');

// Check authentication
if (!isLoggedIn()) {
    navigateTo('/login?redirect=/account');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Render account page
function renderAccountPage(user, orders) {
    const orderHistoryHtml = orders && orders.length > 0 ? orders.map(order => `
        <div class="order-item" data-order-id="${escapeAttr(order.id)}">
            <div class="order-header">
                <span class="order-number">Order #${escapeHtml(order.id)}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
            </div>
            <div class="order-items-preview">
                ${order.items.map(item => `
                    <div class="preview-item">
                        <span class="item-name">${escapeHtml(item.product?.name)}</span>
                        <span class="item-qty">x${escapeHtml(item.quantity)}</span>
                        <span class="item-price">${formatCurrency(item.price)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total:</strong> ${formatCurrency(order.total)}
            </div>
            <a href="/order-confirmation?orderId=${escapeAttr(encodeURIComponent(order.id ?? ''))}" class="view-order-link">View Details</a>
        </div>
    `).join('') : '<p>No orders yet. <a href="/products">Start shopping</a>.</p>';

    const html = `
        <div class="account-page">
            <div class="account-sidebar">
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <h3>${escapeHtml(user.name)}</h3>
                    <p>${escapeHtml(user.email)}</p>
                </div>
                <a href="/returns" class="btn-secondary">Returns & Refunds</a>
                <button id="logout-btn" class="btn-secondary">Logout</button>
            </div>
            <div class="account-main">
                <div class="profile-section">
                    <h3>Profile Information</h3>
                    <form id="profile-form">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" value="${escapeAttr(user.name)}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${escapeAttr(user.email)}" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone (optional)</label>
                            <input type="tel" id="phone" value="${escapeAttr(user.phone || '')}">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Update Profile</button>
                        </div>
                    </form>
                    <div id="profile-message" class="profile-message" style="display: none;"></div>
                </div>

                <div class="profile-section">
                    <h3>Change Password</h3>
                    <form id="password-form">
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input type="password" id="new-password" minlength="6" required>
                        </div>
                        <div class="form-group">
                            <label for="confirm-new-password">Confirm New Password</label>
                            <input type="password" id="confirm-new-password" minlength="6" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Update Password</button>
                        </div>
                    </form>
                    <div id="password-message" class="profile-message" style="display: none;"></div>
                </div>

                <div class="orders-section">
                    <h3>Order History</h3>
                    <div class="orders-list">
                        ${orderHistoryHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initPasswordToggles(container);

    // Attach profile update handler
    const profileForm = document.getElementById('profile-form');
    const profileMessage = document.getElementById('profile-message');

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!name || !email) {
            showMessage(profileMessage, 'Name and email are required.', 'error');
            return;
        }

        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;

        try {
            const updatedUser = await updateUserProfile({ name, email, phone });
            // Update stored user in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            showMessage(profileMessage, 'Profile updated successfully!', 'success');
            // Optionally update the sidebar name/email
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.querySelector('h3').textContent = updatedUser.name || '';
                userInfo.querySelector('p').textContent = updatedUser.email || '';
            }
        } catch (error) {
            showMessage(profileMessage, error.message || 'Failed to update profile.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            navigateTo('/');
        });
    }

    const returnsLink = document.querySelector('.account-sidebar a[href="/returns"]');
    if (returnsLink) {
        returnsLink.addEventListener('click', () => {
            sessionStorage.setItem('returnsAccess', '1');
        });
    }

    // Change password handler
    const passwordForm = document.getElementById('password-form');
    const passwordMessage = document.getElementById('password-message');

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage(passwordMessage, 'Please fill in all fields.', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showMessage(passwordMessage, 'New password must be at least 6 characters.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMessage(passwordMessage, 'New passwords do not match.', 'error');
            return;
        }

        const submitBtn = passwordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;

        try {
            await changePassword(currentPassword, newPassword);
            showMessage(passwordMessage, 'Password updated successfully.', 'success');
            passwordForm.reset();
        } catch (error) {
            showMessage(passwordMessage, error.message || 'Failed to update password.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `profile-message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Load data
async function loadAccount() {
    try {
        container.innerHTML = '<div class="loading">Loading account details...</div>';
        const [user, orders] = await Promise.all([
            getUserProfile(),
            fetchOrders()
        ]);
        renderAccountPage(user, orders);
    } catch (error) {
        console.error('Error loading account:', error);
        container.innerHTML = '<p class="error">Failed to load account details. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAccount();
    updateCartCount();
});


