import { API_BASE_URL, getHeaders } from './config.js';

// Fetch all orders (with optional filters)
export async function fetchAdminOrders(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    const url = `${API_BASE_URL}/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

// Fetch single order details (for modal)
export async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch order details');
        const data = await response.json();
        return data.order;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update order status');
        }
        const data = await response.json();
        return data.order;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}