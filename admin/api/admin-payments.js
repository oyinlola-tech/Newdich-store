import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchPayments(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    const url = `${API_BASE_URL}/admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        return data.payments || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
}

export async function refundPayment(paymentId, refundData = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(refundData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to refund payment');
        }
        return await response.json();
    } catch (error) {
        console.error('Error refunding payment:', error);
        throw error;
    }
}

export async function updatePaymentStatus(paymentId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update payment status');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
}


