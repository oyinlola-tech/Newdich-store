import { adminLogin } from '../api/admin-auth.js';
import { requestAdminOtp } from '../api/admin-otp.js';
import { getSafeRedirect, cleanRedirectParam, navigateTo } from './security.js';
import { isValidEmail } from './validators.js';
import { initPasswordToggles } from './password-toggle.js';

const loginForm = document.getElementById('admin-login-form');
const errorDiv = document.getElementById('admin-login-error');

cleanRedirectParam('/admin');
initPasswordToggles();

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    errorDiv.style.display = 'none';

    try {
        const data = await adminLogin({ email, password });
        if (data?.requiresOtp || data?.otpRequired) {
            if (!data.otpToken) {
                try {
                    await requestAdminOtp(email, 'login');
                } catch (e) {
                    // ignore, backend may already send OTP
                }
            }
            sessionStorage.setItem('pendingAdminOtp', JSON.stringify({
                email,
                purpose: 'login',
                otpToken: data.otpToken || null
            }));
            navigateTo(`/admin/otp?purpose=login&email=${encodeURIComponent(email)}`);
            return;
        }
        navigateTo(getSafeRedirect('/admin'));
    } catch (error) {
        showError(error.message || 'Invalid credentials. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}


