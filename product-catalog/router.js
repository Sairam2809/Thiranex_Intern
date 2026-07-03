/* ============================================
   NexusShop — Client-side Routing Engine
   ============================================ */

export class Router {
    constructor(mountElement) {
        this.mount = mountElement;
        this.routes = [];
        
        // Bind event listeners for hash changes
        window.addEventListener('hashchange', () => this.route());
    }

    addRoute(path, viewRenderer) {
        // Convert route pattern (e.g. '/product/:id') to regex
        // /product/:id -> ^#/product/([^/]+)$
        const pattern = '^#' + path
            .replace(/\/:[^\/]+/g, '/([^/]+)')
            .replace(/\//g, '\\/') + '$';

        // Extract param names
        // e.g. ['id']
        const paramNames = (path.match(/:[^\/]+/g) || [])
            .map(p => p.slice(1));

        this.routes.push({
            regex: new RegExp(pattern),
            paramNames,
            viewRenderer
        });
    }

    route() {
        const hash = window.location.hash || '#/';
        
        // Find matching route
        let match = null;
        for (const route of this.routes) {
            const matches = hash.match(route.regex);
            if (matches) {
                // Extract dynamic URL parameters
                const params = {};
                route.paramNames.forEach((name, idx) => {
                    params[name] = decodeURIComponent(matches[idx + 1]);
                });
                
                match = { route, params };
                break;
            }
        }

        // If no route matches, fall back to Home
        if (!match) {
            window.location.hash = '#/';
            return;
        }

        // Render the matched view
        this._renderView(match.route.viewRenderer, match.params);
    }

    async _renderView(renderer, params) {
        // Show loader transition
        this.mount.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>
        `;

        try {
            // Get view HTML structure and component actions
            const { html, initActions } = await renderer(params);
            
            // Apply view content
            this.mount.innerHTML = html;
            
            // Execute view dynamic JS/event triggers
            if (initActions) initActions();

            // Accessibility: Move focus to mount container
            this.mount.focus();
            
            // Update active navbar indicator class
            this._updateNavHighlight();

            // Scroll window to top
            window.scrollTo(0, 0);
        } catch (e) {
            console.error("View rendering failed", e);
            this.mount.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h3>Oops! Something went wrong</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">We couldn't load this page.</p>
                    <a href="#/" class="primary-btn">Go to Homepage</a>
                </div>
            `;
        }
    }

    _updateNavHighlight() {
        const hash = window.location.hash || '#/';
        const links = document.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Strict check or prefix check for navigation subpaths
            if (href === hash || (href !== '#/' && hash.startsWith(href))) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    start() {
        // Trigger initial route
        this.route();
    }
}
