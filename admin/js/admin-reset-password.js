import { resetAdminPassword } from '../api/admin-password.js';
import { initPasswordToggles } from './password-toggle.js';

const form = document.getElementById('admin-reset-form');
const message = document.getElementById('admin-reset-message');
const errorBox = document.getElementById('admin-reset-error');

function getToken() {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    const hashToken = hashParams.get('token');
    const queryToken = url.searchParams.get('token');
    const storedToken = sessionStorage.getItem('adminResetToken');
    const token = hashToken || queryToken || storedToken;

    if (token && token !== storedToken) {
        sessionStorage.setItem('adminResetToken', token);
    }

    if (hashToken || queryToken) {
        url.hash = '';
        url.searchParams.delete('token');
        history.replaceState({}, document.title, url.pathname + url.search);
    }

    return token;
}

initPasswordToggles();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const password = document.getElementById('admin-password').value;
    const confirm = document.getElementById('admin-confirm-password').value;
    const token = getToken();

    if (!token) {
        errorBox.textContent = 'Reset token missing.';
        errorBox.style.display = 'block';
        return;
    }
    if (!password || password.length < 6) {
        errorBox.textContent = 'Password must be at least 6 characters.';
        errorBox.style.display = 'block';
        return;
    }
    if (password !== confirm) {
        errorBox.textContent = 'Passwords do not match.';
        errorBox.style.display = 'block';
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    try {
        await resetAdminPassword(token, password);
        message.textContent = 'Password updated. You can now log in.';
        message.style.display = 'block';
        form.reset();
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to reset password.';
        errorBox.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
