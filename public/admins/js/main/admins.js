import { fetchStaff, createStaff, updateStaff, deleteStaff } from '../../api/accounts/admin-admins.js';
import { checkAdminAuth } from './admin.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
  throw new Error('Admin auth check failed');
}

const staffContainer = document.getElementById('staff-container');
const searchInput = document.getElementById('staff-search');
const createBtn = document.getElementById('create-staff-btn');
const modal = document.getElementById('staff-modal');
const closeModal = modal.querySelector('.close');
const cancelModalBtn = document.getElementById('cancel-modal');
const staffForm = document.getElementById('staff-form');
const staffMessage = document.getElementById('staff-message');

let currentStaff = [];

async function loadStaff(search = '') {
  try {
    staffContainer.innerHTML = '<div class="loading">Loading staff...</div>';
    currentStaff = await fetchStaff(search);
    renderStaff(currentStaff);
  } catch (error) {
    staffContainer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderStaff(staff) {
  if (!staff.length) {
    staffContainer.innerHTML = '<div class="empty-state">No staff members found.</div>';
    return;
  }

  staffContainer.innerHTML = `
    <table class="data-table premium-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${staff.map((member) => `
          <tr>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td><span class="role-badge ${member.role === 'SUPER_ADMIN' ? 'admin' : 'user'}">${escapeHtml(member.role)}</span></td>
            <td><span class="status-badge ${member.status === 'ACTIVE' ? 'active' : 'inactive'}">${escapeHtml(member.status)}</span></td>
            <td>${escapeHtml(member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never')}</td>
            <td class="actions">
              <button class="btn-edit" data-id="${escapeHtml(member.id)}"><i class="fas fa-edit"></i> Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
  });
}

async function openEditModal(staffId) {
  const member = currentStaff.find((s) => s.id === staffId);
  if (!member) return;
  // Simplified: only status toggle for now
  const newStatus = prompt('Enter new status (ACTIVE or SUSPENDED):', member.status);
  if (!newStatus || !['ACTIVE', 'SUSPENDED'].includes(newStatus.toUpperCase())) return;
  try {
    await updateStaff(staffId, { status: newStatus.toUpperCase() });
    loadStaff(searchInput.value.trim());
  } catch (error) {
    alert(error.message);
  }
}

createBtn.addEventListener('click', () => {
  staffForm.reset();
  staffMessage.style.display = 'none';
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

staffForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('staff-name').value.trim();
  const email = document.getElementById('staff-email').value.trim();
  const password = document.getElementById('staff-password').value;
  const role = document.getElementById('staff-role').value;
  const permissions = document.getElementById('staff-permissions').value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const submitBtn = staffForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    await createStaff({ name, email, password, role, permissions });
    staffMessage.textContent = 'Admin created successfully!';
    staffMessage.className = 'profile-message success';
    staffMessage.style.display = 'block';
    setTimeout(() => {
      modal.style.display = 'none';
      loadStaff(searchInput.value.trim());
    }, 1000);
  } catch (error) {
    staffMessage.textContent = error.message;
    staffMessage.className = 'profile-message error';
    staffMessage.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create';
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadStaff(searchInput.value.trim());
});

document.addEventListener('DOMContentLoaded', () => {
  loadStaff();
});
