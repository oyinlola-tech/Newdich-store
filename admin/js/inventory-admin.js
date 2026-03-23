import { fetchInventoryList, updateInventory } from '../api/admin-inventory.js';
import { checkAdminAuth } from './admin.js';
import { escapeHtml, escapeAttr } from './sanitize.js';

if (!checkAdminAuth()) return;

const container = document.getElementById('inventory-container');
const searchInput = document.getElementById('inventory-search');
const lowStockSelect = document.getElementById('low-stock');
const applyBtn = document.getElementById('apply-inventory');
const resetBtn = document.getElementById('reset-inventory');

const modal = document.getElementById('inventory-modal');
const closeBtn = modal.querySelector('.close');
const cancelBtn = document.getElementById('cancel-inventory');
const form = document.getElementById('inventory-form');

let currentProductId = null;

function renderInventory(items) {
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="empty-state">No inventory yet. Once products are live, stock levels will appear here.</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr data-id="${escapeAttr(item.productId)}">
                        <td>${escapeHtml(item.productId)}</td>
                        <td>${escapeHtml(item.productName || '')}</td>
                        <td>${escapeHtml(item.stock ?? 0)}</td>
                        <td>${escapeHtml(item.status || 'in_stock')}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${escapeAttr(item.productId)}"><i class="fas fa-edit"></i> Update</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
}

async function loadInventory(filters = {}) {
    try {
        container.innerHTML = '<div class="loading">Loading inventory...</div>';
        const items = await fetchInventoryList(filters);
        renderInventory(items);
    } catch (error) {
        container.innerHTML = '<div class="error">Failed to load inventory.</div>';
    }
}

function applyFilters() {
    loadInventory({
        search: searchInput.value.trim(),
        lowStock: lowStockSelect.value
    });
}

function resetFilters() {
    searchInput.value = '';
    lowStockSelect.value = '';
    loadInventory({});
}

function openEditModal(productId) {
    currentProductId = productId;
    const row = container.querySelector(`tr[data-id="${productId}"]`);
    if (row) {
        document.getElementById('inventory-stock').value = row.children[2].textContent;
        document.getElementById('inventory-status').value = row.children[3].textContent;
    }
    modal.style.display = 'flex';
}

async function handleSubmit(e) {
    e.preventDefault();
    const stock = parseInt(document.getElementById('inventory-stock').value);
    const status = document.getElementById('inventory-status').value;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        await updateInventory(currentProductId, { stock, status });
        await loadInventory({
            search: searchInput.value.trim(),
            lowStock: lowStockSelect.value
        });
        closeModal();
    } catch (error) {
        alert(error.message || 'Failed to update inventory');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function closeModal() {
    modal.style.display = 'none';
    form.reset();
    currentProductId = null;
}

applyBtn.addEventListener('click', applyFilters);
resetBtn.addEventListener('click', resetFilters);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
form.addEventListener('submit', handleSubmit);

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('DOMContentLoaded', () => loadInventory({}));


