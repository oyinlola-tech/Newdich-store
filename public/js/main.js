import { fetchCart, addToCart } from '../api/cart.js';

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
