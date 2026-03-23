import { fetchOrderDetails, updateOrderStatus, addOrderNote, fetchOrderStatusHistory } from '../api/admin-orders.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
    // Redirect handled
}

const container = document.getElementById('order-detail-container');
const statusSelect = document.getElementById('order-status-select');
const statusButton = document.getElementById('update-status-btn');
const historyContainer = document.getElementById('status-history');
const noteForm = document.getElementById('order-note-form');
const noteInput = document.getElementById('order-note');
const notesContainer = document.getElementById('order-notes');

const confirmModal = document.getElementById('status-confirm-modal');
const confirmClose = document.getElementById('status-confirm-close');
const confirmYes = document.getElementById('status-confirm-yes');
const confirmNo = document.getElementById('status-confirm-no');
const confirmText = document.getElementById('status-confirm-text');

let pendingStatus = null;

function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId');
}

function renderOrder(order) {
    const itemsHtml = order.items.map(item => `
        <div class="detail-item">
            <div class="detail-item-info">
                <strong>${escapeHtml(item.product?.name)}</strong>
                <span>Qty: ${escapeHtml(item.quantity)}</span>
            </div>
            <div class="detail-item-total">${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="detail-card">
            <h2>Order #${escapeHtml(order.id)}</h2>
            <div class="detail-meta">
                <span><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</span>
                <span><strong>Customer:</strong> ${escapeHtml(order.customerName || order.shippingAddress?.fullName || 'N/A')}</span>
                <span><strong>Total:</strong> ${formatCurrency(order.total)}</span>
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

function renderHistory(history) {
    if (!history || history.length === 0) {
        historyContainer.innerHTML = '<div class="muted-text">No status changes yet.</div>';
        return;
    }
    historyContainer.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-status">${escapeHtml(item.status)}</div>
            <div class="history-meta">${new Date(item.changedAt).toLocaleString()} â€¢ ${escapeHtml(item.changedBy || 'Admin')}</div>
        </div>
    `).join('');
}

function renderNotes(notes = []) {
    if (!notes.length) {
        notesContainer.innerHTML = '<div class="muted-text">No notes yet.</div>';
        return;
    }
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-item">
            <div class="note-text">${escapeHtml(note.text || note.note)}</div>
            <div class="note-meta">${new Date(note.createdAt).toLocaleString()} â€¢ ${escapeHtml(note.author || 'Admin')}</div>
        </div>
    `).join('');
}

async function loadOrder() {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        container.innerHTML = '<p class="error">No order ID provided.</p>';
        return;
    }

    container.innerHTML = '<div class="loading">Loading order...</div>';
    try {
        const [order, history] = await Promise.all([
            fetchOrderDetails(orderId),
            fetchOrderStatusHistory(orderId)
        ]);
        renderOrder(order);
        renderHistory(history);
        renderNotes(order.notes || []);
    } catch (error) {
        container.innerHTML = '<p class="error">Failed to load order details.</p>';
    }
}

statusButton.addEventListener('click', () => {
    pendingStatus = statusSelect.value;
    confirmText.textContent = `Update order status to "${pendingStatus}"?`;
    confirmModal.style.display = 'flex';
});

confirmYes.addEventListener('click', async () => {
    const orderId = getOrderIdFromUrl();
    statusButton.disabled = true;
    statusButton.textContent = 'Updating...';
    confirmModal.style.display = 'none';
    try {
        await updateOrderStatus(orderId, pendingStatus);
        const history = await fetchOrderStatusHistory(orderId);
        renderHistory(history);
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

confirmNo.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

confirmClose.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === confirmModal) confirmModal.style.display = 'none';
});

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = noteInput.value.trim();
    if (!text) return;
    const orderId = getOrderIdFromUrl();
    try {
        await addOrderNote(orderId, text);
        const order = await fetchOrderDetails(orderId);
        renderNotes(order.notes || []);
        noteInput.value = '';
    } catch (error) {
        alert(error.message || 'Failed to add note');
    }
});

document.addEventListener('DOMContentLoaded', loadOrder);


