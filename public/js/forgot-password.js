import { requestPasswordReset } from '../api/password.js';

const form = document.getElementById('forgot-password-form');
const message = document.getElementById('forgot-message');
const errorBox = document.getElementById('forgot-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    if (!email) {
        errorBox.textContent = 'Please enter your email.';
        errorBox.style.display = 'block';
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        await requestPasswordReset(email);
        message.textContent = 'Reset link sent! Check your email.';
        message.style.display = 'block';
        form.reset();
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to send reset link.';
        errorBox.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
