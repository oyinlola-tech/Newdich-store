import { trackOrder } from '../products/orders.js';

const container = document.getElementById('tracking-container');
const url = new URL(window.location.href);
const orderNumber = url.searchParams.get('orderNumber') || url.searchParams.get('orderId');

async function loadTracking() {
  if (!orderNumber) {
    container.innerHTML = '<div class="error">Please provide an order number.</div>';
    return;
  }

  try {
    const data = await trackOrder(orderNumber);
    const order = data.order;
    const status = order.status || 'PENDING';
    const steps = ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = steps.indexOf(status);

    const timelineHtml = steps.map((step, index) => {
      const isCompleted = index <= currentIndex;
      const isCurrent = index === currentIndex;
      return `
        <div class="tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
          <div class="step-marker">${isCompleted ? '<i class="fas fa-check"></i>' : index + 1}</div>
          <div class="step-label">${step.replace('_', ' ')}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="tracking-page">
        <h2>Tracking Order #${escapeHtml(order.orderNumber)}</h2>
        <div class="tracking-timeline">${timelineHtml}</div>
        <div class="tracking-details">
          <p><strong>Status:</strong> ${escapeHtml(status)}</p>
          <p><strong>Placed:</strong> ${new Date(order.placedAt).toLocaleString()}</p>
          <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}

function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

document.addEventListener('DOMContentLoaded', loadTracking);
