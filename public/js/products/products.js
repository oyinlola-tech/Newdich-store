import { fetchAllProducts } from '../../apis/products/products.js';
import { fetchCategories } from '../../apis/products/categories.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from '../main/main.js';
import { formatCurrency } from '../security/format.js';
import { escapeHtml, escapeAttr, sanitizeUrl } from '../security/sanitize.js';

let currentProducts = [];
let currentFilters = {
    category: 'all',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    discounted: ''
};

const productsGrid = document.getElementById('products-grid');
const filterCategory = document.getElementById('filter-category');
const filterSearch = document.getElementById('filter-search');
const filterMinPrice = document.getElementById('filter-min-price');
const filterMaxPrice = document.getElementById('filter-max-price');
const filterDiscounted = document.getElementById('filter-discounted');
const sortBy = document.getElementById('sort-by');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const relatedGrid = document.getElementById('products-related-grid');
const productCountEl = document.getElementById('product-count');

function getProductImage(product) {
    const url = product?.image || product?.images?.[0];
    return sanitizeUrl(url, 'https://via.placeholder.com/600x450?text=No+Image');
}

function safeId(value) {
    return escapeAttr(value ?? '');
}

// Render products in grid
function renderProducts(products) {
    if (!products || products.length === 0) {
        if (productCountEl) productCountEl.textContent = '0 PRODUCTS';
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
        let badgeClass = 'badge-new';
        if (product.featured) {
            badgeText = 'Featured';
            badgeClass = 'badge-featured';
        }
        if (product.stock !== undefined && product.stock !== null && product.stock <= 5) {
            badgeText = 'Low Stock';
        }
        return `
        <div class="product-card" data-product-id="${safeId(product.id)}">
            <div class="product-media">
                <img src="${escapeAttr(getProductImage(product))}" alt="${escapeHtml(product.name)}">
                <span class="product-badge ${badgeClass}">${badgeText}</span>
                <button class="product-quick btn-wishlist" data-id="${safeId(product.id)}" aria-label="Save">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <div class="product-meta">${categoryLabel}</div>
                <h4 class="product-title">${escapeHtml(product.name)}</h4>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-id="${safeId(product.id)}">Add to Cart</button>
                    <button class="btn-wishlist" data-id="${safeId(product.id)}" aria-label="Save">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    if (productCountEl) productCountEl.textContent = `${products.length} PRODUCTS`;
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

    const related = products.slice(0, 4);
    relatedGrid.innerHTML = related.map(product => {
        const categoryLabel = product.category ? escapeHtml(product.category) : 'New Arrival';
        let badgeText = 'New';
        let badgeClass = 'badge-new';
        if (product.featured) {
            badgeText = 'Featured';
            badgeClass = 'badge-featured';
        }
        return `
            <div class="product-card" data-product-id="${safeId(product.id)}">
                <div class="product-media">
                    <img src="${escapeAttr(getProductImage(product))}" alt="${escapeHtml(product.name)}">
                    <span class="product-badge ${badgeClass}">${badgeText}</span>
                    <button class="product-quick btn-wishlist" data-id="${safeId(product.id)}" aria-label="Save">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-body">
                    <div class="product-meta">${categoryLabel}</div>
                    <h4 class="product-title">${escapeHtml(product.name)}</h4>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-actions">
                    <a class="btn-add-to-cart" href="/product-detail?id=${escapeAttr(encodeURIComponent(product.id ?? ''))}">View Details</a>
                    <button class="btn-wishlist" data-id="${safeId(product.id)}" aria-label="Save">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const wishlistButtons = relatedGrid.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            await handleAddToWishlist(productId, button);
        });
    });
}

async function loadCategories() {
    try {
        const categories = await fetchCategories();
        if (filterCategory.options.length === 1) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name || cat.title || cat.slug || '';
                option.textContent = cat.name || cat.title || cat.slug || 'Category';
                filterCategory.appendChild(option);
            });
        }
        if (filterCategory.dataset.pendingValue) {
            filterCategory.value = filterCategory.dataset.pendingValue;
            delete filterCategory.dataset.pendingValue;
        }
    } catch (error) {
        // If categories fail, keep default "All Categories"
    }
}

// Fetch and render products based on current filters
async function loadProducts() {
    try {
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchAllProducts(currentFilters);
        currentProducts = products;
        renderProducts(currentProducts);
        renderRelatedProducts(currentProducts);
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
        maxPrice: filterMaxPrice.value.trim(),
        sort: sortBy.value,
        discounted: filterDiscounted.value
    };
    syncUrlWithFilters();
    loadProducts();
}

// Reset filters
function resetFilters() {
    filterCategory.value = 'all';
    filterSearch.value = '';
    filterMinPrice.value = '';
    filterMaxPrice.value = '';
    filterDiscounted.value = '';
    sortBy.value = 'newest';
    currentFilters = {
        category: 'all',
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        discounted: ''
    };
    history.replaceState({}, document.title, '/products');
    loadProducts();
}

// Read initial filters from the URL (?filter=new|bestsellers|deals and ?category=...)
function readUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const shortcut = params.get('filter');

    let sort = params.get('sort') || 'newest';
    let discounted = params.get('discounted') || '';

    if (shortcut === 'new') {
        sort = 'newest';
    } else if (shortcut === 'bestsellers') {
        sort = 'featured';
    } else if (shortcut === 'deals') {
        discounted = 'true';
        sort = 'price_desc';
    }

    const filter = {
        category: params.get('category') || 'all',
        search: params.get('search') || '',
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || '',
        sort,
        discounted
    };

    filterCategory.value = filter.category;
    filterSearch.value = filter.search;
    filterMinPrice.value = filter.minPrice;
    filterMaxPrice.value = filter.maxPrice;
    filterDiscounted.value = filter.discounted;
    sortBy.value = filter.sort;
    if (filter.category !== 'all') {
        // The category options load later; keep the raw value for the first request.
        filterCategory.dataset.pendingValue = filter.category;
    }
    currentFilters = filter;
}

function syncUrlWithFilters() {
    const params = new URLSearchParams();
    if (currentFilters.category && currentFilters.category !== 'all') params.set('category', currentFilters.category);
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
    if (currentFilters.sort && currentFilters.sort !== 'newest') params.set('sort', currentFilters.sort);
    if (currentFilters.discounted) params.set('discounted', currentFilters.discounted);
    const query = params.toString();
    history.replaceState({}, document.title, '/products' + (query ? `?${query}` : ''));
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    readUrlFilters();
    loadCategories();
    loadProducts();
    updateCartCount(); // from main.js

    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    sortBy.addEventListener('change', applyFilters);
});


