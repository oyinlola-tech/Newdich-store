import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch cart');
        const data = await response.json();
        // Assume the API returns { items: [...], totalItems: number, totalPrice: number }
        return data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { items: [], totalItems: 0, totalPrice: 0 };
    }
}

export async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ productId, quantity })
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        const data = await response.json();
        return data.cart;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

export async function updateCartItem(itemId, quantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ quantity })
        });
        if (!response.ok) throw new Error('Failed to update cart');
        const data = await response.json();
        return data.cart;
    } catch (error) {
        console.error('Error updating cart:', error);
        throw error;
    }
}

export async function removeCartItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to remove item');
        const data = await response.json();
        return data.cart;
    } catch (error) {
        console.error('Error removing item:', error);
        throw error;
    }
}

