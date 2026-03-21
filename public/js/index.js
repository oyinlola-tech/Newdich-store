import { fetchFeaturedProducts } from '../api/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from './main.js';
import { formatCurrency } from './format.js';

const productGrid = document.getElementById('featured-products-grid');
const heroFeaturedCard = document.getElementById('hero-featured-card');

async function loadFeaturedProducts() {
    try {
        productGrid.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchFeaturedProducts(4);
        
        if (!products || products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-box-open"></i></div>
                    <h3>No featured products yet</h3>
                    <p>Check back soon for new arrivals.</p>
                </div>
            `;
            return;
        }
        
        // Render product cards
        productGrid.innerHTML = products.map(product => {
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

        if (heroFeaturedCard) {
            const highlight = products[0];
            if (highlight) {
                heroFeaturedCard.innerHTML = `
                    <div class="product-media">
                        <img src="${highlight.image || 'https://via.placeholder.com/600x450?text=No+Image'}" alt="${escapeHtml(highlight.name)}">
                        <span class="product-badge">Featured</span>
                    </div>
                    <div class="product-body">
                        <div class="product-meta">${highlight.category ? escapeHtml(highlight.category) : 'New Arrival'}</div>
                        <h4 class="product-title">${escapeHtml(highlight.name)}</h4>
                        <div class="product-price">${formatCurrency(highlight.price)}</div>
                        <div class="product-actions">
                            <a class="btn-add-to-cart" href="product-detail.html?id=${highlight.id}">View Details</a>
                            <button class="btn-wishlist" data-id="${highlight.id}" aria-label="Save">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                heroFeaturedCard.innerHTML = '<div class="empty-state"><h3>No featured products</h3></div>';
            }
        }
        
        // Attach event listeners
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
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        productGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    updateCartCount(); // from main.js
});
