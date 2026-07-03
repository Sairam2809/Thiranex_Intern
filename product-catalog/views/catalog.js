/* ============================================
   NexusShop — Catalog View Render Module
   ============================================ */

import { store } from '../store.js';

export function renderCatalog() {
    // 1. Read category filter preset from dynamic hash query params (if any)
    const hashParts = window.location.hash.split('?');
    const queryStr = hashParts[1] || '';
    const queryParams = new URLSearchParams(queryStr);
    let activeCategory = queryParams.get('category') || 'all';
    let searchQuery = '';
    let minPrice = '';
    let maxPrice = '';
    let activeSort = 'featured';

    function buildCatalogHtml() {
        // Filter products locally based on current states
        const filtered = store.products.filter(product => {
            const matchesCat = activeCategory === 'all' || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 product.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const price = product.price;
            const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
            const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);

            return matchesCat && matchesSearch && matchesMinPrice && matchesMaxPrice;
        });

        // Sort items
        if (activeSort === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (activeSort === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (activeSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        const categoriesList = [
            { key: 'all', name: 'All Products' },
            { key: 'audio', name: 'Premium Audio' },
            { key: 'wearables', name: 'Smart Wearables' },
            { key: 'peripherals', name: 'Workspace Peripherals' },
            { key: 'power', name: 'Charging Stations' }
        ];

        return `
            <div class="catalog-layout">
                <!-- Sidebar filter panel -->
                <aside class="catalog-filters" aria-label="Catalog Filters">
                    <!-- Search Input -->
                    <div class="filter-group">
                        <h4 class="filter-title">Search</h4>
                        <div class="filter-search-box">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="cat-search" class="search-input-field" placeholder="Search product name..." value="${escapeHtml(searchQuery)}" aria-label="Search Catalog">
                        </div>
                    </div>

                    <!-- Category filter list -->
                    <div class="filter-group">
                        <h4 class="filter-title">Categories</h4>
                        <div class="category-pills">
                            ${categoriesList.map(cat => `
                                <button class="pill-btn ${activeCategory === cat.key ? 'active' : ''}" data-category="${cat.key}">
                                    ${cat.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Price Filter inputs -->
                    <div class="filter-group">
                        <h4 class="filter-title">Price Range</h4>
                        <div class="price-inputs">
                            <input type="number" id="price-min" class="price-field" placeholder="Min" value="${minPrice}" min="0" aria-label="Minimum Price">
                            <input type="number" id="price-max" class="price-field" placeholder="Max" value="${maxPrice}" min="0" aria-label="Maximum Price">
                        </div>
                    </div>

                    <!-- Sorting options dropdown -->
                    <div class="filter-group">
                        <h4 class="filter-title">Sort By</h4>
                        <select id="cat-sort" class="sort-select" aria-label="Sort products">
                            <option value="featured" ${activeSort === 'featured' ? 'selected' : ''}>Featured</option>
                            <option value="price-low" ${activeSort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                            <option value="price-high" ${activeSort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                            <option value="rating" ${activeSort === 'rating' ? 'selected' : ''}>Top Rated</option>
                        </select>
                    </div>
                </aside>

                <!-- Grid Catalog Grid -->
                <section class="catalog-content" aria-labelledby="catalog-title">
                    <h2 id="catalog-title" class="sr-only">Product List</h2>
                    <div class="catalog-header-info">
                        <span>Showing ${filtered.length} products</span>
                    </div>

                    ${filtered.length === 0 ? `
                        <div class="catalog-empty">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <h3>No matches found</h3>
                            <p>Try resetting filters or expanding search inputs.</p>
                        </div>
                    ` : `
                        <div class="products-grid">
                            ${filtered.map(product => `
                                <article class="product-card">
                                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                                    <div class="product-card-image" aria-hidden="true">
                                        ${product.svgIcon}
                                    </div>
                                    <div class="product-card-body">
                                        <span class="product-card-category">${product.category}</span>
                                        <h3 class="product-card-title">
                                            <a href="#/product/${product.id}">${product.name}</a>
                                        </h3>
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
                    `}
                </section>
            </div>
        `;
    }

    const html = buildCatalogHtml();

    const initActions = () => {
        const mount = document.getElementById('view-mount');

        // Render dynamic updates on controls events
        const updateListing = () => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = buildCatalogHtml();
            
            // Swap grid and counts without fully rebuilding sidebar to maintain input focus
            const oldGrid = mount.querySelector('.catalog-content');
            const newGrid = tempDiv.querySelector('.catalog-content');
            if (oldGrid && newGrid) {
                oldGrid.replaceWith(newGrid);
            }
            bindEvents();
        };

        const bindEvents = () => {
            // "Add to Cart" button handlers
            mount.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const id = parseInt(button.dataset.id);
                    store.addToCart(id, 1, {});
                    
                    // Success badge feedback
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

        // Listen for filter buttons clicks
        mount.addEventListener('click', (e) => {
            const pill = e.target.closest('.pill-btn');
            if (pill) {
                mount.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                pill.classList.add('active');
                activeCategory = pill.dataset.category;
                
                // Update URL quietly without router reload
                const newHash = `#/catalog?category=${activeCategory}`;
                history.replaceState(null, null, newHash);
                
                updateListing();
            }
        });

        // Search inputs listeners
        const searchInput = mount.querySelector('#cat-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                updateListing();
            });
        }

        // Price limit inputs listeners
        const priceMin = mount.querySelector('#price-min');
        const priceMax = mount.querySelector('#price-max');
        const priceHandler = () => {
            minPrice = priceMin.value;
            maxPrice = priceMax.value;
            updateListing();
        };
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', priceHandler);
            priceMax.addEventListener('input', priceHandler);
        }

        // Sorting dropdown list selection handler
        const sortSelect = mount.querySelector('#cat-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                activeSort = e.target.value;
                updateListing();
            });
        }

        bindEvents();
    };

    // Helper functions
    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    return { html, initActions };
}
