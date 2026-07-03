/* ============================================
   NexusShop — Consolidated Application
   Store + Router + Views + Bootstrap
   ============================================ */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════
       1. STORE — STATE & PRODUCT DATA
       ══════════════════════════════════════════════ */

    const store = {
        products: [],
        cart: [],
        _listeners: [],

        init() {
            this.products = this._getMockProducts();
            this.cart = this._loadCart();
        },

        on(fn) { this._listeners.push(fn); },
        _emit() { this._listeners.forEach(fn => fn()); },

        getCart() { return this.cart; },

        addToCart(productId, quantity, options) {
            quantity = quantity || 1;
            options = options || {};
            const product = this.products.find(function (p) { return p.id === productId; });
            if (!product) return;
            const cartItemId = productId + '-' + (options.size || 'default') + '-' + (options.color || 'default');
            const existing = this.cart.find(function (i) { return i.id === cartItemId; });
            if (existing) {
                existing.quantity += quantity;
            } else {
                this.cart.push({
                    id: cartItemId,
                    productId: productId,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    svgIcon: product.svgIcon,
                    options: options,
                    quantity: quantity
                });
            }
            this._saveCart();
            this._emit();
        },

        updateCartQuantity(cartItemId, quantity) {
            if (quantity <= 0) { this.removeFromCart(cartItemId); return; }
            var item = this.cart.find(function (i) { return i.id === cartItemId; });
            if (item) { item.quantity = quantity; this._saveCart(); this._emit(); }
        },

        removeFromCart(cartItemId) {
            this.cart = this.cart.filter(function (i) { return i.id !== cartItemId; });
            this._saveCart();
            this._emit();
        },

        clearCart() {
            this.cart = [];
            this._saveCart();
            this._emit();
        },

        getCartCount() {
            return this.cart.reduce(function (t, i) { return t + i.quantity; }, 0);
        },

        getCartSubtotal() {
            return this.cart.reduce(function (t, i) { return t + (i.price * i.quantity); }, 0);
        },

        getCartTotal() {
            var sub = this.getCartSubtotal();
            var tax = sub * 0.08;
            var ship = (sub > 150 || sub === 0) ? 0 : 15;
            return sub + tax + ship;
        },

        _loadCart() {
            var s = localStorage.getItem('nexusshop-cart');
            if (s) { try { return JSON.parse(s); } catch (e) { return []; } }
            return [];
        },

        _saveCart() {
            localStorage.setItem('nexusshop-cart', JSON.stringify(this.cart));
        },

        _getMockProducts() {
            return [
                {
                    id: 101,
                    name: "AeroSonic ANC Headphones",
                    category: "audio",
                    price: 249.00,
                    rating: 4.8,
                    reviews: 142,
                    featured: true,
                    badge: "Hot",
                    description: "Experience premium sound with our advanced Hybrid Active Noise Cancelling headphones. Engineered with high-fidelity acoustic drivers and ergonomic memory-foam cushions for all-day luxury listening.",
                    specifications: { "Driver Size": "40mm Dynamic", "Battery Life": "Up to 45 Hours", "Connectivity": "Bluetooth 5.2 / Aux", "Weight": "250g" },
                    sizes: ["Standard"],
                    colors: ["#1e293b", "#e2e8f0"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-h101" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><path d="M20 50 C20 25, 80 25, 80 50" stroke="url(#g-h101)" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="15" y="45" width="14" height="25" rx="7" fill="url(#g-h101)"/><rect x="71" y="45" width="14" height="25" rx="7" fill="url(#g-h101)"/><rect x="25" y="40" width="4" height="30" rx="2" fill="#475569"/><rect x="71" y="40" width="4" height="30" rx="2" fill="#475569"/></svg>'
                },
                {
                    id: 102,
                    name: "Veloce Smartwatch Active",
                    category: "wearables",
                    price: 199.00,
                    rating: 4.6,
                    reviews: 98,
                    featured: true,
                    badge: "New",
                    description: "Track your health and maximize your performance. The Veloce smartwatch integrates dual-band GPS tracker, sleep monitors, heart rate analysis, and oxygen sensing with a crisp AMOLED modular visual interface.",
                    specifications: { "Display": '1.43" AMOLED', "Water Resistance": "5ATM (50m)", "Battery Life": "Up to 12 Days", "Sensors": "Heart, SpO2, GPS" },
                    sizes: ["40mm", "44mm"],
                    colors: ["#0f172a", "#3b82f6", "#ef4444"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-w102" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect x="40" y="10" width="20" height="80" rx="4" fill="#334155"/><circle cx="50" cy="50" r="26" fill="url(#g-w102)"/><circle cx="50" cy="50" r="22" fill="#0f172a"/><circle cx="50" cy="50" r="16" stroke="#06b6d4" stroke-width="1.5" fill="none" stroke-dasharray="8 4"/><text x="50" y="55" fill="white" font-size="10" font-family="Outfit" font-weight="bold" text-anchor="middle">10:45</text></svg>'
                },
                {
                    id: 103,
                    name: "ErgoClick Mechanical Keyboard",
                    category: "peripherals",
                    price: 135.00,
                    rating: 4.7,
                    reviews: 64,
                    featured: false,
                    badge: null,
                    description: "Boost typing productivity and gaming responsiveness. The ErgoClick features hot-swappable linear mechanical switches, sound-dampening foam, custom doubleshot PBT keycaps, and customizable RGB backing.",
                    specifications: { "Switches": "Linear Red (Hot-swap)", "Layout": "75% Compact", "Keycaps": "Doubleshot PBT", "Cable": "Detachable Coiled USB-C" },
                    sizes: ["Standard"],
                    colors: ["#1e293b", "#f8fafc"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="30" width="70" height="40" rx="6" fill="#334155" stroke="#475569" stroke-width="2"/><rect x="20" y="36" width="8" height="8" rx="2" fill="#6366f1"/><rect x="30" y="36" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="40" y="36" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="50" y="36" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="60" y="36" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="70" y="36" width="8" height="8" rx="2" fill="#a855f7"/><rect x="20" y="47" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="30" y="47" width="8" height="8" rx="2" fill="#e2e8f0"/><rect x="40" y="47" width="28" height="8" rx="2" fill="#6366f1"/><rect x="70" y="47" width="8" height="8" rx="2" fill="#e2e8f0"/></svg>'
                },
                {
                    id: 104,
                    name: "Quantum Charge Power Station",
                    category: "power",
                    price: 89.00,
                    rating: 4.5,
                    reviews: 55,
                    featured: false,
                    badge: null,
                    description: "The ultimate tabletop power companion. Features triple USB-C ports with 140W total Power Delivery (PD) allocation and dual wireless magnetic docks to fast-charge all your workspace devices simultaneously.",
                    specifications: { "Max Output": "140W Total PD", "Ports": "3x USB-C / 1x USB-A", "Wireless Qi": "Dual 15W MagSafe Docks", "Material": "Anodized Space Gray Aluminum" },
                    sizes: ["Standard"],
                    colors: ["#334155"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="40" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/><circle cx="50" cy="45" r="14" stroke="#6366f1" stroke-width="2" fill="none"/><path d="M50 38 L46 47 L50 47 L50 52 L54 43 L50 43 Z" fill="#6366f1"/><rect x="38" y="68" width="6" height="4" rx="1" fill="#475569"/><rect x="47" y="68" width="6" height="4" rx="1" fill="#475569"/><rect x="56" y="68" width="6" height="4" rx="1" fill="#6366f1"/></svg>'
                },
                {
                    id: 105,
                    name: "Iris-Glint Smart Glasses",
                    category: "wearables",
                    price: 299.00,
                    rating: 4.9,
                    reviews: 180,
                    featured: true,
                    badge: "Top Seller",
                    description: "Experience sleek augmented reality. The Iris-Glint sunglasses feature built-in direction speakers, micro-LED notification lenses, photochromic sunlight response, and voice assistant integration.",
                    specifications: { "Lens Type": "Photochromic Polarized", "Speakers": "Open-ear Spatial Audio", "Weight": "42g", "Battery Life": "Up to 6 Hours Active" },
                    sizes: ["Classic Slim", "Wide Fit"],
                    colors: ["#000000", "#1e293b", "#d97706"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15 35 C20 30, 45 30, 48 35 C51 30, 76 30, 81 35 L85 50 C83 56, 52 56, 49 46 C46 56, 15 56, 13 50 Z" fill="#0f172a" stroke="#a855f7" stroke-width="2"/><circle cx="31" cy="43" r="6" fill="#a855f7" opacity="0.3"/><circle cx="67" cy="43" r="6" fill="#a855f7" opacity="0.3"/><line x1="15" y1="35" x2="5" y2="30" stroke="#334155" stroke-width="3" stroke-linecap="round"/><line x1="81" y1="35" x2="91" y2="30" stroke="#334155" stroke-width="3" stroke-linecap="round"/></svg>'
                },
                {
                    id: 106,
                    name: "VibePulse Desktop Speakers",
                    category: "audio",
                    price: 159.00,
                    rating: 4.4,
                    reviews: 43,
                    featured: false,
                    badge: null,
                    description: "Transform your desktop sound landscape. Dual luxury active bookshelf speakers delivering deep, rich bass notes and clear highs. Packed with optical inputs, Bluetooth 5.0, and modern wooden composite finishes.",
                    specifications: { "Power Output": "60W RMS", "Frequency Response": "50Hz - 20kHz", "Inputs": "Bluetooth, AUX, Optical", "Cabinet Material": "Acoustic Composite Wood" },
                    sizes: ["StandardPair"],
                    colors: ["#0f172a", "#854d0e"],
                    svgIcon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="26" height="60" rx="3" fill="#1e293b" stroke="#334155" stroke-width="2"/><rect x="54" y="20" width="26" height="60" rx="3" fill="#1e293b" stroke="#334155" stroke-width="2"/><circle cx="33" cy="38" r="7" fill="#0f172a" stroke="#475569" stroke-width="1.5"/><circle cx="33" cy="62" r="10" fill="#0f172a" stroke="#6366f1" stroke-width="1.5"/><circle cx="67" cy="38" r="7" fill="#0f172a" stroke="#475569" stroke-width="1.5"/><circle cx="67" cy="62" r="10" fill="#0f172a" stroke="#6366f1" stroke-width="1.5"/></svg>'
                }
            ];
        }
    };

    /* ══════════════════════════════════════════════
       2. ROUTER — CLIENT-SIDE HASH ROUTING
       ══════════════════════════════════════════════ */

    var router = {
        mount: null,
        routes: [],

        init(mountEl) {
            this.mount = mountEl;
            window.addEventListener('hashchange', () => this.route());
        },

        addRoute(path, viewFn) {
            var pattern = '^#' + path
                .replace(/\/:[^\/]+/g, '/([^/]+)')
                .replace(/\//g, '\\/') + '$';
            var paramNames = (path.match(/:[^\/]+/g) || []).map(function (p) { return p.slice(1); });
            this.routes.push({ regex: new RegExp(pattern), paramNames: paramNames, viewFn: viewFn });
        },

        route() {
            var hash = window.location.hash || '#/';
            // Strip query string for matching
            var matchHash = hash.split('?')[0];
            var match = null;

            for (var i = 0; i < this.routes.length; i++) {
                var r = this.routes[i];
                var m = matchHash.match(r.regex);
                if (m) {
                    var params = {};
                    r.paramNames.forEach(function (name, idx) {
                        params[name] = decodeURIComponent(m[idx + 1]);
                    });
                    match = { route: r, params: params };
                    break;
                }
            }

            if (!match) {
                window.location.hash = '#/';
                return;
            }

            this._render(match.route.viewFn, match.params);
        },

        _render(viewFn, params) {
            var self = this;
            // Loader transition
            this.mount.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

            // Small delay for transition effect
            setTimeout(function () {
                try {
                    var result = viewFn(params);
                    self.mount.innerHTML = result.html;
                    if (result.initActions) result.initActions();
                    self.mount.focus();
                    self._updateNav();
                    window.scrollTo(0, 0);
                } catch (e) {
                    console.error('View render failed:', e);
                    self.mount.innerHTML = '<div style="text-align:center;padding:60px 20px;"><h3>Something went wrong</h3><p style="color:var(--text-secondary);margin-bottom:20px;">Error: ' + e.message + '</p><a href="#/" class="primary-btn">Go Home</a></div>';
                }
            }, 80);
        },

        _updateNav() {
            var hash = window.location.hash || '#/';
            document.querySelectorAll('.nav-link').forEach(function (link) {
                var href = link.getAttribute('href');
                if (href === hash || (href !== '#/' && hash.indexOf(href) === 0)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        },

        start() { this.route(); }
    };

    /* ══════════════════════════════════════════════
       3. UTILITY HELPERS
       ══════════════════════════════════════════════ */

    function escapeHtml(text) {
        if (!text) return '';
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }

    function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

    function renderStars(rating) {
        return '<span style="color:#fbbf24;">★</span> <strong>' + rating + '</strong>';
    }

    function productCardHTML(product) {
        return '<article class="product-card">' +
            (product.badge ? '<span class="product-badge">' + product.badge + '</span>' : '') +
            '<a href="#/product/' + product.id + '" class="product-card-image" aria-hidden="true">' +
                product.svgIcon +
            '</a>' +
            '<div class="product-card-body">' +
                '<span class="product-card-category">' + capitalize(product.category) + '</span>' +
                '<h3 class="product-card-title"><a href="#/product/' + product.id + '">' + product.name + '</a></h3>' +
                '<div class="product-card-rating">' + renderStars(product.rating) + ' <span class="rating-count">(' + product.reviews + ')</span></div>' +
                '<div class="product-card-footer">' +
                    '<span class="product-card-price">$' + product.price.toFixed(2) + '</span>' +
                    '<button class="buy-btn-trigger add-to-cart" data-id="' + product.id + '" aria-label="Add to Cart">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</article>';
    }

    function bindAddToCartButtons(container) {
        container.querySelectorAll('.add-to-cart').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var id = parseInt(btn.dataset.id);
                store.addToCart(id, 1, {});
                var old = btn.innerHTML;
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                btn.disabled = true;
                setTimeout(function () { btn.innerHTML = old; btn.disabled = false; }, 1000);
            });
        });
    }

    /* ══════════════════════════════════════════════
       4. VIEWS
       ══════════════════════════════════════════════ */

    // ---------- HOME VIEW ----------
    function viewHome() {
        var featured = store.products.filter(function (p) { return p.featured; });
        var categories = [
            { key: 'audio', name: 'Premium Audio', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>' },
            { key: 'wearables', name: 'Smart Wearables', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="4"></rect><circle cx="12" cy="10" r="3"></circle><line x1="12" y1="16" x2="12" y2="18"></line></svg>' },
            { key: 'peripherals', name: 'Peripherals', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="12" rx="2"></rect><line x1="6" y1="20" x2="18" y2="20"></line><line x1="12" y1="16" x2="12" y2="20"></line></svg>' },
            { key: 'power', name: 'Charging', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M11 7 L9 13 L12 13 L11 17 L15 11 L12 11 Z"></path></svg>' }
        ];

        var html = '<section class="hero-banner" aria-label="Welcome Banner">' +
            '<div class="hero-content">' +
                '<h2>Elevate Your Tech Lifestyle</h2>' +
                '<p>Curated minimalist design meets peak performance. Discover the future of personal workspaces, audio accessories, and premium wearables.</p>' +
                '<a href="#/catalog" class="primary-btn"><span>Explore Catalog</span> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>' +
            '</div>' +
            '<div class="hero-visual" aria-hidden="true">' +
                '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="h-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/><stop offset="100%" stop-color="#080b1a" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="80" fill="url(#h-glow)"/><rect x="50" y="60" width="100" height="70" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(99,102,241,0.4)" stroke-width="2"/><circle cx="100" cy="95" r="22" fill="#6366f1" opacity="0.8"/><circle cx="100" cy="95" r="16" fill="#080b1a"/><circle cx="65" cy="75" r="4" fill="#a855f7"/><circle cx="135" cy="115" r="6" fill="#06b6d4"/></svg>' +
            '</div>' +
        '</section>' +
        '<section class="section"><div class="section-header"><h3>Featured Categories</h3></div>' +
            '<div class="categories-grid">' +
                categories.map(function (c) {
                    return '<div class="category-card" data-category="' + c.key + '"><div class="category-icon">' + c.icon + '</div><span class="category-name">' + c.name + '</span></div>';
                }).join('') +
            '</div>' +
        '</section>' +
        '<section class="section"><div class="section-header"><h3>Trending Products</h3></div>' +
            '<div class="products-mini-grid">' +
                featured.map(productCardHTML).join('') +
            '</div>' +
        '</section>';

        return {
            html: html,
            initActions: function () {
                var mount = document.getElementById('view-mount');
                document.querySelectorAll('.category-card').forEach(function (card) {
                    card.addEventListener('click', function () {
                        window.location.hash = '#/catalog?category=' + card.dataset.category;
                    });
                });
                bindAddToCartButtons(mount);
            }
        };
    }

    // ---------- CATALOG VIEW ----------
    function viewCatalog() {
        var hashParts = window.location.hash.split('?');
        var qp = new URLSearchParams(hashParts[1] || '');
        var activeCategory = qp.get('category') || 'all';
        var searchQuery = '';
        var minPrice = '';
        var maxPrice = '';
        var activeSort = 'featured';
        var categoriesList = [
            { key: 'all', name: 'All Products' },
            { key: 'audio', name: 'Premium Audio' },
            { key: 'wearables', name: 'Smart Wearables' },
            { key: 'peripherals', name: 'Peripherals' },
            { key: 'power', name: 'Charging' }
        ];

        function buildGrid() {
            var filtered = store.products.filter(function (p) {
                var catOk = activeCategory === 'all' || p.category === activeCategory;
                var searchOk = p.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0 || p.description.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;
                var minOk = minPrice === '' || p.price >= parseFloat(minPrice);
                var maxOk = maxPrice === '' || p.price <= parseFloat(maxPrice);
                return catOk && searchOk && minOk && maxOk;
            });
            if (activeSort === 'price-low') filtered.sort(function (a, b) { return a.price - b.price; });
            else if (activeSort === 'price-high') filtered.sort(function (a, b) { return b.price - a.price; });
            else if (activeSort === 'rating') filtered.sort(function (a, b) { return b.rating - a.rating; });

            if (filtered.length === 0) {
                return '<div class="catalog-empty"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><h3>No matches found</h3><p>Try adjusting your filters.</p></div>';
            }
            return '<div class="catalog-header-info"><span>Showing ' + filtered.length + ' products</span></div>' +
                '<div class="products-grid">' + filtered.map(productCardHTML).join('') + '</div>';
        }

        var html = '<div class="catalog-layout">' +
            '<aside class="catalog-filters"><div class="filter-group"><h4 class="filter-title">Search</h4><div class="filter-search-box"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" id="cat-search" class="search-input-field" placeholder="Search products..."></div></div>' +
            '<div class="filter-group"><h4 class="filter-title">Categories</h4><div class="category-pills">' +
                categoriesList.map(function (c) {
                    return '<button class="pill-btn ' + (activeCategory === c.key ? 'active' : '') + '" data-category="' + c.key + '">' + c.name + '</button>';
                }).join('') +
            '</div></div>' +
            '<div class="filter-group"><h4 class="filter-title">Price Range</h4><div class="price-inputs"><input type="number" id="price-min" class="price-field" placeholder="Min" min="0"><input type="number" id="price-max" class="price-field" placeholder="Max" min="0"></div></div>' +
            '<div class="filter-group"><h4 class="filter-title">Sort By</h4><select id="cat-sort" class="sort-select"><option value="featured">Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top Rated</option></select></div>' +
            '</aside>' +
            '<section class="catalog-content" id="catalog-content">' + buildGrid() + '</section>' +
        '</div>';

        return {
            html: html,
            initActions: function () {
                var mount = document.getElementById('view-mount');
                var content = document.getElementById('catalog-content');

                function refresh() {
                    content.innerHTML = buildGrid();
                    bindAddToCartButtons(content);
                }

                bindAddToCartButtons(content);

                mount.addEventListener('click', function (e) {
                    var pill = e.target.closest('.pill-btn');
                    if (pill) {
                        mount.querySelectorAll('.pill-btn').forEach(function (b) { b.classList.remove('active'); });
                        pill.classList.add('active');
                        activeCategory = pill.dataset.category;
                        refresh();
                    }
                });

                document.getElementById('cat-search').addEventListener('input', function (e) {
                    searchQuery = e.target.value;
                    refresh();
                });

                document.getElementById('price-min').addEventListener('input', function (e) { minPrice = e.target.value; refresh(); });
                document.getElementById('price-max').addEventListener('input', function (e) { maxPrice = e.target.value; refresh(); });
                document.getElementById('cat-sort').addEventListener('change', function (e) { activeSort = e.target.value; refresh(); });
            }
        };
    }

    // ---------- DETAILS VIEW ----------
    function viewDetails(params) {
        var productId = parseInt(params.id);
        var product = store.products.find(function (p) { return p.id === productId; });

        if (!product) {
            return { html: '<div style="text-align:center;padding:60px 20px;"><h3>Product Not Found</h3><a href="#/catalog" class="primary-btn">Back to Catalog</a></div>' };
        }

        var selectedSize = product.sizes[0] || '';
        var selectedColor = product.colors[0] || '';
        var quantity = 1;

        var specsRows = '';
        for (var key in product.specifications) {
            specsRows += '<tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:10px;font-weight:600;color:var(--text-secondary);width:40%;background:var(--bg-glass);">' + key + '</td><td style="padding:10px;">' + product.specifications[key] + '</td></tr>';
        }

        var html = '<div style="margin-bottom:20px;"><a href="#/catalog" class="pill-btn" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-surface);border:1px solid var(--border-subtle);">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back to Catalog</a></div>' +
            '<div class="details-grid">' +
                '<div class="details-visual">' + product.svgIcon + '</div>' +
                '<div class="details-info">' +
                    '<span class="details-category">' + capitalize(product.category) + '</span>' +
                    '<h2 class="details-title">' + product.name + '</h2>' +
                    '<div class="details-rating">' + renderStars(product.rating) + ' <span style="color:var(--text-muted);">(' + product.reviews + ' reviews)</span></div>' +
                    '<div class="details-price">$' + product.price.toFixed(2) + '</div>' +
                    '<p class="details-description">' + product.description + '</p>' +
                    '<div class="options-selector-group"><h4 class="selector-label">Specifications</h4><table style="width:100%;font-size:0.85rem;border-collapse:collapse;border:1px solid var(--border-subtle);"><tbody>' + specsRows + '</tbody></table></div>' +
                    (product.sizes.length > 1 ? '<div class="options-selector-group"><h4 class="selector-label">Select Size</h4><div class="chips-container" id="sizes-chips">' + product.sizes.map(function (s) { return '<button class="chip-btn ' + (selectedSize === s ? 'active' : '') + '" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div></div>' : '') +
                    (product.colors.length > 1 ? '<div class="options-selector-group"><h4 class="selector-label">Select Color</h4><div class="chips-container" id="colors-chips">' + product.colors.map(function (c) { return '<button class="color-dot-btn ' + (selectedColor === c ? 'active' : '') + '" data-color="' + c + '"><span style="background-color:' + c + ';"></span></button>'; }).join('') + '</div></div>' : '') +
                    '<div class="purchase-controls">' +
                        '<div class="quantity-control"><button class="qty-btn" id="qty-minus">−</button><span class="qty-value" id="qty-value">1</span><button class="qty-btn" id="qty-plus">+</button></div>' +
                        '<button class="primary-btn add-cart-btn" id="add-to-cart-btn"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> <span>Add to Cart</span></button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        return {
            html: html,
            initActions: function () {
                var sizesEl = document.getElementById('sizes-chips');
                var colorsEl = document.getElementById('colors-chips');

                if (sizesEl) sizesEl.addEventListener('click', function (e) {
                    var b = e.target.closest('.chip-btn');
                    if (b) { sizesEl.querySelectorAll('.chip-btn').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); selectedSize = b.dataset.size; }
                });

                if (colorsEl) colorsEl.addEventListener('click', function (e) {
                    var b = e.target.closest('.color-dot-btn');
                    if (b) { colorsEl.querySelectorAll('.color-dot-btn').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); selectedColor = b.dataset.color; }
                });

                var qtyVal = document.getElementById('qty-value');
                document.getElementById('qty-minus').addEventListener('click', function () { if (quantity > 1) { quantity--; qtyVal.textContent = quantity; } });
                document.getElementById('qty-plus').addEventListener('click', function () { quantity++; qtyVal.textContent = quantity; });

                document.getElementById('add-to-cart-btn').addEventListener('click', function () {
                    store.addToCart(productId, quantity, { size: selectedSize, color: selectedColor });
                    var btn = document.getElementById('add-to-cart-btn');
                    var lbl = btn.querySelector('span');
                    lbl.textContent = 'Added to Cart!';
                    btn.style.background = '#10b981';
                    btn.disabled = true;
                    setTimeout(function () { lbl.textContent = 'Add to Cart'; btn.style.background = ''; btn.disabled = false; }, 1200);
                });
            }
        };
    }

    // ---------- CART VIEW ----------
    function viewCart() {
        function buildCartHtml() {
            var items = store.getCart();
            if (items.length === 0) {
                return '<div class="empty-cart-state"><svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg><h2>Your Cart is Empty</h2><p style="color:var(--text-secondary);margin:10px 0 24px;">Add items to see them here.</p><a href="#/catalog" class="primary-btn">Start Shopping</a></div>';
            }
            var sub = store.getCartSubtotal();
            var tax = sub * 0.08;
            var ship = sub > 150 ? 0 : 15;
            var total = store.getCartTotal();

            return '<div class="cart-layout"><div class="cart-items-panel"><h2 class="cart-title">Your Shopping Cart</h2><div class="cart-list">' +
                items.map(function (item) {
                    return '<div class="cart-item-row" data-id="' + item.id + '">' +
                        '<div class="cart-item-visual">' + item.svgIcon + '</div>' +
                        '<div class="cart-item-info"><h3 class="cart-item-name"><a href="#/product/' + item.productId + '">' + item.name + '</a></h3><div class="cart-item-meta">' + (item.options.size ? 'Size: ' + item.options.size : '') + '</div></div>' +
                        '<div class="quantity-control" style="transform:scale(0.9);"><button class="qty-btn qty-change" data-id="' + item.id + '" data-action="minus">−</button><span class="qty-value">' + item.quantity + '</span><button class="qty-btn qty-change" data-id="' + item.id + '" data-action="plus">+</button></div>' +
                        '<div class="cart-item-price">$' + (item.price * item.quantity).toFixed(2) + '</div>' +
                        '<button class="remove-item-btn remove-trigger" data-id="' + item.id + '"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div>';
                }).join('') +
            '</div></div>' +
            '<div class="cart-summary-panel"><h3 class="summary-title">Order Summary</h3><div class="summary-rows">' +
                '<div class="summary-row"><span>Subtotal</span><span>$' + sub.toFixed(2) + '</span></div>' +
                '<div class="summary-row"><span>Tax (8%)</span><span>$' + tax.toFixed(2) + '</span></div>' +
                '<div class="summary-row"><span>Shipping</span><span>' + (ship === 0 ? '<strong style="color:#22c55e;">FREE</strong>' : '$' + ship.toFixed(2)) + '</span></div>' +
                (ship > 0 ? '<div style="font-size:0.72rem;color:var(--accent-indigo);text-align:right;">Add $' + (150 - sub).toFixed(2) + ' more for free shipping!</div>' : '') +
                '<div class="summary-row total"><span>Total</span><span>$' + total.toFixed(2) + '</span></div>' +
            '</div><a href="#/checkout" class="primary-btn checkout-btn" style="justify-content:center;">Proceed to Checkout</a><a href="#/catalog" style="font-size:0.8rem;color:var(--text-muted);text-align:center;display:block;margin-top:6px;">Continue Shopping</a></div></div>';
        }

        return {
            html: buildCartHtml(),
            initActions: function () {
                var mount = document.getElementById('view-mount');
                function refresh() { mount.innerHTML = buildCartHtml(); bindCartEvents(); }
                function bindCartEvents() {
                    mount.querySelectorAll('.qty-change').forEach(function (btn) {
                        btn.addEventListener('click', function () {
                            var id = btn.dataset.id;
                            var row = mount.querySelector('.cart-item-row[data-id="' + id + '"]');
                            var qty = parseInt(row.querySelector('.qty-value').textContent);
                            store.updateCartQuantity(id, btn.dataset.action === 'minus' ? qty - 1 : qty + 1);
                            refresh();
                        });
                    });
                    mount.querySelectorAll('.remove-trigger').forEach(function (btn) {
                        btn.addEventListener('click', function () { store.removeFromCart(btn.dataset.id); refresh(); });
                    });
                }
                bindCartEvents();
            }
        };
    }

    // ---------- CHECKOUT VIEW ----------
    function viewCheckout() {
        var items = store.getCart();
        if (items.length === 0) {
            return { html: '<div style="text-align:center;padding:60px 20px;"><h3>Cart is Empty</h3><p style="color:var(--text-secondary);margin-bottom:20px;">Add items before checkout.</p><a href="#/catalog" class="primary-btn">Start Shopping</a></div>' };
        }
        var sub = store.getCartSubtotal();
        var tax = sub * 0.08;
        var ship = sub > 150 ? 0 : 15;
        var total = store.getCartTotal();
        var step = 1;

        function stepIndicators() {
            return '<div class="checkout-steps">' +
                '<div class="step-indicator ' + (step >= 1 ? 'active' : '') + '"><div class="step-num">1</div><div class="step-label">Shipping</div></div>' +
                '<div class="step-indicator ' + (step >= 2 ? 'active' : '') + '"><div class="step-num">2</div><div class="step-label">Payment</div></div>' +
                '<div class="step-indicator ' + (step >= 3 ? 'active' : '') + '"><div class="step-num">3</div><div class="step-label">Confirm</div></div>' +
            '</div>';
        }

        function summaryPanel() {
            return '<div class="cart-summary-panel"><h3 class="summary-title">Summary</h3>' +
                '<div style="display:flex;flex-direction:column;gap:10px;max-height:220px;overflow-y:auto;border-bottom:1px solid var(--border-subtle);padding-bottom:14px;">' +
                    items.map(function (i) { return '<div style="display:flex;justify-content:space-between;font-size:0.82rem;color:var(--text-secondary);"><span>' + i.name + ' (x' + i.quantity + ')</span><span>$' + (i.price * i.quantity).toFixed(2) + '</span></div>'; }).join('') +
                '</div><div class="summary-rows">' +
                    '<div class="summary-row"><span>Subtotal</span><span>$' + sub.toFixed(2) + '</span></div>' +
                    '<div class="summary-row"><span>Tax</span><span>$' + tax.toFixed(2) + '</span></div>' +
                    '<div class="summary-row"><span>Shipping</span><span>' + (ship === 0 ? 'FREE' : '$' + ship.toFixed(2)) + '</span></div>' +
                    '<div class="summary-row total"><span>Total</span><span>$' + total.toFixed(2) + '</span></div>' +
                '</div></div>';
        }

        function buildHtml() {
            if (step === 3) {
                return '<div class="success-screen"><div class="success-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></div><h2>Order Confirmed!</h2><p>Thank you for your purchase. Your order #NXS-' + Math.floor(100000 + Math.random() * 900000) + ' is on the way!</p><a href="#/" class="primary-btn" style="width:100%;justify-content:center;">Continue Shopping</a></div>';
            }

            return '<div class="checkout-layout"><div class="checkout-form-panel">' + stepIndicators() +
                '<form id="checkout-form">' +
                    (step === 1 ?
                        '<h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:18px;">Shipping Details</h3>' +
                        '<div class="form-fields-grid">' +
                            '<div class="checkout-form-group field-full-width"><label>Full Name</label><input type="text" class="checkout-input-field" placeholder="John Doe" required></div>' +
                            '<div class="checkout-form-group field-full-width"><label>Email</label><input type="email" class="checkout-input-field" placeholder="john@example.com" required></div>' +
                            '<div class="checkout-form-group field-full-width"><label>Address</label><input type="text" class="checkout-input-field" placeholder="123 Luxury Ave" required></div>' +
                            '<div class="checkout-form-group"><label>City</label><input type="text" class="checkout-input-field" placeholder="New York" required></div>' +
                            '<div class="checkout-form-group"><label>ZIP Code</label><input type="text" class="checkout-input-field" placeholder="10001" required></div>' +
                        '</div>' +
                        '<button type="submit" class="primary-btn" style="margin-top:24px;justify-content:center;">Continue to Payment →</button>'
                    :
                        '<h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:18px;">Payment Details</h3>' +
                        '<div class="form-fields-grid">' +
                            '<div class="checkout-form-group field-full-width"><label>Card Number</label><input type="text" class="checkout-input-field" placeholder="4111 2222 3333 4444" required></div>' +
                            '<div class="checkout-form-group field-full-width"><label>Name on Card</label><input type="text" class="checkout-input-field" placeholder="John Doe" required></div>' +
                            '<div class="checkout-form-group"><label>Expiry</label><input type="text" class="checkout-input-field" placeholder="MM/YY" required></div>' +
                            '<div class="checkout-form-group"><label>CVV</label><input type="password" class="checkout-input-field" placeholder="***" required></div>' +
                        '</div>' +
                        '<div style="display:flex;gap:12px;margin-top:28px;"><button type="button" id="prev-step-btn" class="pill-btn" style="border:1px solid var(--border-subtle);padding:10px 20px;font-weight:600;">Back</button><button type="submit" class="primary-btn" style="flex:1;justify-content:center;">Complete Purchase →</button></div>'
                    ) +
                '</form></div>' + summaryPanel() + '</div>';
        }

        return {
            html: buildHtml(),
            initActions: function () {
                var mount = document.getElementById('view-mount');
                function bindForm() {
                    var form = document.getElementById('checkout-form');
                    if (!form) return;
                    form.addEventListener('submit', function (e) {
                        e.preventDefault();
                        if (step === 1) { step = 2; } else { step = 3; store.clearCart(); }
                        mount.innerHTML = buildHtml();
                        bindForm();
                    });
                    var back = document.getElementById('prev-step-btn');
                    if (back) back.addEventListener('click', function () { step = 1; mount.innerHTML = buildHtml(); bindForm(); });
                }
                bindForm();
            }
        };
    }

    /* ══════════════════════════════════════════════
       5. APP BOOTSTRAP
       ══════════════════════════════════════════════ */

    document.addEventListener('DOMContentLoaded', function () {
        // Initialize Store
        store.init();

        // Theme toggle
        var themeBtn = document.getElementById('theme-toggle');
        var htmlEl = document.documentElement;
        var savedTheme = localStorage.getItem('nexusshop-theme') || 'dark';
        htmlEl.setAttribute('data-theme', savedTheme);

        themeBtn.addEventListener('click', function () {
            var current = htmlEl.getAttribute('data-theme');
            var next = current === 'light' ? 'dark' : 'light';
            htmlEl.setAttribute('data-theme', next);
            localStorage.setItem('nexusshop-theme', next);
        });

        // Cart badge updates
        var badge = document.getElementById('cart-badge');
        function updateBadge() {
            var count = store.getCartCount();
            badge.textContent = count;
            badge.style.display = count === 0 ? 'none' : 'flex';
        }
        updateBadge();
        store.on(updateBadge);

        // Router init
        var mountNode = document.getElementById('view-mount');
        router.init(mountNode);

        router.addRoute('/', viewHome);
        router.addRoute('/catalog', viewCatalog);
        router.addRoute('/product/:id', viewDetails);
        router.addRoute('/cart', viewCart);
        router.addRoute('/checkout', viewCheckout);

        router.start();
    });

})();
