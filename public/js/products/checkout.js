import { fetchCart } from '../../apis/main/cart.js';
import { submitCheckout, confirmPayment, verifyPayment } from '../../apis/main/payments.js';
import { API_BASE_URL, getHeaders } from '../../apis/main/config.js';
import { isLoggedIn, getCurrentUser } from '../../apis/accounts/auth.js';
import { updateCartCount } from '../main/main.js';
import { formatCurrency } from '../security/format.js';
import { escapeHtml, escapeAttr, sanitizeUrl } from '../security/sanitize.js';
import { navigateToRoute } from '../security/security.js';

const checkoutContainer = document.getElementById('checkout-container');

function getProductImage(product) {
    const url = product?.image || product?.images?.[0];
    return sanitizeUrl(url, 'https://via.placeholder.com/60x60?text=No+Image');
}

// Check authentication
if (!isLoggedIn()) {
    // Redirect to login with return URL
    navigateToRoute('login', { redirect: '/checkout' });
}

let cartData = null;
let currentUser = null;

async function loadCheckout() {
    try {
        checkoutContainer.innerHTML = '<div class="loading">Loading checkout...</div>';
        const cart = await fetchCart();
        cartData = cart;
        currentUser = getCurrentUser();

        if (!cart.items || cart.items.length === 0) {
            checkoutContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty.</p>
                    <a href="/products" class="btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        renderCheckoutForm(currentUser);
    } catch (error) {
        console.error('Error loading checkout:', error);
        checkoutContainer.innerHTML = '<p class="error">Failed to load checkout. Please try again later.</p>';
    }
}

function renderCheckoutForm(user) {
    const orderItemsHtml = cartData.items.map(item => `
        <div class="checkout-item">
            <img src="${escapeAttr(getProductImage(item.product))}" alt="${escapeHtml(item.product?.name)}">
            <div class="checkout-item-details">
                <span class="item-name">${escapeHtml(item.product?.name)}</span>
                <span class="item-quantity">Qty: ${escapeHtml(item.quantity)}</span>
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
                            <input type="text" id="fullName" value="${escapeAttr(user?.name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${escapeAttr(user?.email || '')}" required>
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
                        <label>Payment Method</label>
                        <div class="payment-methods">
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="CARD" checked>
                                <span>Card</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="TRANSFER">
                                <span>Bank Transfer</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="PAY_ON_DELIVERY">
                                <span>Pay on Delivery</span>
                            </label>
                        </div>
                    </div>
                    <p class="helper-text">Payments are secured and encrypted. You will not be redirected away from this page.</p>

                    <button type="submit" class="btn-primary btn-block" id="place-order-btn">Place Order</button>
                </form>
            </div>
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${orderItemsHtml}
                </div>
                <div class="coupon-row">
                    <input type="text" id="coupon-code" placeholder="Coupon code" aria-label="Coupon code">
                    <button type="button" id="apply-coupon-btn" class="btn-filter">Apply</button>
                </div>
                <div id="coupon-message" class="coupon-message" style="display: none;"></div>
                <div class="summary-totals">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(cartData.totalPrice)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(cartData.shippingCost)}</span>
                    </div>
                    <div class="summary-row" id="discount-row" style="display: none;">
                        <span>Discount:</span>
                        <span id="discount-amount"></span>
                    </div>
                    <div class="summary-row total">
                        <strong>Total:</strong>
                        <strong>${formatCurrency(cartData.grandTotal || cartData.totalPrice)}</strong>
                    </div>
                </div>
            </div>
        </div>
        <div id="order-error" class="error-message" style="display: none;"></div>
        <div id="payment-status" class="payment-status" style="display: none;"></div>
    `;

    checkoutContainer.innerHTML = checkoutHtml;

    // Attach form submit handler
    const form = document.getElementById('shipping-form');
    form.addEventListener('submit', handleOrderSubmit);

    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponMessage = document.getElementById('coupon-message');
    applyCouponBtn.addEventListener('click', async () => {
        const code = document.getElementById('coupon-code').value.trim();
        couponMessage.style.display = 'none';
        if (!code) {
            couponMessage.textContent = 'Enter a coupon code first.';
            couponMessage.className = 'coupon-message error-message';
            couponMessage.style.display = 'block';
            return;
        }
        try {
            const subtotal = cartData?.totalPrice || 0;
            const response = await fetch(`${API_BASE_URL}/coupons/validate?code=${encodeURIComponent(code)}&amount=${subtotal}`, {
                headers: getHeaders()
            });
            const result = await response.json();
            if (result.valid && result.discountAmount > 0) {
                couponMessage.textContent = `Coupon applies ${formatCurrency(result.discountAmount)} off. It will be applied when you place your order.`;
                couponMessage.className = 'coupon-message success-message';
                const discountRow = document.getElementById('discount-row');
                const discountAmount = document.getElementById('discount-amount');
                if (discountRow && discountAmount) {
                    discountAmount.textContent = `-${formatCurrency(result.discountAmount)}`;
                    discountRow.style.display = 'flex';
                }
            } else {
                couponMessage.textContent = result.message || 'This coupon does not apply to your order.';
                couponMessage.className = 'coupon-message error-message';
                const discountRow = document.getElementById('discount-row');
                if (discountRow) discountRow.style.display = 'none';
            }
        } catch (error) {
            couponMessage.textContent = 'Could not validate coupon. Please try again.';
            couponMessage.className = 'coupon-message error-message';
        }
        couponMessage.style.display = 'block';
    });
}

function getSelectedPaymentMethod() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    return selected ? selected.value : 'CARD';
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
    const paymentMethod = getSelectedPaymentMethod();

    // Basic validation
    if (!fullName || !email || !address || !city || !postalCode || !phone) {
        showOrderError('Please fill in all shipping fields.');
        return;
    }

    // Disable button and show loading
    const submitBtn = document.getElementById('place-order-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;

    try {
        const couponCode = document.getElementById('coupon-code')?.value.trim() || undefined;
        const result = await submitCheckout({
            shippingMethod: 'STANDARD',
            paymentMethod,
            couponCode,
            note: `Deliver to ${fullName}, ${address}, ${city}, ${postalCode}. Phone: ${phone}`
        });

        const { order, payment } = result;

        if (result.totals?.discountAmount > 0) {
            const discountRow = document.getElementById('discount-row');
            const discountAmount = document.getElementById('discount-amount');
            if (discountRow && discountAmount) {
                discountAmount.textContent = `-${formatCurrency(result.totals.discountAmount)}`;
                discountRow.style.display = 'flex';
            }
        }

        if (payment.method === 'PAY_ON_DELIVERY') {
            // No online payment needed — confirm directly.
            await confirmPayment(payment.id);
            navigateToRoute('orderConfirmation', { orderId: order.id });
            return;
        }

        // Show payment status area and run the provider flow without redirecting away.
        const statusEl = document.getElementById('payment-status');
        statusEl.style.display = 'block';
        statusEl.innerHTML = '<p>Preparing your payment…</p>';
        statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (payment.transferAccount) {
            await runTransferPayment(payment, result, statusEl);
        } else if (payment.inline) {
            await runInlinePayment(payment, email, result, statusEl);
        } else if (payment.redirectUrl) {
            await runRedirectPayment(payment, result, statusEl);
        } else {
            throw new Error('No payment method was configured by the store. Please contact support.');
        }
    } catch (error) {
        showOrderError(error.message || 'Failed to place order. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (window.__loadedScripts && window.__loadedScripts.has(url)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
            window.__loadedScripts = window.__loadedScripts || new Set();
            window.__loadedScripts.add(url);
            resolve();
        };
        script.onerror = () => reject(new Error('Could not load the payment provider script.'));
        document.head.appendChild(script);
    });
}

async function runInlinePayment(payment, email, result, statusEl) {
    const { inline } = payment;
    if (!inline?.scriptUrl || !inline?.publicKey) {
        throw new Error('Payment provider is misconfigured. Please contact support.');
    }

    await loadScript(inline.scriptUrl);

    if (payment.provider === 'paystack' || payment.provider === 'flutterwave') {
        const paid = await openInlineCheckout(payment, email, result);
        if (paid) {
            await pollUntilPaid(payment.reference);
        } else {
            showManualVerification(payment, statusEl);
        }
        return;
    }

    // Nomba and others: hosted checkout in a popup/iframe, then poll for
    // confirmation so the customer is never left hanging after paying.
    await runRedirectPayment(payment, result, statusEl);
}

function openInlineCheckout(payment, email, result) {
    return new Promise((resolve) => {
        const done = (success) => resolve(success);

        if (payment.provider === 'paystack') {
            if (!window.PaystackPop?.setup) {
                resolve(false);
                return;
            }
            const handler = window.PaystackPop.setup({
                key: payment.inline.publicKey,
                email,
                amount: Math.round(result.totals.total * 100),
                ref: payment.inline.reference,
                currency: 'NGN',
                metadata: { orderNumber: result.order.orderNumber },
                callback: () => done(true),
                onClose: () => done(false)
            });
            handler.openIframe();
        } else {
            if (typeof window.FlutterwaveCheckout !== 'function') {
                resolve(false);
                return;
            }
            window.FlutterwaveCheckout({
                public_key: payment.inline.publicKey,
                tx_ref: payment.inline.reference,
                amount: result.totals.total,
                currency: 'NGN',
                payment_options: payment.method === 'TRANSFER' ? 'banktransfer' : 'card',
                callback: () => done(true),
                onclose: () => done(false)
            });
        }
    });
}

function showManualVerification(payment, statusEl) {
    statusEl.innerHTML = '<p>Payment window closed before completion. You can verify your payment status on the order page.</p>';
    const submitBtn = document.getElementById('place-order-btn');
    submitBtn.textContent = 'I have completed my payment';
    submitBtn.disabled = false;
    submitBtn.onclick = async () => {
        try {
            await pollUntilPaid(payment.reference);
        } catch (err) {
            showOrderError(err.message);
        }
    };
}

async function runTransferPayment(payment, result, statusEl) {
    const account = payment.transferAccount;
    statusEl.innerHTML = `
        <h3>Pay by Bank Transfer</h3>
        <p>Transfer <strong>${formatCurrency(result.totals.total)}</strong> to the account below, then click "I have paid" to confirm.</p>
        <div class="transfer-details">
            <p><span>Bank:</span> <strong>${escapeHtml(account.bank)}</strong></p>
            <p><span>Account Number:</span> <strong>${escapeHtml(account.accountNumber)}</strong></p>
            <p><span>Account Name:</span> <strong>${escapeHtml(account.accountName)}</strong></p>
            <p><span>Reference:</span> <strong>${escapeHtml(account.reference || payment.reference)}</strong></p>
        </div>
        <button type="button" class="btn-primary" id="transfer-done-btn">I have paid</button>
    `;
    document.getElementById('transfer-done-btn').addEventListener('click', async () => {
        statusEl.innerHTML = '<p>Confirming your transfer… This can take a few minutes.</p>';
        try {
            await pollUntilPaid(payment.reference, 40);
        } catch (err) {
            showOrderError(err.message);
        }
    });
}

async function runRedirectPayment(payment, result, statusEl) {
    const safeUrl = sanitizeUrl(payment.redirectUrl, '');
    // Stripe's hosted Checkout refuses to render inside an iframe, so open it
    // as a popup window and let the status area poll for confirmation.
    if (payment.provider === 'stripe') {
        statusEl.innerHTML = `
            <h3>Complete your payment</h3>
            <p>We opened a secure Stripe payment window. Complete the payment there and it will be confirmed here automatically.</p>
            <p class="helper-text">Popup blocked? <a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener">Open Stripe checkout</a>.</p>
        `;
        const popup = window.open(safeUrl, '_blank', 'width=520,height=680');
        if (!popup) {
            window.location.href = safeUrl;
            return;
        }
        try {
            await pollUntilPaid(payment.reference);
        } catch (err) {
            showOrderError(err.message);
        }
        return;
    }

    statusEl.innerHTML = `
        <h3>Complete your payment</h3>
        <div class="checkout-iframe-wrap">
            <iframe src="${escapeAttr(safeUrl)}" title="Payment" class="checkout-iframe"></iframe>
        </div>
        <p class="helper-text">If the form above does not load, <a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener">open it in a new tab</a>.</p>
    `;
    try {
        await pollUntilPaid(payment.reference);
    } catch (err) {
        showOrderError(err.message);
    }
}

async function pollUntilPaid(reference, maxAttempts = 30) {
    const statusEl = document.getElementById('payment-status');
    const submitBtn = document.getElementById('place-order-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirming payment…';

    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            const result = await verifyPayment(reference);
            const status = result.payment?.status;
            if (status === 'PAID') {
                submitBtn.textContent = 'Payment confirmed ✓';
                navigateToRoute('orderConfirmation', { orderId: result.payment.orderId });
                return;
            }
            if (status === 'FAILED') {
                throw new Error('Payment failed. Please try again.');
            }
        } catch (error) {
            if (error.message?.toLowerCase().includes('failed')) {
                submitBtn.textContent = 'Place Order';
                submitBtn.disabled = false;
                throw error;
            }
        }
        statusEl.innerHTML = '<p>Waiting for payment confirmation…</p>';
        await new Promise(r => setTimeout(r, 5000));
        attempts += 1;
    }
    submitBtn.textContent = 'Check payment status';
    submitBtn.disabled = false;
    submitBtn.onclick = () => pollUntilPaid(reference, 30);
    throw new Error('Payment is taking longer than expected. Click "Check payment status" after completing payment.');
}

function showOrderError(message) {
    const errorDiv = document.getElementById('order-error');
    if (!errorDiv) return;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCheckout();
    updateCartCount(); // update header badge
});
