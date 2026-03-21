import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, fetchProductById } from '../api/admin-products.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';

// Ensure admin is logged in
if (!checkAdminAuth()) {
    // Redirect handled in checkAdminAuth
}

let currentProducts = [];
let currentEditId = null; // null = adding, otherwise editing

const productsContainer = document.getElementById('products-container');
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const addProductBtn = document.getElementById('add-product-btn');
const closeModal = document.querySelector('.close');
const cancelModal = document.getElementById('cancel-modal');

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render products table
function renderProducts(products) {
    if (!products || products.length === 0) {
        productsContainer.innerHTML = '<div class="empty-state">No products yet. Add your signature fashion and jewelry pieces to get started.</div>';
        return;
    }

    const tableHtml = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr data-product-id="${product.id}">
                        <td>${product.id}</td>
                        <td><img src="${product.image || 'https://via.placeholder.com/50x50?text=No+Img'}" alt="${escapeHtml(product.name)}" class="product-thumb"></td>
                        <td>${escapeHtml(product.name)}</td>
                        <td>${escapeHtml(product.category)}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td>${product.stock || 0}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    productsContainer.innerHTML = tableHtml;

    // Attach edit and delete handlers
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(btn.getAttribute('data-id')));
    });
}

// Load products from API
async function loadProducts() {
    try {
        productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchAdminProducts();
        currentProducts = products;
        renderProducts(products);
    } catch (error) {
        productsContainer.innerHTML = '<div class="error">Failed to load products. Please try again.</div>';
    }
}

// Open modal for adding new product
function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    modal.style.display = 'flex';
}

// Open modal for editing existing product
async function openEditModal(productId) {
    try {
        // Show loading inside modal? For simplicity, we'll fetch and then populate
        const product = await fetchProductById(productId);
        currentEditId = productId;
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('product-stock').value = product.stock || 0;
        modal.style.display = 'flex';
    } catch (error) {
        alert('Failed to load product details');
    }
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value.trim(),
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        image: document.getElementById('product-image').value.trim(),
        stock: parseInt(document.getElementById('product-stock').value) || 0
    };

    if (!productData.name || isNaN(productData.price) || !productData.category || !productData.description) {
        alert('Please fill in all required fields.');
        return;
    }

    const submitBtn = productForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        if (currentEditId) {
            await updateProduct(currentEditId, productData);
        } else {
            await createProduct(productData);
        }
        // Refresh product list
        await loadProducts();
        closeModalHandler();
    } catch (error) {
        alert(error.message || 'Failed to save product');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle product deletion
async function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
        await deleteProduct(productId);
        await loadProducts();
    } catch (error) {
        alert(error.message || 'Failed to delete product');
    }
}

// Close modal
function closeModalHandler() {
    modal.style.display = 'none';
    productForm.reset();
    currentEditId = null;
}

// Event listeners
addProductBtn.addEventListener('click', openAddModal);
closeModal.addEventListener('click', closeModalHandler);
cancelModal.addEventListener('click', closeModalHandler);
productForm.addEventListener('submit', handleProductSubmit);

// Close modal if clicking outside the content
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModalHandler();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
