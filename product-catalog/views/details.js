/* ============================================
   NexusShop — Details View Render Module
   ============================================ */

import { store } from '../store.js';

export function renderDetails(params) {
    const productId = parseInt(params.id);
    const product = store.products.find(p => p.id === productId);

    if (!product) {
        return {
            html: `
                <div style="text-align: center; padding: 60px 20px;">
                    <h3>Product Not Found</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">The requested product could not be found.</p>
                    <a href="#/catalog" class="primary-btn">Back to Catalog</a>
                </div>
            `
        };
    }

    // Initialize option choices
    let selectedSize = product.sizes[0] || '';
    let selectedColor = product.colors[0] || '';
    let quantity = 1;

    const html = `
        <div style="margin-bottom: 20px;">
            <a href="#/catalog" class="pill-btn" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Back to Catalog</span>
            </a>
        </div>

        <div class="details-grid">
            <!-- Left side visual illustration -->
            <div class="details-visual" aria-hidden="true">
                ${product.svgIcon}
            </div>

            <!-- Right side product info -->
            <div class="details-info">
                <span class="details-category">${product.category}</span>
                <h2 class="details-title">${product.name}</h2>
                
                <div class="details-rating">
                    <span style="color: #fbbf24; font-size: 1.2rem;">★</span>
                    <strong>${product.rating}</strong>
                    <span style="color: var(--text-muted);">(${product.reviews} customer reviews)</span>
                </div>

                <div class="details-price">$${product.price.toFixed(2)}</div>
                
                <p class="details-description">${product.description}</p>

                <!-- Product Specifications -->
                <div class="options-selector-group">
                    <h4 class="selector-label">Specifications</h4>
                    <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                        <tbody>
                            ${Object.entries(product.specifications).map(([key, val]) => `
                                <tr style="border-bottom: 1px solid var(--border-subtle);">
                                    <td style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 40%; background: var(--bg-glass);">${key}</td>
                                    <td style="padding: 10px; color: var(--text-primary);">${val}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Sizes selection (if multiple sizes) -->
                ${product.sizes.length > 1 ? `
                    <div class="options-selector-group">
                        <h4 class="selector-label">Select Size</h4>
                        <div class="chips-container" id="sizes-chips">
                            ${product.sizes.map(size => `
                                <button class="chip-btn ${selectedSize === size ? 'active' : ''}" data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Colors selection (if multiple colors) -->
                ${product.colors.length > 1 ? `
                    <div class="options-selector-group">
                        <h4 class="selector-label">Select Color</h4>
                        <div class="chips-container" id="colors-chips">
                            ${product.colors.map(color => `
                                <button class="color-dot-btn ${selectedColor === color ? 'active' : ''}" data-color="${color}" aria-label="Color ${color}">
                                    <span style="background-color: ${color};"></span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Add to Cart purchasing controls -->
                <div class="purchase-controls">
                    <div class="quantity-control" aria-label="Quantity selector">
                        <button class="qty-btn" id="qty-minus" aria-label="Decrease quantity">−</button>
                        <span class="qty-value" id="qty-value">1</span>
                        <button class="qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="primary-btn add-cart-btn" id="add-to-cart-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    const initActions = () => {
        const sizeContainer = document.getElementById('sizes-chips');
        const colorContainer = document.getElementById('colors-chips');
        
        // Handle sizes click selection
        if (sizeContainer) {
            sizeContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip-btn');
                if (btn) {
                    sizeContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedSize = btn.dataset.size;
                }
            });
        }

        // Handle color dot selection
        if (colorContainer) {
            colorContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.color-dot-btn');
                if (btn) {
                    colorContainer.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedColor = btn.dataset.color;
                }
            });
        }

        // Handle Quantity adjustments
        const qtyValueNode = document.getElementById('qty-value');
        document.getElementById('qty-minus').addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                qtyValueNode.textContent = quantity;
            }
        });
        document.getElementById('qty-plus').addEventListener('click', () => {
            quantity++;
            qtyValueNode.textContent = quantity;
        });

        // Add to Cart integration
        const addBtn = document.getElementById('add-to-cart-btn');
        addBtn.addEventListener('click', () => {
            store.addToCart(productId, quantity, {
                size: selectedSize,
                color: selectedColor
            });

            // visual confirmation on button
            const label = addBtn.querySelector('span');
            const icon = addBtn.querySelector('svg');
            const oldText = label.textContent;
            
            label.textContent = "Added to Cart!";
            addBtn.style.background = "#10b981";
            addBtn.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.4)";
            addBtn.setAttribute('disabled', 'true');
            
            setTimeout(() => {
                label.textContent = oldText;
                addBtn.style.background = "";
                addBtn.style.boxShadow = "";
                addBtn.removeAttribute('disabled');
            }, 1200);
        });
    };

    return { html, initActions };
}
