import { submitReturnRequest } from '../api/returns.js';
import { updateCartCount } from './main.js';

const form = document.getElementById('returns-form');
const messageBox = document.getElementById('returns-message');

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `contact-message ${type}`;
    messageBox.style.display = 'block';
}

function enforceAccess() {
    const token = sessionStorage.getItem('authToken');
    const allowed = sessionStorage.getItem('returnsAccess');
    if (!token || !allowed) {
        window.location.href = '/account';
        return false;
    }
    sessionStorage.removeItem('returnsAccess');
    return true;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderId = document.getElementById('order-id').value.trim();
    const email = document.getElementById('returns-email').value.trim();
    const reason = document.getElementById('reason').value;
    const notes = document.getElementById('notes').value.trim();

    if (!orderId || !email || !reason) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        await submitReturnRequest({ orderId, email, reason, notes });
        showMessage('Return request submitted successfully.', 'success');
        form.reset();
    } catch (error) {
        showMessage(error.message || 'Failed to submit return request.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (enforceAccess()) {
        updateCartCount();
    }
});


