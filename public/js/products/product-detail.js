import { fetchProductById, fetchAllProducts } from '../../apis/products/products.js';
import { updateCartCount, handleAddToCart, handleAddToWishlist } from '../main/main.js';
import { formatCurrency } from '../security/format.js';
import { escapeHtml, escapeAttr, sanitizeUrl } from '../security/sanitize.js';

const productDetailContainer = document.getElementById('product-detail');
const relatedGrid = document.getElementById('related-products-grid');

function getProductImages(product) {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
        images.push(...product.images);
    }
    return [...new Set(images)];
}

function getFirstImage(product) {
    const images = getProductImages(product);
    return sanitizeUrl(images[0], 'https://via.placeholder.com/600x600?text=No+Image');
}

function safeId(value) {
    return escapeAttr(value ?? '');
}

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? parseInt(id) : null;
}

function renderProduct(product) {
    if (!product) {
        productDetailContainer.innerHTML = '<p class="error">Product not found.</p>';
        return;
    }

    const categoryLabel = product.category ? escapeHtml(product.category) : 'General';
    const images = getProductImages(product);
    const mainImage = sanitizeUrl(images[0], 'https://via.placeholder.com/600x600?text=No+Image');
    const thumbnails = images.slice(0, 5);
    const productId = safeId(product.id);
    const formattedPrice = formatCurrency(product.price);
    const sku = `#TLT-${escapeHtml(product.id)}`;
    const stock = product.stock !== undefined ? product.stock : 0;
    const inStock = stock > 0;
    const starRating = Math.round(product.rating || 4.5);

    const thumbnailHtml = images.length > 1
        ? thumbnails.map((img, i) => `
            <button type="button" class="gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="View ${i + 1}">
                <img src="${escapeAttr(sanitizeUrl(img, 'https://via.placeholder.com/100x100?text=...'))}" alt="${escapeHtml(product.name)} view ${i + 1}">
            </button>
        `).join('')
        : '';

    const hasVariants = product.variants && product.variants.length > 0;
    const variantOptions = hasVariants
        ? product.variants.map(v => `<option value="${safeId(v.id)}">${escapeHtml(v.name || '')} - ${formatCurrency(v.price)}</option>`).join('')
        : '';

    const starsHtml = '★'.repeat(starRating) + '☆'.repeat(5 - starRating);

    const productHtml = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span class="breadcrumb-sep" aria-hidden="true">/</span>
            <a href="/products">Products</a>
            <span class="breadcrumb-sep" aria-hidden="true">/</span>
            <span class="breadcrumb-current">${escapeHtml(product.name)}</span>
        </nav>

        <div class="product-detail" data-product-id="${productId}">
            <div class="product-detail-gallery">
                <div class="gallery-main">
                    <img src="${escapeAttr(mainImage)}" alt="${escapeHtml(product.name)}" id="gallery-main-img">
                </div>
                ${thumbnailHtml ? `<div class="gallery-thumbs">${thumbnailHtml}</div>` : ''}
            </div>
            <div class="product-detail-info">
                <div class="product-meta">${categoryLabel}</div>
                <h2 class="product-title-detail">${escapeHtml(product.name)}</h2>

                <div class="product-rating">
                    <span class="rating-stars" aria-label="${starRating} of 5 stars">${starsHtml}</span>
                    <span class="rating-count">(42 reviews)</span>
                </div>

                <p class="price-detail">${formattedPrice}</p>

                ${hasVariants ? `
                <div class="variant-selector">
                    <label for="variant-select" class="variant-label">Variant</label>
                    <select id="variant-select" class="variant-select">
                        ${variantOptions}
                    </select>
                </div>
                ` : ''}

                <div class="quantity-row">
                    <label for="quantity" class="quantity-label">Quantity</label>
                    <div class="quantity-controls-detail">
                        <button type="button" class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
                        <input type="number" id="quantity" value="1" min="1" ${!inStock ? 'disabled' : ''}>
                        <button type="button" class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>

                <div class="detail-actions">
                    <button id="add-to-cart-btn" class="btn-add-to-cart" data-id="${productId}" ${!inStock ? 'disabled' : ''}>
                        ${inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button id="add-to-wishlist-btn" class="btn-wishlist" data-id="${productId}">
                        <i class="fas fa-heart"></i><span class="wishlist-text"> Save</span>
                    </button>
                </div>

                <div class="delivery-info">
                    <div class="delivery-item">
                        <i class="fas fa-truck"></i>
                        <span>Nationwide delivery available</span>
                    </div>
                    <div class="delivery-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>30-day return policy</span>
                    </div>
                    <div class="delivery-item">
                        <i class="fas fa-lock"></i>
                        <span>Secure checkout</span>
                    </div>
                </div>

                <div class="product-description">
                    <h3>Description</h3>
                    <p>${escapeHtml(product.description || 'No description available.')}</p>
                </div>

                <div class="specs-panel">
                    <h3>Specifications</h3>
                    <div class="specs-grid">
                        <div><strong>SKU</strong> <span>${sku}</span></div>
                        <div><strong>Status</strong> <span>${inStock ? 'In Stock' : 'Limited'}</span></div>
                        <div><strong>Category</strong> <span>${categoryLabel}</span></div>
                        <div><strong>Price</strong> <span>${formattedPrice}</span></div>
                        ${product.stock !== undefined ? `<div><strong>Stock</strong> <span>${escapeHtml(product.stock)} units</span></div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    productDetailContainer.innerHTML = productHtml;

    const thumbs = productDetailContainer.querySelectorAll('.gallery-thumb');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const index = parseInt(thumb.getAttribute('data-index'));
            const mainImg = document.getElementById('gallery-main-img');
            if (mainImg && images[index]) {
                mainImg.src = escapeAttr(sanitizeUrl(images[index], mainImage));
            }
        });
    });

    const qtyInput = productDetailContainer.querySelector('#quantity');
    const qtyBtns = productDetailContainer.querySelectorAll('.quantity-btn');
    qtyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!qtyInput) return;
            const current = parseInt(qtyInput.value) || 1;
            const action = btn.getAttribute('data-action');
            if (action === 'increase') {
                qtyInput.value = current + 1;
            } else if (action === 'decrease' && current > 1) {
                qtyInput.value = current - 1;
            }
        });
    });

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
