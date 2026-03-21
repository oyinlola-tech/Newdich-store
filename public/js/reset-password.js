import { resetPassword } from '../api/password.js';
import './footer-year.js';

const form = document.getElementById('reset-password-form');
const message = document.getElementById('reset-message');
const errorBox = document.getElementById('reset-error');

function getToken() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || sessionStorage.getItem('resetToken');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
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
        await resetPassword(token, password);
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


