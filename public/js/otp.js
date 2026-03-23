import { verifyOtp, requestOtp } from '../api/otp.js';
import { updateCartCount } from './main.js';
import { sanitizeRedirect } from './security.js';
import './footer-year.js';

const form = document.getElementById('otp-form');
const message = document.getElementById('otp-message');
const errorBox = document.getElementById('otp-error');
const resendBtn = document.getElementById('resend-otp');

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        email: params.get('email'),
        purpose: params.get('purpose') || 'login'
    };
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.style.display = 'none';
    errorBox.style.display = 'none';

    const code = document.getElementById('otp-code').value.trim();
    const { email, purpose } = getParams();
    const pending = JSON.parse(sessionStorage.getItem('pendingOtp') || '{}');
    const otpToken = pending.otpToken || null;

    if (!email || !code) {
        errorBox.textContent = 'Email or OTP code missing.';
        errorBox.style.display = 'block';
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;

    try {
        const result = await verifyOtp(email, code, purpose, otpToken);
        if (purpose === 'reset') {
            const resetToken = result.resetToken || result.token;
            if (resetToken) {
                sessionStorage.setItem('resetToken', resetToken);
            }
            window.location.href = '/reset-password';
            return;
        }

        if (result.token) {
            sessionStorage.setItem('authToken', result.token);
            if (result.user) {
                sessionStorage.setItem('user', JSON.stringify(result.user));
            }
        }

        sessionStorage.removeItem('pendingOtp');
        message.textContent = 'Verified! Redirecting...';
        message.style.display = 'block';
        await updateCartCount();
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        window.location.href = sanitizeRedirect(redirect, '/');
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to verify OTP.';
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
        await requestOtp(email, purpose);
        message.textContent = 'OTP resent. Check your email.';
        message.style.display = 'block';
    } catch (error) {
        errorBox.textContent = error.message || 'Failed to resend OTP.';
        errorBox.style.display = 'block';
    } finally {
        resendBtn.textContent = 'Resend Code';
        resendBtn.disabled = false;
    }
});


