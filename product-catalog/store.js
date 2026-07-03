/* ============================================
   NexusShop — Shared Store & State Management
   ============================================ */

class Store extends EventTarget {
    constructor() {
        super();
        this.products = this._getMockProducts();
        this.cart = this._loadCart();
    }

    // --- CART ACTIONS ---
    getCart() {
        return this.cart;
    }

    addToCart(productId, quantity = 1, options = {}) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const cartItemId = `${productId}-${options.size || 'default'}-${options.color || 'default'}`;
        const existingItem = this.cart.find(item => item.id === cartItemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: cartItemId,
                productId,
                name: product.name,
                price: product.price,
                category: product.category,
                svgIcon: product.svgIcon,
                options,
                quantity
            });
        }

        this._saveCart();
        this.dispatchEvent(new CustomEvent('cart-changed'));
    }

    updateCartQuantity(cartItemId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(cartItemId);
            return;
        }

        const item = this.cart.find(i => i.id === cartItemId);
        if (item) {
            item.quantity = quantity;
            this._saveCart();
            this.dispatchEvent(new CustomEvent('cart-changed'));
        }
    }

    removeFromCart(cartItemId) {
        this.cart = this.cart.filter(item => item.id !== cartItemId);
        this._saveCart();
        this.dispatchEvent(new CustomEvent('cart-changed'));
    }

    clearCart() {
        this.cart = [];
        this._saveCart();
        this.dispatchEvent(new CustomEvent('cart-changed'));
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartTotal() {
        const subtotal = this.getCartSubtotal();
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15; // Free shipping above $150
        return subtotal + tax + shipping;
    }

    // --- PRIVATE METHODS ---
    _loadCart() {
        const saved = localStorage.getItem('nexusshop-cart');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    }

    _saveCart() {
        localStorage.setItem('nexusshop-cart', JSON.stringify(this.cart));
    }

    // --- STATIC MOCK PRODUCT DATA (STUNNING SVG ICONS INLINE) ---
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
                specifications: {
                    "Driver Size": "40mm Dynamic",
                    "Battery Life": "Up to 45 Hours",
                    "Connectivity": "Bluetooth 5.2 / Aux",
                    "Weight": "250g"
                },
                sizes: ["Standard"],
                colors: ["#1e293b", "#e2e8f0"], // Charcoal, Silver
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="g-head" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#6366f1" />
                            <stop offset="100%" stop-color="#a855f7" />
                        </linearGradient>
                    </defs>
                    <path d="M20 50 C20 25, 80 25, 80 50" stroke="url(#g-head)" stroke-width="6" fill="none" stroke-linecap="round" />
                    <rect x="15" y="45" width="14" height="25" rx="7" fill="url(#g-head)" />
                    <rect x="71" y="45" width="14" height="25" rx="7" fill="url(#g-head)" />
                    <rect x="25" y="40" width="4" height="30" rx="2" fill="#475569" />
                    <rect x="71" y="40" width="4" height="30" rx="2" fill="#475569" />
                </svg>
                `
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
                specifications: {
                    "Display": "1.43\" AMOLED",
                    "Water Resistance": "5ATM (50m)",
                    "Battery Life": "Up to 12 Days",
                    "Sensors": "Heart, SpO2, GPS"
                },
                sizes: ["40mm", "44mm"],
                colors: ["#0f172a", "#3b82f6", "#ef4444"],
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="g-watch" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#06b6d4" />
                            <stop offset="100%" stop-color="#3b82f6" />
                        </linearGradient>
                    </defs>
                    <rect x="40" y="10" width="20" height="80" rx="4" fill="#334155" />
                    <circle cx="50" cy="50" r="26" fill="url(#g-watch)" />
                    <circle cx="50" cy="50" r="22" fill="#0f172a" />
                    <circle cx="50" cy="50" r="16" stroke="#06b6d4" stroke-width="1.5" fill="none" stroke-dasharray="8 4" />
                    <text x="50" y="55" fill="white" font-size="10" font-family="Outfit" font-weight="bold" text-anchor="middle">10:45</text>
                </svg>
                `
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
                specifications: {
                    "Switches": "Linear Red (Hot-swap)",
                    "Layout": "75% Compact",
                    "Keycaps": "Doubleshot PBT",
                    "Cable": "Detachable Coiled USB-C"
                },
                sizes: ["Standard"],
                colors: ["#1e293b", "#f8fafc"],
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="15" y="30" width="70" height="40" rx="6" fill="#334155" stroke="#475569" stroke-width="2" />
                    <rect x="20" y="36" width="8" height="8" rx="2" fill="#6366f1" />
                    <rect x="30" y="36" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="40" y="36" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="50" y="36" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="60" y="36" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="70" y="36" width="8" height="8" rx="2" fill="#a855f7" />
                    
                    <rect x="20" y="47" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="30" y="47" width="8" height="8" rx="2" fill="#e2e8f0" />
                    <rect x="40" y="47" width="28" height="8" rx="2" fill="#6366f1" />
                    <rect x="70" y="47" width="8" height="8" rx="2" fill="#e2e8f0" />
                </svg>
                `
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
                specifications: {
                    "Max Output": "140W Total PD",
                    "Ports": "3x USB-C / 1x USB-A",
                    "Wireless Qi": "Dual 15W MagSafe Docks",
                    "Material": "Anodized Space Gray Aluminum"
                },
                sizes: ["Standard"],
                colors: ["#334155"],
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="20" width="40" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2" />
                    <circle cx="50" cy="45" r="14" stroke="#6366f1" stroke-width="2" fill="none" />
                    <path d="M50 38 L46 47 L50 47 L50 52 L54 43 L50 43 Z" fill="#6366f1" />
                    <rect x="38" y="68" width="6" height="4" rx="1" fill="#475569" />
                    <rect x="47" y="68" width="6" height="4" rx="1" fill="#475569" />
                    <rect x="56" y="68" width="6" height="4" rx="1" fill="#6366f1" />
                </svg>
                `
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
                specifications: {
                    "Lens Type": "Photochromic Polarized",
                    "Speakers": "Open-ear Spatial Audio",
                    "Weight": "42g",
                    "Battery Life": "Up to 6 Hours Active"
                },
                sizes: ["Classic Slim", "Wide Fit"],
                colors: ["#000000", "#1e293b", "#d97706"],
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 35 C20 30, 45 30, 48 35 C51 30, 76 30, 81 35 L85 50 C83 56, 52 56, 49 46 C46 56, 15 56, 13 50 Z" fill="#0f172a" stroke="#a855f7" stroke-width="2" />
                    <circle cx="31" cy="43" r="6" fill="#a855f7" opacity="0.3" />
                    <circle cx="67" cy="43" r="6" fill="#a855f7" opacity="0.3" />
                    <line x1="15" y1="35" x2="5" y2="30" stroke="#334155" stroke-width="3" stroke-linecap="round" />
                    <line x1="81" y1="35" x2="91" y2="30" stroke="#334155" stroke-width="3" stroke-linecap="round" />
                </svg>
                `
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
                specifications: {
                    "Power Output": "60W RMS",
                    "Frequency Response": "50Hz - 20kHz",
                    "Inputs": "Bluetooth, AUX, Optical",
                    "Cabinet Material": "Acoustic Composite Wood"
                },
                sizes: ["StandardPair"],
                colors: ["#0f172a", "#854d0e"],
                svgIcon: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="26" height="60" rx="3" fill="#1e293b" stroke="#334155" stroke-width="2" />
                    <rect x="54" y="20" width="26" height="60" rx="3" fill="#1e293b" stroke="#334155" stroke-width="2" />
                    
                    <circle cx="33" cy="38" r="7" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
                    <circle cx="33" cy="62" r="10" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" />
                    
                    <circle cx="67" cy="38" r="7" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
                    <circle cx="67" cy="62" r="10" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" />
                </svg>
                `
            }
        ];
    }
}

// Export single instance
export const store = new Store();
