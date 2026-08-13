import { API_BASE_URL, getHeaders } from './config.js';

const GUEST_CART_KEY = 'telente_guest_cart';

function getGuestCart() {
    try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        return stored ? JSON.parse(stored) : { items: [] };
    } catch {
        return { items: [] };
    }
}

function saveGuestCart(cart) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

function getCartItemKey(item) {
    return `${item.productId || item.id}`;
}

export async function fetchGuestCart() {
    return getGuestCart();
}

export async function addToGuestCart(productId, quantity = 1) {
    const cart = getGuestCart();
    const existing = cart.items.find(item => getCartItemKey(item) === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.items.push({ productId, quantity });
    }
    saveGuestCart(cart);
    return cart;
}

export async function updateGuestCartItem(productId, quantity) {
    const cart = getGuestCart();
    const item = cart.items.find(item => getCartItemKey(item) === productId);
    if (item) {
        item.quantity = quantity;
    }
    saveGuestCart(cart);
    return cart;
}

export async function removeGuestCartItem(productId) {
    const cart = getGuestCart();
    cart.items = cart.items.filter(item => getCartItemKey(item) !== productId);
    saveGuestCart(cart);
    return cart;
}

export function mergeGuestCartOnLogin() {
    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) return;
    
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    guestCart.items.forEach(item => {
        fetch(`${API_BASE_URL}/cart/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ productId: item.productId || item.id, quantity: item.quantity })
        }).catch(() => {});
    });

    localStorage.removeItem(GUEST_CART_KEY);
}

export function getGuestCartCount() {
    const cart = getGuestCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
