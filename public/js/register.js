import { registerUser, isLoggedIn } from '../api/auth.js';
import { requestOtp } from '../api/otp.js';
import { updateCartCount } from './main.js';
import { getSafeRedirectRoute, cleanRedirectParam, navigateToRoute } from './security.js';
import { initPasswordToggles } from './password-toggle.js';
import { isValidEmail } from './validators.js';

const registerForm = document.getElementById('register-form');
const errorDiv = document.getElementById('register-error');
const successDiv = document.getElementById('register-success');

cleanRedirectParam('/');
initPasswordToggles();

// Check if already logged in
if (isLoggedIn()) {
    // If already logged in, redirect
    const { routeKey, params } = getSafeRedirectRoute('home');
    navigateToRoute(routeKey, params);
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Clear previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields.');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    // Simple email validation (avoid expensive regex backtracking)
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    // Disable button and show loading
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        const data = await registerUser({ name, email, password });
        if (data?.requiresOtp || data?.otpRequired) {
            if (!data.otpToken) {
                try {
                    await requestOtp(email, 'register');
                } catch (e) {
                    // ignore, backend may already send OTP
                }
            }
            sessionStorage.setItem('pendingOtp', JSON.stringify({
                email,
                purpose: 'register',
                otpToken: data.otpToken || null
            }));
            navigateToRoute('otp', { purpose: 'register', email });
            return;
        }
        // Registration successful
        showSuccess('Account created successfully! Redirecting...');
        // Update cart count (if user had items in local storage before login, they'll now be synced)
        await updateCartCount();
        // Redirect after a short delay to show success message
        setTimeout(() => {
            const { routeKey, params } = getSafeRedirectRoute('home');
            navigateToRoute(routeKey, params);
        }, 1500);
    } catch (error) {
        showError(error.message || 'Registration failed. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}


