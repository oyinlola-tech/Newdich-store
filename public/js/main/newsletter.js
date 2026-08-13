import { API_BASE_URL, getHeaders } from '../main/config.js';

function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        if (form.dataset.newsletterInitialized) return;
        form.dataset.newsletterInitialized = 'true';

        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button[type="submit"]');
        if (!input || !button) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (!email) return;

            button.disabled = true;
            button.textContent = '...';
            try {
                const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok) {
                    input.value = '';
                    button.textContent = '✓';
                    setTimeout(() => { button.textContent = '→'; }, 2000);
                } else {
                    button.textContent = '!';
                    setTimeout(() => { button.textContent = '→'; }, 2000);
                }
            } catch (error) {
                button.textContent = '!';
                setTimeout(() => { button.textContent = '→'; }, 2000);
            } finally {
                button.disabled = false;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initNewsletterForms);
