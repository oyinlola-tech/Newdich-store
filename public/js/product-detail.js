import { fetchProductById, fetchAllProducts } from '../api/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from './main.js';
import { formatCurrency } from './format.js';

const productDetailContainer = document.getElementById('product-detail');
const relatedGrid = document.getElementById('related-products-grid');

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

    const categoryLabel = product.category ? escapeHtml(product.category) : 'General';
    const productHtml = `
        <div class="product-detail">
            <div class="product-detail-image">
                <img src="${product.image || 'https://via.placeholder.com/600x600?text=No+Image'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="product-detail-info">
                <div class="product-meta">${categoryLabel}</div>
                <h2>${escapeHtml(product.name)}</h2>
                <p class="price">${formatCurrency(product.price)}</p>
                <p class="description">${escapeHtml(product.description)}</p>
                <div class="product-meta-list">
                    ${product.category ? `<span><strong>Category:</strong> ${escapeHtml(product.category)}</span>` : ''}
                    ${product.stock !== undefined ? `<span><strong>Stock:</strong> ${product.stock} units</span>` : ''}
                    <span><strong>Fulfillment:</strong> Standard delivery available</span>
                </div>
                <div class="specs-panel">
                    <h3>Specifications</h3>
                    <div class="specs-grid">
                        <div><strong>SKU</strong> <span>#ND-${product.id}</span></div>
                        <div><strong>Status</strong> <span>${product.stock !== undefined && product.stock > 0 ? 'Available' : 'Limited'}</span></div>
                        <div><strong>Category</strong> <span>${categoryLabel}</span></div>
                        <div><strong>Price</strong> <span>${formatCurrency(product.price)}</span></div>
                    </div>
                </div>
                <div class="detail-actions">
                    <button id="add-to-cart-btn" class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button id="add-to-wishlist-btn" class="btn-wishlist" data-id="${product.id}">
                        <i class="fas fa-heart"></i> Save
                    </button>
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

function renderRelatedProducts(products) {
    if (!relatedGrid) return;
    if (!products || products.length === 0) {
        relatedGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-box-open"></i></div>
                <h3>No related products yet</h3>
                <p>Check back soon for more curated items.</p>
            </div>
        `;
        return;
    }

    relatedGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
            <div class="product-media">
                <img src="${product.image || 'https://via.placeholder.com/600x450?text=No+Image'}" alt="${escapeHtml(product.name)}">
                <span class="product-badge badge-new">Recommended</span>
                <button class="product-quick btn-wishlist" data-id="${product.id}" aria-label="Save">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <div class="product-meta">${product.category ? escapeHtml(product.category) : 'New Arrival'}</div>
                <h4 class="product-title">${escapeHtml(product.name)}</h4>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <a class="btn-add-to-cart" href="product-detail.html?id=${product.id}">View Details</a>
                    <button class="btn-wishlist" data-id="${product.id}" aria-label="Save">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const wishlistButtons = relatedGrid.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            await handleAddToWishlist(productId, button);
        });
    });
}

async function loadRelatedProducts(currentProduct) {
    if (!relatedGrid) return;
    relatedGrid.innerHTML = '<div class="loading">Loading related products...</div>';
    try {
        const allProducts = await fetchAllProducts();
        const related = allProducts
            .filter(p => p.id !== currentProduct.id)
            .filter(p => currentProduct.category ? p.category === currentProduct.category : true)
            .slice(0, 4);
        renderRelatedProducts(related);
    } catch (error) {
        console.error('Error loading related products:', error);
        relatedGrid.innerHTML = '<p class="error">Failed to load related products.</p>';
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
        await loadRelatedProducts(product);
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
