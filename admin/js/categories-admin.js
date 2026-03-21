import { fetchAdminCategories, createCategory, updateCategory, deleteCategory } from '../api/admin-categories.js';
import { checkAdminAuth } from './admin.js';

if (!checkAdminAuth()) return;

const container = document.getElementById('categories-container');
const modal = document.getElementById('category-modal');
const modalTitle = document.getElementById('category-modal-title');
const form = document.getElementById('category-form');
const addBtn = document.getElementById('add-category-btn');
const closeBtn = modal.querySelector('.close');
const cancelBtn = document.getElementById('cancel-category');

let currentEditId = null;

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderCategories(categories) {
    if (!categories || categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No categories yet. Add your core fashion, jewelry, and accessory groups to keep products organized.</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(cat => `
                    <tr data-id="${cat.id}">
                        <td>${cat.id}</td>
                        <td>${escapeHtml(cat.name)}</td>
                        <td>${escapeHtml(cat.slug || '')}</td>
                        <td>${escapeHtml(cat.description || '')}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${cat.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn-delete" data-id="${cat.id}"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(btn.getAttribute('data-id')));
    });
}

async function loadCategories() {
    try {
        container.innerHTML = '<div class="loading">Loading categories...</div>';
        const categories = await fetchAdminCategories();
        renderCategories(categories);
    } catch (error) {
        container.innerHTML = '<div class="error">Failed to load categories.</div>';
    }
}

function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add Category';
    form.reset();
    modal.style.display = 'flex';
}

async function openEditModal(categoryId) {
    currentEditId = categoryId;
    modalTitle.textContent = 'Edit Category';
    const row = container.querySelector(`tr[data-id="${categoryId}"]`);
    if (row) {
        document.getElementById('category-name').value = row.children[1].textContent;
        document.getElementById('category-slug').value = row.children[2].textContent;
        document.getElementById('category-description').value = row.children[3].textContent;
    }
    modal.style.display = 'flex';
}

async function handleSubmit(e) {
    e.preventDefault();

    const categoryData = {
        name: document.getElementById('category-name').value.trim(),
        slug: document.getElementById('category-slug').value.trim(),
        description: document.getElementById('category-description').value.trim()
    };

    if (!categoryData.name) {
        alert('Please provide a category name.');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        if (currentEditId) {
            await updateCategory(currentEditId, categoryData);
        } else {
            await createCategory(categoryData);
        }
        await loadCategories();
        closeModal();
    } catch (error) {
        alert(error.message || 'Failed to save category');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleDelete(categoryId) {
    if (!confirm('Delete this category?')) return;
    try {
        await deleteCategory(categoryId);
        await loadCategories();
    } catch (error) {
        alert(error.message || 'Failed to delete category');
    }
}

function closeModal() {
    modal.style.display = 'none';
    form.reset();
    currentEditId = null;
}

addBtn.addEventListener('click', openAddModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
form.addEventListener('submit', handleSubmit);

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('DOMContentLoaded', loadCategories);


