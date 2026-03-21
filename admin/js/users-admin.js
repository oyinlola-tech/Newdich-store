import { fetchAdminUsers, fetchUserById, updateUser } from '../api/admin-users.js';
import { checkAdminAuth } from './admin.js';

if (!checkAdminAuth()) return;

let currentUsers = [];

const usersContainer = document.getElementById('users-container');
const searchInput = document.getElementById('search-user');
const applySearchBtn = document.getElementById('apply-search');
const resetSearchBtn = document.getElementById('reset-search');

const modal = document.getElementById('user-modal');
const closeModal = modal.querySelector('.close');
const cancelModalBtn = document.getElementById('cancel-modal');
const userForm = document.getElementById('user-form');
const userMessage = document.getElementById('user-message');

let currentUserId = null;

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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

async function renderUsers(users) {
    if (!users || users.length === 0) {
        usersContainer.innerHTML = '<p>No users found.</p>';
        return;
    }

    const tableHtml = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr data-user-id="${user.id}">
                            <td>${user.id}</td>
                            <td>${escapeHtml(user.name)}</td>
                            <td>${escapeHtml(user.email)}</td>
                            <td><span class="role-badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role}</span></td>
                            <td><span class="status-badge ${user.status === 'active' ? 'active' : 'inactive'}">${user.status}</span></td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td class="actions">
                                <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i> Edit</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    usersContainer.innerHTML = tableHtml;

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
}

async function loadUsers(search = '') {
    try {
        usersContainer.innerHTML = '<div class="loading">Loading users...</div>';
        const users = await fetchAdminUsers(search);
        currentUsers = users;
        await renderUsers(users);
    } catch (error) {
        usersContainer.innerHTML = '<div class="error">Failed to load users. Please try again.</div>';
    }
}

async function openEditModal(userId) {
    currentUserId = userId;
    try {
        const user = await fetchUserById(userId);
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-status').value = user.status;
        userMessage.style.display = 'none';
        modal.style.display = 'flex';
    } catch (error) {
        alert('Failed to load user details');
    }
}

async function handleUserUpdate(e) {
    e.preventDefault();

    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;

    const submitBtn = userForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    userMessage.style.display = 'none';

    try {
        await updateUser(currentUserId, { role, status });
        showMessage('User updated successfully!', 'success');
        setTimeout(() => {
            modal.style.display = 'none';
            loadUsers(searchInput.value.trim());
        }, 1500);
    } catch (error) {
        showMessage(error.message || 'Failed to update user', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showMessage(message, type) {
    userMessage.textContent = message;
    userMessage.className = `profile-message ${type}`;
    userMessage.style.display = 'block';
}

function closeModalHandler() {
    modal.style.display = 'none';
    userForm.reset();
    currentUserId = null;
    userMessage.style.display = 'none';
}

// Search handlers
function applySearch() {
    const searchTerm = searchInput.value.trim();
    loadUsers(searchTerm);
}

function resetSearch() {
    searchInput.value = '';
    loadUsers('');
}

// Event listeners
applySearchBtn.addEventListener('click', applySearch);
resetSearchBtn.addEventListener('click', resetSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applySearch();
});

closeModal.addEventListener('click', closeModalHandler);
cancelModalBtn.addEventListener('click', closeModalHandler);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModalHandler();
});
userForm.addEventListener('submit', handleUserUpdate);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});