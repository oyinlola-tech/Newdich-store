import { API_BASE_URL, getHeaders } from '../../apis/main/config.js';
import { escapeHtml } from '../security/sanitize.js';
import { requireAuth } from '../security/security.js';

requireAuth('/account', 'account');

const container = document.getElementById('payment-methods-container');

async function loadPaymentMethods() {
  try {
    container.innerHTML = '<div class="loading">Loading payment methods...</div>';
    const response = await fetch(`${API_BASE_URL}/payments/methods`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch payment methods');
    const data = await response.json();
    renderPaymentMethods(data.methods || []);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderPaymentMethods(methods) {
  if (!methods.length) {
    container.innerHTML = '<div class="empty-state">No saved payment methods.</div>';
    return;
  }

  container.innerHTML = `
    <div class="payment-methods-list">
      ${methods.map((method) => `
        <div class="payment-method-card">
          <div class="payment-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="payment-details">
            <h4>${escapeHtml(method.type || 'Card')}</h4>
            <p>**** **** **** ${escapeHtml(method.last4 || '0000')}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadPaymentMethods);
