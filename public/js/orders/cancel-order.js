import { API_BASE_URL, getHeaders } from '../apis/main/config.js';
import { escapeHtml } from '../js/security/sanitize.js';

const container = document.getElementById('cancel-order-container');
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

async function loadOrderDetails() {
  if (!orderId) {
    container.innerHTML = '<div class="error">No order specified.</div>';
    return;
  }

  try {
    container.innerHTML = '<div class="loading">Loading order details...</div>';
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    const data = await response.json();
    renderOrderDetails(data.order);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderOrderDetails(order) {
  if (!order) {
    container.innerHTML = '<div class="error">Order not found.</div>';
    return;
  }

  if (!['PENDING', 'PROCESSING'].includes(order.status)) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-ban"></i></div>
        <h3>Cannot Cancel Order</h3>
        <p>This order cannot be cancelled because it is already ${order.status}.</p>
        <a href="/orders" class="btn-primary">View Orders</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="detail-card">
      <h2>Cancel Order #${escapeHtml(order.orderNumber)}</h2>
      <p class="muted-text">Are you sure you want to cancel this order? This action cannot be undone.</p>
      <div class="order-summary" style="margin: 1rem 0;">
        <p><strong>Total:</strong> ${escapeHtml((Number(order.total) || 0).toLocaleString())} ${escapeHtml(order.currency || '')}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
        <p><strong>Placed:</strong> ${order.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}</p>
      </div>
      <div class="detail-actions">
        <button id="confirm-cancel" class="btn-primary" style="background: linear-gradient(135deg, #b42318, #dc2626);">Yes, Cancel Order</button>
        <a href="/orders" class="btn-secondary">Keep Order</a>
      </div>
    </div>
  `;

  document.getElementById('confirm-cancel').addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel order');
      }
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fas fa-check-circle"></i></div>
          <h3>Order Cancelled</h3>
          <p>Your order has been cancelled successfully.</p>
          <a href="/orders" class="btn-primary">View Orders</a>
        </div>
      `;
    } catch (error) {
      alert(error.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', loadOrderDetails);
