/* ============================================
   NexusShop — Main Application Bootstrap
   ============================================ */

import { Router } from './router.js';
import { store } from './store.js';

// Import Views
import { renderHome } from './views/home.js';
import { renderCatalog } from './views/catalog.js';
import { renderDetails } from './views/details.js';
import { renderCart } from './views/cart.js';
import { renderCheckout } from './views/checkout.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Configuration
    const themeBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('nexusshop-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = htmlElement.getAttribute('data-theme');
        const nextTheme = current === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('nexusshop-theme', nextTheme);
    });

    // 2. Navigation Cart Badge updates
    const badge = document.getElementById('cart-badge');
    const updateCartBadge = () => {
        const count = store.getCartCount();
        badge.textContent = count;
        
        // Hide badge if count is 0
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    };
    
    // Initial run & subscribe to store notifications
    updateCartBadge();
    store.addEventListener('cart-changed', updateCartBadge);

    // 3. Router Initialization
    const mountNode = document.getElementById('view-mount');
    const router = new Router(mountNode);

    // Configure client-side SPA routes
    router.addRoute('/', renderHome);
    router.addRoute('/catalog', renderCatalog);
    router.addRoute('/product/:id', renderDetails);
    router.addRoute('/cart', renderCart);
    router.addRoute('/checkout', renderCheckout);

    // Start Router engine
    router.start();
});
