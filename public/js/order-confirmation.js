import { fetchOrderById } from '../api/orders.js';
import { isLoggedIn } from '../api/auth.js';
import { updateCartCount } from './main.js';

const container = document.getElementById('order-confirmation-container');

// Get order ID from URL
function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('orderId');
    return id ? parseInt(id) : null;
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

// Render order confirmation
function renderOrderConfirmation(order) {
    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.product?.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${escapeHtml(item.product?.name)}">
            </div>
            <div class="order-item-details">
                <span class="item-name">${escapeHtml(item.product?.name)}</span>
                <span class="item-quantity">Quantity: ${item.quantity}</span>
                <span class="item-price">$${item.price.toFixed(2)} each</span>
            </div>
            <div class="order-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    const orderDate = new Date(order.createdAt).toLocaleString();
    const shippingAddress = order.shippingAddress;
    const addressHtml = shippingAddress ? `
        <p>${escapeHtml(shippingAddress.fullName)}</p>
        <p>${escapeHtml(shippingAddress.address)}</p>
        <p>${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.postalCode)}</p>
        <p>${escapeHtml(shippingAddress.phone)}</p>
    ` : '<p>No shipping address provided.</p>';

    const html = `
        <div class="order-confirmation">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Thank You for Your Order!</h2>
            <p class="order-number">Order #${order.id}</p>
            <p>We've received your order and will process it soon.</p>

            <div class="order-details">
                <h3>Order Details</h3>
                <div class="order-summary">
                    <div class="order-date">
                        <strong>Order Date:</strong> ${orderDate}
                    </div>
                    <div class="order-total">
                        <strong>Total:</strong> $${order.total.toFixed(2)}
                    </div>
                </div>

                <h4>Items</h4>
                <div class="order-items">
                    ${itemsHtml}
                </div>

                <h4>Shipping Information</h4>
                <div class="shipping-info">
                    ${addressHtml}
                </div>
            </div>

            <div class="continue-shopping">
                <a href="products.html" class="btn-primary">Continue Shopping</a>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Load order data
async function loadOrder() {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        container.innerHTML = '<p class="error">Invalid order ID.</p>';
        return;
    }

    if (!isLoggedIn()) {
        // If not logged in, maybe redirect or show message
        container.innerHTML = '<p class="error">Please <a href="login.html">log in</a> to view your order.</p>';
        return;
    }

    try {
        container.innerHTML = '<div class="loading">Loading order details...</div>';
        const order = await fetchOrderById(orderId);
        renderOrderConfirmation(order);
    } catch (error) {
        console.error('Error loading order:', error);
        container.innerHTML = '<p class="error">Failed to load order details. Please try again later.</p>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOrder();
    updateCartCount(); // ensure cart count is updated (cart is now empty)
});