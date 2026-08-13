import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../../apis/accounts/addresses.js';
import { getHeaders } from '../../apis/main/config.js';
import { escapeHtml } from '../security/sanitize.js';
import { requireAuth } from '../security/security.js';

requireAuth('/account', 'account');

const container = document.getElementById('addresses-container');
const modal = document.getElementById('address-modal');
const form = document.getElementById('address-form');
const addBtn = document.getElementById('add-address-btn');
const closeBtn = modal.querySelector('.close');
const cancelBtn = document.getElementById('cancel-address');
const message = document.getElementById('address-message');

let currentEditId = null;

async function loadAddresses() {
  try {
    container.innerHTML = '<div class="loading">Loading addresses...</div>';
    const addresses = await fetchAddresses();
    renderAddresses(addresses);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderAddresses(addresses) {
  if (!addresses.length) {
    container.innerHTML = '<div class="empty-state">No addresses saved yet. Add your first address to get started.</div>';
    return;
  }

  container.innerHTML = `
    <div class="addresses-grid">
      ${addresses.map((addr) => `
        <div class="address-card" data-id="${escapeHtml(addr.id)}">
          <div class="address-card-header">
            <strong>${escapeHtml(addr.label || 'Address')}</strong>
            ${addr.isDefault ? '<span class="status-badge active">Default</span>' : ''}
          </div>
          <p>${escapeHtml(addr.fullName || '')}</p>
          <p>${escapeHtml(addr.address || '')}</p>
          <p>${escapeHtml(addr.city || '')}, ${escapeHtml(addr.state || '')} ${escapeHtml(addr.postalCode || '')}</p>
          <p>${escapeHtml(addr.country || '')}</p>
          <p>${escapeHtml(addr.phone || '')}</p>
          <div class="card-actions">
            <button class="btn-edit edit-address-btn" data-id="${escapeHtml(addr.id)}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-delete delete-address-btn" data-id="${escapeHtml(addr.id)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.edit-address-btn').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
  });
  container.querySelectorAll('.delete-address-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this address?')) return;
      try {
        await deleteAddress(btn.getAttribute('data-id'));
        loadAddresses();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function openAddModal() {
  currentEditId = null;
  form.reset();
  message.style.display = 'none';
  modal.style.display = 'flex';
}

async function openEditModal(addressId) {
  currentEditId = addressId;
  const addresses = await fetchAddresses();
  const addr = addresses.find(a => a.id === addressId);
  if (addr) {
    document.getElementById('address-label').value = addr.label || '';
    document.getElementById('address-fullName').value = addr.fullName || '';
    document.getElementById('address-address').value = addr.address || '';
    document.getElementById('address-city').value = addr.city || '';
    document.getElementById('address-state').value = addr.state || '';
    document.getElementById('address-postalCode').value = addr.postalCode || '';
    document.getElementById('address-country').value = addr.country || '';
    document.getElementById('address-phone').value = addr.phone || '';
    document.getElementById('address-default').checked = addr.isDefault || false;
  }
  message.style.display = 'none';
  modal.style.display = 'flex';
}

async function handleSubmit(e) {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const addressData = {
    label: document.getElementById('address-label').value.trim(),
    fullName: document.getElementById('address-fullName').value.trim(),
    address: document.getElementById('address-address').value.trim(),
    city: document.getElementById('address-city').value.trim(),
    state: document.getElementById('address-state').value.trim(),
    postalCode: document.getElementById('address-postalCode').value.trim(),
    country: document.getElementById('address-country').value.trim(),
    phone: document.getElementById('address-phone').value.trim(),
    isDefault: document.getElementById('address-default').checked
  };

  try {
    if (currentEditId) {
      await updateAddress(currentEditId, addressData);
    } else {
      await createAddress(addressData);
    }
    message.textContent = 'Address saved successfully!';
    message.className = 'success-message';
    message.style.display = 'block';
    setTimeout(() => {
      modal.style.display = 'none';
      loadAddresses();
    }, 800);
  } catch (error) {
    message.textContent = error.message;
    message.className = 'error-message';
    message.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

addBtn.addEventListener('click', openAddModal);
closeBtn.addEventListener('click', () => modal.style.display = 'none');
cancelBtn.addEventListener('click', () => modal.style.display = 'none');
form.addEventListener('submit', handleSubmit);
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

document.addEventListener('DOMContentLoaded', loadAddresses);
