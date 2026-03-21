import { API_BASE_URL } from './config.js';

export async function sendContactMessage(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send message');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Contact form error:', error);
        throw error;
    }
}