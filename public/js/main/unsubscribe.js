import { API_BASE_URL } from '../main/config.js';

const form = document.getElementById('unsubscribe-form');
const emailInput = document.getElementById('unsubscribe-email');
const messageDiv = document.getElementById('unsubscribe-message');

const params = new URLSearchParams(window.location.search);
const email = params.get('email') || '';
const token = params.get('token') || '';

if (emailInput && email) {
    emailInput.value = email;
}

function showMessage(text, isSuccess = false) {
    messageDiv.textContent = text;
    messageDiv.className = isSuccess ? 'success-message' : 'error-message';
    messageDiv.style.display = 'block';
}

if (!token) {
    if (form) form.style.display = 'none';
    showMessage('This unsubscribe link is invalid or expired. Please contact support@telente.site for help.');
} else if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Unsubscribing...';
        try {
            const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            if (response.ok) {
                form.style.display = 'none';
                showMessage(data.message || 'You have been unsubscribed.', true);
            } else {
                showMessage(data.message || 'Unable to unsubscribe. Please try again.');
                button.disabled = false;
                button.textContent = 'Unsubscribe';
            }
        } catch (error) {
            showMessage('Unable to unsubscribe. Please try again.');
            button.disabled = false;
            button.textContent = 'Unsubscribe';
        }
    });
}
