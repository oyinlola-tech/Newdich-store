import { loginUser, isLoggedIn } from '../api/auth.js';
import { updateCartCount } from './main.js';

const loginForm = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

// Get redirect URL from query parameter (default to index.html)
function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && (redirect.startsWith('http') || redirect.includes('..'))) {
        // Basic security: only allow relative paths
        return redirect;
    }
    return redirect || 'index.html';
}

// Check if already logged in
if (isLoggedIn()) {
    // If already logged in, redirect to the intended page
    window.location.href = getRedirectUrl();
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
        await loginUser({ email, password });
        // After successful login, update cart count (since user may have a cart)
        await updateCartCount();
        // Redirect to intended page
        window.location.href = getRedirectUrl();
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