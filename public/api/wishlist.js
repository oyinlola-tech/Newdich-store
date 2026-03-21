import { API_BASE_URL, getHeaders } from './config.js';

// Fetch current user's wishlist
export async function fetchWishlist() {
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        const data = await response.json();
        return data.items || data.wishlist || [];
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return [];
    }
}

// Add product to wishlist
export async function addToWishlist(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ productId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add to wishlist');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
}

// Remove item from wishlist
export async function removeFromWishlist(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove from wishlist');
        }
        return true;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
}
