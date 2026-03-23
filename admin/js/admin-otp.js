import { verifyAdminOtp, requestAdminOtp } from '../api/admin-otp.js';
import { sanitizeRedirect, cleanRedirectParam } from './security.js';

const form = document.getElementById('admin-otp-form');
const message = document.getElementById('admin-otp-message');
const errorBox = document.getElementById('admin-otp-error');
const resendBtn = document.getElementById('admin-resend-otp');

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        email: params.get('email'),
        purpose: params.get('purpose') || 'login'
    };
}

cleanRedirectParam('/admin');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const code = document.getElementById('admin-otp-code').value.trim();
    const { email, purpose } = getParams();
    const pending = JSON.parse(sessionStorage.getItem('pendingAdminOtp') || '{}');
    const otpToken = pending.otpToken || null;

    if (!email || !code) {
        errorBox.textContent = 'Email or verification code missing.';
        errorBox.style.display = 'block';
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;

    try {
        const result = await verifyAdminOtp(email, code, purpose, otpToken);
        if (purpose === 'reset') {
            const resetToken = result.resetToken || result.token;
            if (resetToken) {
                sessionStorage.setItem('adminResetToken', resetToken);
            }
            window.location.href = '/admin/reset-password';
            return;
        }

        if (result.token) {
            sessionStorage.setItem('authToken', result.token);
            if (result.admin) {
                sessionStorage.setItem('admin', JSON.stringify(result.admin));
            }
        }

        sessionStorage.removeItem('pendingAdminOtp');
        message.textContent = 'Verified! Redirecting...';
        message.style.display = 'block';
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        window.location.href = sanitizeRedirect(redirect, '/admin');
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to verify code.';
        errorBox.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

resendBtn.addEventListener('click', async () => {
    const { email, purpose } = getParams();
    if (!email) {
        errorBox.textContent = 'Email missing.';
        errorBox.style.display = 'block';
        return;
    }
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    try {
        await requestAdminOtp(email, purpose);
        message.textContent = 'Verification code resent. Check your email.';
        message.style.display = 'block';
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to resend code.';
        errorBox.style.display = 'block';
    } finally {
        resendBtn.textContent = 'Resend Code';
        resendBtn.disabled = false;
    }
});


