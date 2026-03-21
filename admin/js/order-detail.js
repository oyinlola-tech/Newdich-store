import { fetchOrderDetails, updateOrderStatus } from '../api/admin-orders.js';
import { checkAdminAuth } from './admin.js';

if (!checkAdminAuth()) {
    // Redirect handled
}

const container = document.getElementById('order-detail-container');
const statusSelect = document.getElementById('order-status-select');
const statusButton = document.getElementById('update-status-btn');

function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderOrder(order) {
    const itemsHtml = order.items.map(item => `
        <div class="detail-item">
            <div class="detail-item-info">
                <strong>${escapeHtml(item.product?.name)}</strong>
                <span>Qty: ${item.quantity}</span>
            </div>
            <div class="detail-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="detail-card">
            <h2>Order #${order.id}</h2>
            <div class="detail-meta">
                <span><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</span>
                <span><strong>Customer:</strong> ${escapeHtml(order.customerName || order.shippingAddress?.fullName || 'N/A')}</span>
                <span><strong>Total:</strong> $${order.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-card">
                <h3>Shipping</h3>
                <p>${escapeHtml(order.shippingAddress?.fullName || '')}</p>
                <p>${escapeHtml(order.shippingAddress?.address || '')}</p>
                <p>${escapeHtml(order.shippingAddress?.city || '')} ${escapeHtml(order.shippingAddress?.postalCode || '')}</p>
                <p>${escapeHtml(order.shippingAddress?.phone || '')}</p>
            </div>
            <div class="detail-card">
                <h3>Items</h3>
                <div class="detail-items">
                    ${itemsHtml}
                </div>
            </div>
        </div>
    `;

    statusSelect.value = order.status || 'pending';
}

async function loadOrder() {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        container.innerHTML = '<p class="error">No order ID provided.</p>';
        return;
    }

    container.innerHTML = '<div class="loading">Loading order...</div>';
    try {
        const order = await fetchOrderDetails(orderId);
        renderOrder(order);
    } catch (error) {
        container.innerHTML = '<p class="error">Failed to load order details.</p>';
    }
}

statusButton.addEventListener('click', async () => {
    const orderId = getOrderIdFromUrl();
    const status = statusSelect.value;
    statusButton.disabled = true;
    statusButton.textContent = 'Updating...';
    try {
        await updateOrderStatus(orderId, status);
        statusButton.textContent = 'Updated';
        setTimeout(() => {
            statusButton.textContent = 'Update Status';
            statusButton.disabled = false;
        }, 1500);
    } catch (error) {
        statusButton.textContent = 'Update Status';
        statusButton.disabled = false;
        alert(error.message || 'Failed to update status');
    }
});

document.addEventListener('DOMContentLoaded', loadOrder);
