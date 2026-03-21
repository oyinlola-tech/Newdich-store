import { fetchCart, addToCart } from '../api/cart.js';
import { addToWishlist } from '../api/wishlist.js';

export async function updateCartCount() {
    try {
        const cart = await fetchCart();
        const totalItems = cart.totalItems || cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    } catch (error) {
        console.error('Failed to update cart count:', error);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) cartCountElement.textContent = '0';
    }
}

export async function handleAddToCart(productId, buttonElement) {
    try {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Adding...';
        buttonElement.disabled = true;
        
        await addToCart(productId, 1);
        
        await updateCartCount();
        
        buttonElement.textContent = 'Added!';
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Add to cart error:', error);
        buttonElement.textContent = 'Error';
        setTimeout(() => {
            buttonElement.textContent = 'Add to Cart';
            buttonElement.disabled = false;
        }, 2000);
        
        alert('Failed to add item to cart. Please try again.');
    }
}

export async function handleAddToWishlist(productId, buttonElement) {
    try {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Saving...';
        buttonElement.disabled = true;

        await addToWishlist(productId);

        showToast('Added to wishlist', 'success');
        buttonElement.textContent = 'Saved';
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.disabled = false;
        }, 1500);
    } catch (error) {
        console.error('Add to wishlist error:', error);
        showToast(error.message || 'Failed to save wishlist item', 'error');
        buttonElement.textContent = 'Error';
        setTimeout(() => {
            buttonElement.textContent = 'Save';
            buttonElement.disabled = false;
        }, 1500);
    }
}

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
    }, 2500);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initMobileMenu();
});
