import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        return data; // should contain { totalOrders, totalProducts, totalUsers, revenue, ... }
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}

export async function fetchRecentOrders(limit = 5) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/recent?limit=${limit}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch recent orders');
        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
    }
}

