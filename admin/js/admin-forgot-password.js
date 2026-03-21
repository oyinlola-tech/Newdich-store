import { requestAdminPasswordReset } from '../api/admin-password.js';

const form = document.getElementById('admin-forgot-form');
const message = document.getElementById('admin-forgot-message');
const errorBox = document.getElementById('admin-forgot-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const email = document.getElementById('admin-email').value.trim();
    if (!email) {
        errorBox.textContent = 'Please enter your email.';
        errorBox.style.display = 'block';
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending code...';
    submitBtn.disabled = true;

    try {
        await requestAdminPasswordReset(email);
        sessionStorage.setItem('pendingAdminOtp', JSON.stringify({
            email,
            purpose: 'reset',
            otpToken: null
        }));
        window.location.href = `/admin/otp?purpose=reset&email=${encodeURIComponent(email)}`;
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to send verification code.';
        errorBox.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});


