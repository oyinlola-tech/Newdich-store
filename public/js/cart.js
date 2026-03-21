import { fetchCart, updateCartItem, removeCartItem } from '../api/cart.js';
import { updateCartCount } from './main.js';
import { formatCurrency } from './format.js';

const cartContainer = document.getElementById('cart-container');

function getProductImage(product) {
    return product?.image || product?.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image';
}

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render cart items
function renderCart(cart) {
    if (!cart.items || cart.items.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <a href="/products" class="btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    const cartHtml = `
        <div class="cart-items">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.items.map(item => `
                        <tr data-item-id="${item.id}">
                            <td class="product-info">
                                <img src="${getProductImage(item.product)}" alt="${escapeHtml(item.product?.name)}">
                                <span>${escapeHtml(item.product?.name)}</span>
                            </td>
                            <td>${formatCurrency(item.product?.price)}</td>
                            <td>
                                <div class="quantity-controls">
                                    <button class="quantity-btn decrease" data-item-id="${item.id}">-</button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-item-id="${item.id}">
                                    <button class="quantity-btn increase" data-item-id="${item.id}">+</button>
                                </div>
                            </td>
                            <td>${formatCurrency(item.product?.price * item.quantity)}</td>
                            <td>
                                <button class="remove-item" data-item-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="cart-summary">
                <div class="cart-total">
                    <strong>Total:</strong> ${formatCurrency(cart.totalPrice)}
                </div>
                <button id="checkout-btn" class="btn-primary">Proceed to Checkout</button>
            </div>
        </div>
    `;

    cartContainer.innerHTML = cartHtml;

    // Attach event listeners
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = btn.getAttribute('data-item-id');
            const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
            let newQty = parseInt(input.value) - 1;
            if (newQty < 1) newQty = 1;
            await updateQuantity(itemId, newQty);
        });
    });

    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = btn.getAttribute('data-item-id');
            const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
            const newQty = parseInt(input.value) + 1;
            await updateQuantity(itemId, newQty);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const itemId = input.getAttribute('data-item-id');
            let newQty = parseInt(input.value);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
            await updateQuantity(itemId, newQty);
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = btn.getAttribute('data-item-id');
            await removeItem(itemId);
        });
    });

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Check if user is logged in (e.g., check auth token)
            const token = localStorage.getItem('authToken');
            if (token) {
                window.location.href = '/checkout';
            } else {
                // Redirect to login with return URL
                window.location.href = `/login?redirect=/checkout`;
            }
        });
    }
}

async function updateQuantity(itemId, newQuantity) {
    try {
        const updatedCart = await updateCartItem(itemId, newQuantity);
        renderCart(updatedCart);
        updateCartCount(); // update header badge
    } catch (error) {
        console.error('Failed to update quantity:', error);
        alert('Could not update quantity. Please try again.');
        // Reload cart to revert
        await loadCart();
    }
}

async function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        try {
            const updatedCart = await removeCartItem(itemId);
            renderCart(updatedCart);
            updateCartCount();
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Could not remove item. Please try again.');
            await loadCart();
        }
    }
}

async function loadCart() {
    try {
        cartContainer.innerHTML = '<div class="loading">Loading cart...</div>';
        const cart = await fetchCart();
        renderCart(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
        cartContainer.innerHTML = '<p class="error">Failed to load cart. Please try again later.</p>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
});


