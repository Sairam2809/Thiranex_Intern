/* ============================================
   NexusShop — Checkout View Render Module
   ============================================ */

import { store } from '../store.js';

export function renderCheckout() {
    const items = store.getCart();

    if (items.length === 0) {
        return {
            html: `
                <div style="text-align: center; padding: 60px 20px;">
                    <h3>Your Cart is Empty</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Add items to your cart before checking out.</p>
                    <a href="#/catalog" class="primary-btn">Start Shopping</a>
                </div>
            `
        };
    }

    const subtotal = store.getCartSubtotal();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 150 ? 0 : 15;
    const total = store.getCartTotal();

    let currentStep = 1; // Step 1: Shipping, Step 2: Payment, Step 3: Success

    function buildCheckoutHtml() {
        if (currentStep === 3) {
            return `
                <div class="success-screen">
                    <div class="success-icon-wrapper" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2>Order Confirmed!</h2>
                    <p>Thank you for your purchase. Your order number is <strong>#NXS-${Math.floor(100000 + Math.random() * 900000)}</strong>. A confirmation email has been sent containing tracking info.</p>
                    <a href="#/catalog" class="primary-btn" style="width:100%; justify-content:center;">Continue Shopping</a>
                </div>
            `;
        }

        return `
            <div class="checkout-layout">
                <!-- Left panel with step forms -->
                <div class="checkout-form-panel">
                    <!-- Step Indicators -->
                    <div class="checkout-steps" aria-label="Checkout Progress">
                        <div class="step-indicator ${currentStep >= 1 ? 'active' : ''}">
                            <div class="step-num">1</div>
                            <div class="step-label">Shipping</div>
                        </div>
                        <div class="step-indicator ${currentStep >= 2 ? 'active' : ''}">
                            <div class="step-num">2</div>
                            <div class="step-label">Payment</div>
                        </div>
                        <div class="step-indicator">
                            <div class="step-num">3</div>
                            <div class="step-label">Success</div>
                        </div>
                    </div>

                    <form id="checkout-form" class="todo-form">
                        ${currentStep === 1 ? `
                            <!-- STEP 1: SHIPPING INFORMATION -->
                            <h3 style="font-family: var(--font-display); font-size:1.2rem; font-weight:700; margin-bottom:18px;">Shipping Details</h3>
                            <div class="form-fields-grid">
                                <div class="checkout-form-group field-full-width">
                                    <label for="bill-name">Full Name</label>
                                    <input type="text" id="bill-name" class="checkout-input-field" placeholder="John Doe" required>
                                </div>
                                <div class="checkout-form-group field-full-width">
                                    <label for="bill-email">Email Address</label>
                                    <input type="email" id="bill-email" class="checkout-input-field" placeholder="john@example.com" required>
                                </div>
                                <div class="checkout-form-group field-full-width">
                                    <label for="bill-address">Shipping Address</label>
                                    <input type="text" id="bill-address" class="checkout-input-field" placeholder="123 Luxury Ave" required>
                                </div>
                                <div class="checkout-form-group">
                                    <label for="bill-city">City</label>
                                    <input type="text" id="bill-city" class="checkout-input-field" placeholder="New York" required>
                                </div>
                                <div class="checkout-form-group">
                                    <label for="bill-zip">ZIP / Postal Code</label>
                                    <input type="text" id="bill-zip" class="checkout-input-field" placeholder="10001" required>
                                </div>
                            </div>
                            
                            <button type="submit" class="primary-btn" style="margin-top:24px; justify-content:center;">
                                <span>Continue to Payment</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        ` : `
                            <!-- STEP 2: CREDIT CARD PAYMENT -->
                            <h3 style="font-family: var(--font-display); font-size:1.2rem; font-weight:700; margin-bottom:18px;">Payment Details</h3>
                            <div class="form-fields-grid">
                                <div class="checkout-form-group field-full-width">
                                    <label for="card-num">Card Number</label>
                                    <input type="text" id="card-num" class="checkout-input-field" placeholder="4111 2222 3333 4444" pattern="[0-9\\s]{13,19}" required>
                                </div>
                                <div class="checkout-form-group field-full-width">
                                    <label for="card-holder">Name on Card</label>
                                    <input type="text" id="card-holder" class="checkout-input-field" placeholder="John Doe" required>
                                </div>
                                <div class="checkout-form-group">
                                    <label for="card-expiry">Expiry Date</label>
                                    <input type="text" id="card-expiry" class="checkout-input-field" placeholder="MM/YY" pattern="[0-9]{2}/[0-9]{2}" required>
                                </div>
                                <div class="checkout-form-group">
                                    <label for="card-cvv">CVV</label>
                                    <input type="password" id="card-cvv" class="checkout-input-field" placeholder="***" pattern="[0-9]{3,4}" required>
                                </div>
                            </div>
                            
                            <div style="display:flex; gap:12px; margin-top:28px;">
                                <button type="button" id="prev-step-btn" class="pill-btn" style="border:1px solid var(--border-subtle); padding:10px 20px; font-weight:600;">
                                    Back
                                </button>
                                <button type="submit" class="primary-btn" style="flex:1; justify-content:center;">
                                    <span>Complete Purchase</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            </div>
                        `}
                    </form>
                </div>

                <!-- Right items list checkout summary panel -->
                <div class="cart-summary-panel">
                    <h3 class="summary-title">Summary</h3>
                    <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; border-bottom:1px solid var(--border-subtle); padding-bottom:14px;">
                        ${items.map(item => `
                            <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-secondary);">
                                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${item.name} (x${item.quantity})</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="summary-rows">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Estimated Tax</span>
                            <span>$${tax.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const html = buildCheckoutHtml();

    const initActions = () => {
        const mount = document.getElementById('view-mount');

        const bindFormEvents = () => {
            const form = document.getElementById('checkout-form');
            if (!form) return;

            // Submit event
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (currentStep === 1) {
                    currentStep = 2;
                    mount.innerHTML = buildCheckoutHtml();
                    bindFormEvents();
                } else if (currentStep === 2) {
                    currentStep = 3;
                    store.clearCart(); // Clear item state upon success
                    mount.innerHTML = buildCheckoutHtml();
                }
            });

            // Back button trigger
            const backBtn = document.getElementById('prev-step-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    currentStep = 1;
                    mount.innerHTML = buildCheckoutHtml();
                    bindFormEvents();
                });
            }
        };

        bindFormEvents();
    };

    return { html, initActions };
}
