import { fetchCart } from '../api/cart.js';
import { submitOrder } from '../api/orders.js';
import { isLoggedIn, getCurrentUser } from '../api/auth.js';
import { createPaymentIntent, confirmPayment } from '../api/payments.js';
import { updateCartCount } from './main.js';
import { formatCurrency } from './format.js';

const checkoutContainer = document.getElementById('checkout-container');

function getProductImage(product) {
    return product?.image || product?.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image';
}

// Check authentication
if (!isLoggedIn()) {
    // Redirect to login with return URL
    window.location.href = `/login?redirect=/checkout`;
}

let cartData = null;

async function loadCheckout() {
    try {
        checkoutContainer.innerHTML = '<div class="loading">Loading checkout...</div>';
        const cart = await fetchCart();
        cartData = cart;

        if (!cart.items || cart.items.length === 0) {
            checkoutContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty.</p>
                    <a href="/products" class="btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        const user = getCurrentUser();
        renderCheckoutForm(user);
    } catch (error) {
        console.error('Error loading checkout:', error);
        checkoutContainer.innerHTML = '<p class="error">Failed to load checkout. Please try again later.</p>';
    }
}

function renderCheckoutForm(user) {
    const orderItemsHtml = cartData.items.map(item => `
        <div class="checkout-item">
            <img src="${getProductImage(item.product)}" alt="${escapeHtml(item.product?.name)}">
            <div class="checkout-item-details">
                <span class="item-name">${escapeHtml(item.product?.name)}</span>
                <span class="item-quantity">Qty: ${item.quantity}</span>
                <span class="item-price">${formatCurrency(item.product?.price)}</span>
            </div>
            <div class="item-total">${formatCurrency(item.product?.price * item.quantity)}</div>
        </div>
    `).join('');

    const checkoutHtml = `
        <div class="checkout-layout">
            <div class="checkout-form">
                <h3>Shipping Information</h3>
                <form id="shipping-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" value="${escapeHtml(user?.name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${escapeHtml(user?.email || '')}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="address">Address</label>
                        <input type="text" id="address" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" required>
                        </div>
                        <div class="form-group">
                            <label for="postalCode">Postal Code</label>
                            <input type="text" id="postalCode" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" required>
                    </div>

                    <h3>Payment Information</h3>
                    <div class="form-group">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiryDate">Expiry Date</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" required>
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" placeholder="123" required>
                        </div>
                    </div>
                    <p class="helper-text">Payments are secured and encrypted.</p>

                    <button type="submit" class="btn-primary btn-block" id="place-order-btn">Place Order</button>
                </form>
            </div>
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${orderItemsHtml}
                </div>
                <div class="summary-totals">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(cartData.totalPrice)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(cartData.shippingCost)}</span>
                    </div>
                    <div class="summary-row total">
                        <strong>Total:</strong>
                        <strong>${formatCurrency(cartData.grandTotal || cartData.totalPrice)}</strong>
                    </div>
                </div>
            </div>
        </div>
        <div id="order-error" class="error-message" style="display: none;"></div>
    `;

    checkoutContainer.innerHTML = checkoutHtml;

    // Attach form submit handler
    const form = document.getElementById('shipping-form');
    form.addEventListener('submit', handleOrderSubmit);
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    // Collect form data
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    // Basic validation
    if (!fullName || !email || !address || !city || !postalCode || !phone) {
        showOrderError('Please fill in all shipping fields.');
        return;
    }
    if (!cardNumber || !expiryDate || !cvv) {
        showOrderError('Please fill in all payment fields.');
        return;
    }

    // Simple credit card validation (just checks format)
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumberClean)) {
        showOrderError('Card number must be 16 digits.');
        return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        showOrderError('Expiry date must be in MM/YY format.');
        return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
        showOrderError('CVV must be 3 or 4 digits.');
        return;
    }

    // Disable button and show loading
    const submitBtn = document.getElementById('place-order-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;

    // Build order data (will attach payment info after processing)
    const orderData = {
        shippingAddress: {
            fullName,
            email,
            address,
            city,
            postalCode,
            phone
        },
        paymentInfo: {
            cardNumber: cardNumberClean,
            expiryDate,
            cvv
        },
        items: cartData.items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
        })),
        total: cartData.grandTotal || cartData.totalPrice
    };

    try {
        // 1) Create payment intent
        const paymentInit = await createPaymentIntent({
            amount: orderData.total,
            currency: 'NGN',
            paymentMethod: {
                cardNumber: cardNumberClean,
                expiryDate,
                cvv
            },
            customer: { fullName, email }
        });

        const paymentId = paymentInit.paymentId || paymentInit.id || paymentInit.intentId;
        if (!paymentId) {
            throw new Error('Payment initialization failed.');
        }

        // 2) Confirm payment
        const paymentResult = await confirmPayment(paymentId);
        const paymentStatus = paymentResult.status || 'confirmed';

        // 3) Submit order with payment metadata
        const order = await submitOrder({
            ...orderData,
            payment: { paymentId, status: paymentStatus }
        });
        // Clear cart from localStorage or trigger backend cart clear (handled by API)
        // Redirect to order confirmation page
        window.location.href = `/order-confirmation?orderId=${order.id}`;
    } catch (error) {
        showOrderError(error.message || 'Failed to place order. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showOrderError(message) {
    const errorDiv = document.getElementById('order-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCheckout();
    updateCartCount(); // update header badge
});


