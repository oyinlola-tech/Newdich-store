import { loginUser, isLoggedIn } from '../api/auth.js';
import { requestOtp } from '../api/otp.js';
import { updateCartCount } from './main.js';
import { getSafeRedirect, cleanRedirectParam, navigateTo } from './security.js';
import { initPasswordToggles } from './password-toggle.js';

const loginForm = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

cleanRedirectParam('/');
initPasswordToggles();

// Check if already logged in
if (isLoggedIn()) {
    // If already logged in, redirect to the intended page
    navigateTo(getSafeRedirect('/'));
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }
    
    // Disable button and show loading
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    try {
        const data = await loginUser({ email, password });
        if (data?.requiresOtp || data?.otpRequired) {
            if (!data.otpToken) {
                try {
                    await requestOtp(email, 'login');
                } catch (e) {
                    // ignore, backend may already send OTP
                }
            }
            sessionStorage.setItem('pendingOtp', JSON.stringify({
                email,
                purpose: 'login',
                otpToken: data.otpToken || null
            }));
            navigateTo(`/otp?purpose=login&email=${encodeURIComponent(email)}`);
            return;
        }
        // After successful login, update cart count (since user may have a cart)
        await updateCartCount();
        // Redirect to intended page
        navigateTo(getSafeRedirect('/'));
    } catch (error) {
        showError(error.message || 'Invalid email or password. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}


