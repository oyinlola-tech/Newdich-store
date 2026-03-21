import { fetchWishlist, removeFromWishlist } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';
import { updateCartCount } from './main.js';

const wishlistContainer = document.getElementById('wishlist-container');

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderEmptyState() {
    wishlistContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon"><i class="fas fa-heart"></i></div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love and they will show up here.</p>
            <a href="products.html" class="btn-primary">Browse Products</a>
        </div>
    `;
}

function renderWishlist(items) {
    if (!items || items.length === 0) {
        renderEmptyState();
        return;
    }

    wishlistContainer.innerHTML = `
        <div class="wishlist-grid">
            ${items.map(item => `
                <div class="wishlist-card" data-item-id="${item.id}">
                    <img src="${item.product?.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${escapeHtml(item.product?.name)}">
                    <div class="wishlist-info">
                        <h4>${escapeHtml(item.product?.name)}</h4>
                        <p class="price">$${item.product?.price?.toFixed(2) || '0.00'}</p>
                        <div class="card-actions">
                            <button class="btn-add-to-cart" data-product-id="${item.product?.id}">Add to Cart</button>
                            <button class="btn-secondary btn-remove" data-item-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', async () => {
            const productId = btn.getAttribute('data-product-id');
            btn.disabled = true;
            btn.textContent = 'Adding...';
            try {
                await addToCart(productId, 1);
                updateCartCount();
                btn.textContent = 'Added';
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.disabled = false;
                }, 1500);
            } catch (error) {
                btn.textContent = 'Error';
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.disabled = false;
                }, 1500);
            }
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
            const itemId = btn.getAttribute('data-item-id');
            btn.disabled = true;
            btn.textContent = 'Removing...';
            try {
                await removeFromWishlist(itemId);
                await loadWishlist();
            } catch (error) {
                btn.textContent = 'Error';
                setTimeout(() => {
                    btn.textContent = 'Remove';
                    btn.disabled = false;
                }, 1500);
            }
        });
    });
}

async function loadWishlist() {
    try {
        wishlistContainer.innerHTML = '<div class="loading">Loading wishlist...</div>';
        const items = await fetchWishlist();
        renderWishlist(items);
    } catch (error) {
        wishlistContainer.innerHTML = '<p class="error">Failed to load wishlist. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadWishlist();
    updateCartCount();
});
