import { sendContactMessage } from '../api/contact.js';
import { updateCartCount } from './main.js';

const contactForm = document.getElementById('contact-form');
const messageDiv = document.getElementById('contact-message');

// Helper to show message
function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = `contact-message ${type}`;
    messageDiv.style.display = 'block';
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validation
    if (!name || !email || !subject || !message) {
        showMessage('error', 'Please fill in all fields.');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('error', 'Please enter a valid email address.');
        return;
    }
    
    // Disable button and show loading
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        await sendContactMessage({ name, email, subject, message });
        showMessage('success', 'Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    } catch (error) {
        showMessage('error', error.message || 'Failed to send message. Please try again later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});