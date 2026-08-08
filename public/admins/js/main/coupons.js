import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/main/admin-coupons.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
  throw new Error('Admin auth check failed');
}

const couponsContainer = document.getElementById('coupons-container');
const searchInput = document.getElementById('coupon-search');
const createBtn = document.getElementById('create-coupon-btn');
const modal = document.getElementById('coupon-modal');
const closeModal = modal.querySelector('.close');
const cancelModalBtn = document.getElementById('cancel-modal');
const couponForm = document.getElementById('coupon-form');
const couponMessage = document.getElementById('coupon-message');

let currentCoupons = [];

async function loadCoupons(search = '') {
  try {
    couponsContainer.innerHTML = '<div class="loading">Loading coupons...</div>';
    currentCoupons = await fetchCoupons(search);
    renderCoupons(currentCoupons);
  } catch (error) {
    couponsContainer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderCoupons(coupons) {
  if (!coupons.length) {
    couponsContainer.innerHTML = '<div class="empty-state">No coupons found.</div>';
    return;
  }

  couponsContainer.innerHTML = `
    <table class="data-table premium-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Type</th>
          <th>Value</th>
          <th>Balance</th>
          <th>Used</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${coupons.map((coupon) => `
          <tr>
            <td><strong>${escapeHtml(coupon.code)}</strong></td>
            <td>${escapeHtml(coupon.discountType)}</td>
            <td>${escapeHtml(String(coupon.discountValue || 0))}${coupon.discountType === 'PERCENTAGE' ? '%' : ''}</td>
            <td>${escapeHtml(formatCurrency(coupon.balance || 0))}</td>
            <td>${escapeHtml(String(coupon.usedCount || 0))}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
            <td><span class="status-badge ${coupon.status === 'ACTIVE' ? 'active' : 'inactive'}">${escapeHtml(coupon.status)}</span></td>
            <td class="actions">
              <button class="btn-delete" data-id="${escapeHtml(coupon.id)}"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Delete this coupon?')) return;
      try {
        await deleteCoupon(id);
        loadCoupons(searchInput.value.trim());
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

createBtn.addEventListener('click', () => {
  couponForm.reset();
  couponMessage.style.display = 'none';
  modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

cancelModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

couponForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('coupon-type').value;
  const value = parseFloat(document.getElementById('coupon-value').value);
  const balance = document.getElementById('coupon-balance').value;
  const limit = document.getElementById('coupon-limit').value;
  const validUntil = document.getElementById('coupon-valid-until').value;
  const code = document.getElementById('coupon-code').value.trim().toUpperCase();

  const submitBtn = couponForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    await createCoupon({
      code,
      discountType: type,
      discountValue: value,
      balance: type === 'CREDIT' && balance ? parseFloat(balance) : undefined,
      usageLimit: limit ? parseInt(limit) : undefined,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined
    });
    couponMessage.textContent = 'Coupon created successfully!';
    couponMessage.className = 'profile-message success';
    couponMessage.style.display = 'block';
    setTimeout(() => {
      modal.style.display = 'none';
      loadCoupons(searchInput.value.trim());
    }, 1000);
  } catch (error) {
    couponMessage.textContent = error.message;
    couponMessage.className = 'profile-message error';
    couponMessage.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create';
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadCoupons(searchInput.value.trim());
});

document.addEventListener('DOMContentLoaded', () => {
  loadCoupons();
});
