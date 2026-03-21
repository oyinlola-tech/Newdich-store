import { adminLogin } from '../api/admin-auth.js';
import { requestAdminOtp } from '../api/admin-otp.js';

const loginForm = document.getElementById('admin-login-form');
const errorDiv = document.getElementById('admin-login-error');

function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && (redirect.startsWith('http') || redirect.includes('..'))) {
        return redirect;
    }
    return redirect || 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    if (!email || !password) {
        showError('Please fill in all fields.');
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
            window.location.href = `otp.html?purpose=login&email=${encodeURIComponent(email)}`;
            return;
        }
        window.location.href = getRedirectUrl();
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
