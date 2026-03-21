import { API_BASE_URL, getHeaders } from './config.js';

// Submit a new order
export async function submitOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Order submission failed');
        }
        const data = await response.json();
        return data.order; // assume order object with id
    } catch (error) {
        console.error('Order submission error:', error);
        throw error;
    }
}

// Fetch a specific order by ID
export async function fetchOrderById(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        return data.order; // assume order object
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
}

// Fetch user's order history
export async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}



