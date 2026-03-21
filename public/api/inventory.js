import { API_BASE_URL, getHeaders } from './config.js';

// Fetch inventory for a product
export async function fetchInventory(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${productId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        return data.inventory || data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}

// Check availability for a product and quantity
export async function checkAvailability(productId, quantity = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/check`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ productId, quantity })
        });
        if (!response.ok) throw new Error('Failed to check availability');
        const data = await response.json();
        return data.available ?? data;
    } catch (error) {
        console.error('Error checking availability:', error);
        throw error;
    }
}
