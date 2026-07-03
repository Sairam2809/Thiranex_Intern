/* ============================================
   NexusShop — Home View Render Module
   ============================================ */

import { store } from '../store.js';

export function renderHome() {
    // Fetch featured products
    const featured = store.products.filter(p => p.featured);

    const categories = [
        { key: 'audio', name: 'Premium Audio', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>' },
        { key: 'wearables', name: 'Smart Wearables', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="4"></rect><circle cx="12" cy="10" r="3"></circle><line x1="12" y1="16" x2="12" y2="18"></line></svg>' },
        { key: 'peripherals', name: 'Work Peripherals', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="12" rx="2"></rect><line x1="6" y1="20" x2="18" y2="20"></line><line x1="12" y1="16" x2="12" y2="20"></line></svg>' },
        { key: 'power', name: 'Charging Stations', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M11 7 L9 13 L12 13 L11 17 L15 11 L12 11 Z"></path></svg>' }
    ];

    const html = `
        <!-- Hero Section -->
        <section class="hero-banner" aria-label="Welcome Banner">
            <div class="hero-content">
                <h2>Elevate Your Tech Lifestyle</h2>
                <p>Curated minimalist design meets peak performance. Discover the future of personal workspaces, audio accessories, and premium wearables.</p>
                <a href="#/catalog" class="primary-btn">
                    <span>Explore Catalog</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
            <div class="hero-visual" aria-hidden="true">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="h-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#080b1a" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="url(#h-glow)" />
                    <!-- Visual geometric elements -->
                    <rect x="50" y="60" width="100" height="70" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(99, 102, 241, 0.4)" stroke-width="2" />
                    <circle cx="100" cy="95" r="22" fill="#6366f1" opacity="0.8" />
                    <circle cx="100" cy="95" r="16" fill="#080b1a" />
                    <!-- Orbiting dots -->
                    <circle cx="65" cy="75" r="4" fill="#a855f7" />
                    <circle cx="135" cy="115" r="6" fill="#06b6d4" />
                </svg>
            </div>
        </section>

        <!-- Categories Section -->
        <section class="section" aria-labelledby="cat-heading">
            <div class="section-header">
                <h3 id="cat-heading">Featured Categories</h3>
            </div>
            <div class="categories-grid">
                ${categories.map(cat => `
                    <div class="category-card" data-category="${cat.key}">
                        <div class="category-icon" aria-hidden="true">
                            ${cat.icon}
                        </div>
                        <span class="category-name">${cat.name}</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Featured Products Section -->
        <section class="section" aria-labelledby="featured-heading">
            <div class="section-header">
                <h3 id="featured-heading">Trending Products</h3>
            </div>
            <div class="products-mini-grid">
                ${featured.map(product => `
                    <article class="product-card">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <div class="product-card-image" aria-hidden="true">
                            ${product.svgIcon}
                        </div>
                        <div class="product-card-body">
                            <span class="product-card-category">${product.category}</span>
                            <h4 class="product-card-title">
                                <a href="#/product/${product.id}">${product.name}</a>
                            </h4>
                            <div class="product-card-rating">
                                <span>★</span>
                                <span>${product.rating}</span>
                                <span class="rating-count">(${product.reviews})</span>
                            </div>
                            <div class="product-card-footer">
                                <span class="product-card-price">$${product.price.toFixed(2)}</span>
                                <button class="buy-btn-trigger add-to-cart" data-id="${product.id}" aria-label="Add ${product.name} to Cart">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </button>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
    `;

    // Interactive event listeners
    const initActions = () => {
        // Redirect to catalog view with filter preset
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.hash = `#/catalog?category=${category}`;
            });
        });

        // Fast "Add to Cart" button handlers
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = parseInt(button.dataset.id);
                store.addToCart(id, 1, {});
                
                // Animated feedback on button
                const oldContent = button.innerHTML;
                button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                button.setAttribute('disabled', 'true');
                setTimeout(() => {
                    button.innerHTML = oldContent;
                    button.removeAttribute('disabled');
                }, 1000);
            });
        });
    };

    return { html, initActions };
}
