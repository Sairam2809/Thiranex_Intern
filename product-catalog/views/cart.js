/* ============================================
   NexusShop — Cart View Render Module
   ============================================ */

import { store } from '../store.js';

export function renderCart() {
    const items = store.getCart();

    function buildCartHtml() {
        if (items.length === 0) {
            return `
                <div class="empty-cart-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <h2>Your Cart is Empty</h2>
                    <p style="color: var(--text-secondary); margin: 10px 0 24px;">Add items to your cart to see them listed here.</p>
                    <a href="#/catalog" class="primary-btn">Start Shopping</a>
                </div>
            `;
        }

        const subtotal = store.getCartSubtotal();
        const tax = subtotal * 0.08;
        const shipping = subtotal > 150 ? 0 : 15;
        const total = store.getCartTotal();

        return `
            <div class="cart-layout">
                <!-- Left panel lists items -->
                <div class="cart-items-panel">
                    <h2 class="cart-title">Your Shopping Cart</h2>
                    <div class="cart-list">
                        ${items.map(item => `
                            <div class="cart-item-row" data-id="${item.id}">
                                <div class="cart-item-visual" aria-hidden="true">
                                    ${item.svgIcon}
                                </div>
                                <div class="cart-item-info">
                                    <h3 class="cart-item-name">
                                        <a href="#/product/${item.productId}">${item.name}</a>
                                    </h3>
                                    <div class="cart-item-meta">
                                        ${item.options.size ? `<span>Size: ${item.options.size}</span>` : ''}
                                        ${item.options.color ? `<span style="margin-left: 10px;">Color: <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${item.options.color};"></span></span>` : ''}
                                    </div>
                                </div>
                                <div class="quantity-control" style="transform: scale(0.9);" aria-label="Quantity selector">
                                    <button class="qty-btn qty-change" data-id="${item.id}" data-action="minus">−</button>
                                    <span class="qty-value">${item.quantity}</span>
                                    <button class="qty-btn qty-change" data-id="${item.id}" data-action="plus">+</button>
                                </div>
                                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                                <button class="remove-item-btn remove-trigger" data-id="${item.id}" aria-label="Remove item" title="Remove item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Right pricing calculations panel -->
                <div class="cart-summary-panel">
                    <h3 class="summary-title">Order Summary</h3>
                    <div class="summary-rows">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Estimated Tax (8%)</span>
                            <span>$${tax.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>${shipping === 0 ? '<strong style="color:#22c55e;">FREE</strong>' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        ${shipping > 0 ? `
                            <div style="font-size: 0.72rem; color: var(--accent-indigo); text-align: right; margin-top: -6px;">
                                Add $${(150 - subtotal).toFixed(2)} more for free shipping!
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <a href="#/checkout" class="primary-btn checkout-btn" style="justify-content: center; text-align: center;">
                        <span>Proceed to Checkout</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                    
                    <a href="#/catalog" style="font-size: 0.8rem; color: var(--text-muted); text-align: center; display: block; margin-top: 6px;">
                        Or Continue Shopping
                    </a>
                </div>
            </div>
        `;
    }

    const html = buildCartHtml();

    const initActions = () => {
        const mount = document.getElementById('view-mount');

        // Force reload view content on state updates
        const refreshCartView = () => {
            mount.innerHTML = buildCartHtml();
            bindEvents();
        };

        const bindEvents = () => {
            // Handle Quantity triggers (+ / -)
            mount.querySelectorAll('.qty-change').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.dataset.id;
                    const action = btn.dataset.action;
                    const row = mount.querySelector(`.cart-item-row[data-id="${itemId}"]`);
                    const qtyValNode = row.querySelector('.qty-value');
                    let quantity = parseInt(qtyValNode.textContent);

                    if (action === 'minus') {
                        quantity--;
                    } else {
                        quantity++;
                    }

                    store.updateCartQuantity(itemId, quantity);
                    refreshCartView();
                });
            });

            // Handle Item Deletions
            mount.querySelectorAll('.remove-trigger').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.dataset.id;
                    store.removeFromCart(itemId);
                    refreshCartView();
                });
            });
        };

        bindEvents();
    };

    return { html, initActions };
}
