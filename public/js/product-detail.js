import { fetchProductById } from '../api/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from './main.js';
import { formatCurrency } from './format.js';

const productDetailContainer = document.getElementById('product-detail');

// Get product ID from URL query parameter
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? parseInt(id) : null;
}

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

// Render product details
function renderProduct(product) {
    if (!product) {
        productDetailContainer.innerHTML = '<p class="error">Product not found.</p>';
        return;
    }

    const productHtml = `
        <div class="product-detail">
            <div class="product-detail-image">
                <img src="${product.image || 'https://via.placeholder.com/500x500?text=No+Image'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="product-detail-info">
                <h2>${escapeHtml(product.name)}</h2>
                <p class="price">${formatCurrency(product.price)}</p>
                <p class="description">${escapeHtml(product.description)}</p>
                ${product.category ? `<p class="category"><strong>Category:</strong> ${escapeHtml(product.category)}</p>` : ''}
                ${product.stock !== undefined ? `<p class="stock"><strong>Stock:</strong> ${product.stock} units</p>` : ''}
                <div class="detail-actions">
                    <button id="add-to-cart-btn" class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button id="add-to-wishlist-btn" class="btn-wishlist" data-id="${product.id}"><i class="fas fa-heart"></i> Save</button>
                </div>
            </div>
        </div>
    `;

    productDetailContainer.innerHTML = productHtml;

    // Attach add-to-cart event
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = addBtn.getAttribute('data-id');
            await handleAddToCart(productId, addBtn);
        });
    }

    const wishlistBtn = document.getElementById('add-to-wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = wishlistBtn.getAttribute('data-id');
            await handleAddToWishlist(productId, wishlistBtn);
        });
    }
}

// Load product data
async function loadProduct() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        productDetailContainer.innerHTML = '<p class="error">No product ID specified.</p>';
        return;
    }

    try {
        productDetailContainer.innerHTML = '<div class="loading">Loading product details...</div>';
        const product = await fetchProductById(productId);
        renderProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        productDetailContainer.innerHTML = '<p class="error">Failed to load product details. Please try again later.</p>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    updateCartCount(); // from main.js
});
