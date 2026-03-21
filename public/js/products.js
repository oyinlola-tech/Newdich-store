import { fetchAllProducts } from '../api/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from './main.js';
import { formatCurrency } from './format.js';

let currentProducts = [];
let currentFilters = {
    category: 'all',
    search: '',
    minPrice: '',
    maxPrice: ''
};

const productsGrid = document.getElementById('products-grid');
const filterCategory = document.getElementById('filter-category');
const filterSearch = document.getElementById('filter-search');
const filterMinPrice = document.getElementById('filter-min-price');
const filterMaxPrice = document.getElementById('filter-max-price');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

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

// Render products in grid
function renderProducts(products) {
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-box-open"></i></div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or check back soon.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => {
        const categoryLabel = product.category ? escapeHtml(product.category) : 'New Arrival';
        let badgeText = 'New';
        if (product.featured) badgeText = 'Featured';
        if (product.stock !== undefined && product.stock !== null && product.stock <= 5) badgeText = 'Low Stock';
        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-media">
                <img src="${product.image || 'https://via.placeholder.com/600x450?text=No+Image'}" alt="${escapeHtml(product.name)}">
                <span class="product-badge">${badgeText}</span>
                <button class="product-quick btn-wishlist" data-id="${product.id}" aria-label="Save">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <div class="product-meta">${categoryLabel}</div>
                <h4 class="product-title">${escapeHtml(product.name)}</h4>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="btn-wishlist" data-id="${product.id}" aria-label="Save">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Attach event listeners to add-to-cart buttons
    const addButtons = document.querySelectorAll('.btn-add-to-cart');
    addButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            await handleAddToCart(productId, button);
        });
    });

    const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            await handleAddToWishlist(productId, button);
        });
    });
}

// Fetch and render products based on current filters
async function loadProducts() {
    try {
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchAllProducts(currentFilters);
        currentProducts = products;
        renderProducts(currentProducts);

        // Populate category dropdown dynamically if needed
        if (filterCategory.options.length === 1) { // only "All Categories" present
            const categories = [...new Set(products.map(p => p.category).filter(c => c))];
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                filterCategory.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
    }
}

// Apply filters from UI
function applyFilters() {
    currentFilters = {
        category: filterCategory.value,
        search: filterSearch.value.trim(),
        minPrice: filterMinPrice.value.trim(),
        maxPrice: filterMaxPrice.value.trim()
    };
    loadProducts();
}

// Reset filters
function resetFilters() {
    filterCategory.value = 'all';
    filterSearch.value = '';
    filterMinPrice.value = '';
    filterMaxPrice.value = '';
    currentFilters = {
        category: 'all',
        search: '',
        minPrice: '',
        maxPrice: ''
    };
    loadProducts();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount(); // from main.js

    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
});
