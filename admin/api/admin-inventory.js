import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchInventoryList(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.lowStock) queryParams.append('lowStock', filters.lowStock);
    const url = `${API_BASE_URL}/admin/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}

export async function updateInventory(productId, inventoryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/inventory/${productId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(inventoryData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update inventory');
        }
        const data = await response.json();
        return data.inventory || data;
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
    }
}
