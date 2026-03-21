import { API_BASE_URL, getHeaders } from './config.js';

// Create a payment intent or initialize a payment
export async function createPaymentIntent(paymentData) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/intent`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create payment intent');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

// Confirm a payment
export async function confirmPayment(paymentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/confirm`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm payment');
        }
        return await response.json();
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
}

// Fetch saved payment methods
export async function fetchPaymentMethods() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/methods`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch payment methods');
        const data = await response.json();
        return data.methods || [];
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
    }
}
