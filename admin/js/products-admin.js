import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, fetchProductById } from '../api/admin-products.js';
import { fetchAdminCategories } from '../api/admin-categories.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';

// Ensure admin is logged in
if (!checkAdminAuth()) {
    // Redirect handled in checkAdminAuth
}

let currentProducts = [];
let currentEditId = null; // null = adding, otherwise editing
let cachedCategories = [];

const productsContainer = document.getElementById('products-container');
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const productImagesInput = document.getElementById('product-images');
const existingImagesContainer = document.getElementById('existing-images');
const categorySelect = document.getElementById('product-category');
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

function getPrimaryImage(product) {
    return product?.image || product?.images?.[0];
}

function getImageCount(product) {
    if (Array.isArray(product?.images)) return product.images.length;
    return product?.image ? 1 : 0;
}

async function loadCategories() {
    try {
        const categories = await fetchAdminCategories();
        cachedCategories = categories || [];
        populateCategorySelect();
    } catch (error) {
        cachedCategories = [];
        populateCategorySelect();
    }
}

function populateCategorySelect(selectedValue = '') {
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    if (!cachedCategories.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No categories available';
        option.disabled = true;
        categorySelect.appendChild(option);
        return;
    }
    cachedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        option.dataset.id = category.id;
        if (selectedValue && selectedValue === category.name) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
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
                        <td>
                            <img src="${getPrimaryImage(product) || 'https://via.placeholder.com/50x50?text=No+Img'}" alt="${escapeHtml(product.name)}" class="product-thumb">
                            <div class="muted-text">(${getImageCount(product)})</div>
                        </td>
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
    productImagesInput.value = '';
    existingImagesContainer.textContent = '';
    populateCategorySelect();
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
        populateCategorySelect(product.category);
        document.getElementById('product-description').value = product.description;
        productImagesInput.value = '';
        document.getElementById('product-stock').value = product.stock || 0;
        const existingImages = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
        if (existingImages.length) {
            existingImagesContainer.textContent = `Existing images: ${existingImages.length}`;
        } else {
            existingImagesContainer.textContent = 'No images uploaded yet.';
        }
        existingImagesContainer.dataset.images = JSON.stringify(existingImages);
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
        stock: parseInt(document.getElementById('product-stock').value) || 0
    };

    if (!productData.name || isNaN(productData.price) || !productData.category || !productData.description) {
        alert('Please fill in all required fields.');
        return;
    }

    const files = Array.from(productImagesInput.files || []);
    if (files.length > 10) {
        alert('You can upload a maximum of 10 images.');
        return;
    }

    let payload = productData;
    if (files.length > 0) {
        const formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
            formData.append(key, String(value));
        });
        files.forEach(file => formData.append('images', file));
        payload = formData;
    } else if (currentEditId) {
        const existingImages = JSON.parse(existingImagesContainer.dataset.images || '[]');
        if (existingImages.length) {
            payload = { ...productData, images: existingImages, image: existingImages[0] };
        }
    }

    const submitBtn = productForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        if (currentEditId) {
            await updateProduct(currentEditId, payload);
        } else {
            await createProduct(payload);
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
    productImagesInput.value = '';
    existingImagesContainer.textContent = '';
    existingImagesContainer.dataset.images = '';
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
