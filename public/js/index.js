import { fetchFeaturedProducts } from '../api/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from './main.js';

const productGrid = document.getElementById('featured-products-grid');

async function loadFeaturedProducts() {
    try {
        productGrid.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchFeaturedProducts(4);
        
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p>No featured products available at the moment.</p>';
            return;
        }
        
        // Render product cards
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${escapeHtml(product.name)}">
                <h4>${escapeHtml(product.name)}</h4>
                <p class="price">$${product.price.toFixed(2)}</p>
                <div class="card-actions">
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="btn-wishlist" data-id="${product.id}"><i class="fas fa-heart"></i> Save</button>
                </div>
            </div>
        `).join('');
        
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
