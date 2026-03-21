import { fetchAdminOrders, fetchOrderDetails, updateOrderStatus } from '../api/admin-orders.js';
import { checkAdminAuth } from './admin.js';

if (!checkAdminAuth()) return;

let currentOrders = [];
let currentFilters = {
    status: 'all',
    search: ''
};

const ordersContainer = document.getElementById('orders-container');
const statusFilter = document.getElementById('status-filter');
const searchFilter = document.getElementById('search-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const modal = document.getElementById('order-modal');
const closeModal = modal.querySelector('.close');
const orderDetailsContent = document.getElementById('order-details-content');

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

async function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = '<p>No orders found.</p>';
        return;
    }

    const tableHtml = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${escapeHtml(order.customerName)}</td>
                            <td>${formatDate(order.createdAt)}</td>
                            <td>$${order.total.toFixed(2)}</td>
                            <td>
                                <select class="status-select" data-order-id="${order.id}" data-current-status="${order.status}">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td class="actions">
                                <button class="btn-view" data-order-id="${order.id}"><i class="fas fa-eye"></i> View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    ordersContainer.innerHTML = tableHtml;

    // Attach status change handlers
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const orderId = select.getAttribute('data-order-id');
            const newStatus = select.value;
            try {
                await updateOrderStatus(orderId, newStatus);
                // Refresh the list
                await loadOrders();
            } catch (error) {
                alert(error.message || 'Failed to update status');
                // Reset select to previous value
                select.value = select.getAttribute('data-current-status');
            }
        });
    });

    // Attach view handlers
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const orderId = btn.getAttribute('data-order-id');
            await openOrderModal(orderId);
        });
    });
}

async function openOrderModal(orderId) {
    modal.style.display = 'flex';
    orderDetailsContent.innerHTML = '<div class="loading">Loading order details...</div>';
    try {
        const order = await fetchOrderDetails(orderId);
        renderOrderDetails(order);
    } catch (error) {
        orderDetailsContent.innerHTML = '<div class="error">Failed to load order details.</div>';
    }
}

function renderOrderDetails(order) {
    const itemsHtml = order.items.map(item => `
        <div class="order-detail-item">
            <span class="item-name">${escapeHtml(item.product?.name)}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
            <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const html = `
        <div class="order-info">
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${escapeHtml(order.shippingAddress.fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(order.shippingAddress.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(order.shippingAddress.phone)}</p>
            <p><strong>Address:</strong> ${escapeHtml(order.shippingAddress.address)}, ${escapeHtml(order.shippingAddress.city)} ${escapeHtml(order.shippingAddress.postalCode)}</p>
            <h4>Items</h4>
            <div class="order-items-list">
                ${itemsHtml}
            </div>
        </div>
    `;
    orderDetailsContent.innerHTML = html;
}

async function loadOrders() {
    try {
        ordersContainer.innerHTML = '<div class="loading">Loading orders...</div>';
        const orders = await fetchAdminOrders(currentFilters);
        currentOrders = orders;
        await renderOrders(orders);
    } catch (error) {
        ordersContainer.innerHTML = '<div class="error">Failed to load orders. Please try again.</div>';
    }
}

function applyFilters() {
    currentFilters = {
        status: statusFilter.value,
        search: searchFilter.value.trim()
    };
    loadOrders();
}

function resetFilters() {
    statusFilter.value = 'all';
    searchFilter.value = '';
    currentFilters = { status: 'all', search: '' };
    loadOrders();
}

// Event listeners
applyFiltersBtn.addEventListener('click', applyFilters);
resetFiltersBtn.addEventListener('click', resetFilters);

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});