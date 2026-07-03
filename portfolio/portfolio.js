/* ============================================
   Portfolio — Advanced Interactive JavaScript
   Theme System · Navigation · Animations
   ============================================ */

// ─── DOM References ──────────────────────────────────────────
const DOM = {
    menuToggle:     document.getElementById('menu-toggle'),
    mainNav:        document.getElementById('main-navigation'),
    particlesBg:    document.querySelector('.particles-bg'),
    contactForm:    document.getElementById('contact-form'),
    formSuccess:    document.getElementById('form-success'),
    filterBtns:     document.querySelectorAll('.filter-btn'),
    projectCards:   document.querySelectorAll('.project-card'),
    projectsGrid:   document.getElementById('projects-grid'),
    themeToggle:    document.getElementById('theme-toggle'),
    siteHeader:     document.querySelector('.site-header'),
};


// ─── Theme System ────────────────────────────────────────────

/**
 * Gets the user's preferred theme.
 * Priority: localStorage > OS preference > 'dark' default.
 * @returns {'dark'|'light'}
 */
function getPreferredTheme() {
    const stored = localStorage.getItem('portfolio-theme');
    if (stored === 'dark' || stored === 'light') return stored;

    // Detect OS preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
}

/**
 * Applies the given theme to the document.
 * Updates data-theme attribute, ARIA label, and localStorage.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    // Update toggle button ARIA
    if (DOM.themeToggle) {
        const label = theme === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode';
        DOM.themeToggle.setAttribute('aria-label', label);
    }
}

/**
 * Toggles between dark and light themes.
 */
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
}

// Initialize theme immediately (before paint)
applyTheme(getPreferredTheme());

// Theme toggle click
if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
}

// Listen for OS theme changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    const stored = localStorage.getItem('portfolio-theme');
    if (!stored) {
        applyTheme(e.matches ? 'light' : 'dark');
    }
});


// ─── Header Scroll Effect ────────────────────────────────────

/**
 * Adds a 'scrolled' class to the header when the user scrolls down,
 * giving it an elevated shadow effect.
 */
function initHeaderScroll() {
    if (!DOM.siteHeader) return;

    const onScroll = () => {
        if (window.scrollY > 20) {
            DOM.siteHeader.classList.add('scrolled');
        } else {
            DOM.siteHeader.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on init
}


// ─── Mobile Navigation ───────────────────────────────────────

/**
 * Toggles the mobile navigation menu.
 * Handles ARIA attributes and focus trapping for keyboard users.
 */
function toggleMobileMenu() {
    if (!DOM.menuToggle || !DOM.mainNav) return;

    const isOpen = DOM.menuToggle.getAttribute('aria-expanded') === 'true';

    DOM.menuToggle.setAttribute('aria-expanded', String(!isOpen));
    DOM.menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    DOM.mainNav.classList.toggle('open', !isOpen);

    if (!isOpen) {
        // Focus the first nav link when menu opens
        const firstLink = DOM.mainNav.querySelector('.nav-link');
        if (firstLink) firstLink.focus();

        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
    } else {
        // Restore body scroll
        document.body.style.overflow = '';
        // Return focus to toggle button
        DOM.menuToggle.focus();
    }
}

/**
 * Closes the mobile menu — called on Escape key or link click.
 */
function closeMobileMenu() {
    if (!DOM.menuToggle || !DOM.mainNav) return;

    DOM.menuToggle.setAttribute('aria-expanded', 'false');
    DOM.menuToggle.setAttribute('aria-label', 'Open navigation menu');
    DOM.mainNav.classList.remove('open');
    document.body.style.overflow = '';
}

// Menu toggle click
if (DOM.menuToggle) {
    DOM.menuToggle.addEventListener('click', toggleMobileMenu);
}

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const isOpen = DOM.menuToggle?.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMobileMenu();
            DOM.menuToggle.focus();
        }
    }
});

// Close mobile menu when a nav link is clicked
if (DOM.mainNav) {
    DOM.mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const isOpen = DOM.menuToggle?.getAttribute('aria-expanded') === 'true';
            if (isOpen) closeMobileMenu();
        });
    });
}

// Focus trap inside mobile nav
if (DOM.mainNav) {
    DOM.mainNav.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        const isOpen = DOM.menuToggle?.getAttribute('aria-expanded') === 'true';
        if (!isOpen) return;

        const focusableElements = DOM.mainNav.querySelectorAll('a, button');
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
        }
    });
}

// ─── Background Particles ────────────────────────────────────

/**
 * Initializes floating background particles for visual enhancement.
 * Particles are marked aria-hidden and purely decorative.
 */
function initParticles() {
    if (!DOM.particlesBg) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const count = 20;
    const colors = [
        'rgba(91, 140, 255, 0.12)',
        'rgba(168, 85, 247, 0.1)',
        'rgba(0, 212, 255, 0.08)',
        'rgba(255, 215, 0, 0.06)',
    ];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        DOM.particlesBg.appendChild(particle);
    }
}

// ─── Contact Form Validation ─────────────────────────────────

/**
 * Validates a single form field and updates its ARIA & visual state.
 *
 * @param {HTMLElement} input - The form input element
 * @param {string} errorId - The ID of the error message element
 * @param {Function} validator - Validation function returning boolean
 * @returns {boolean} Whether the field is valid
 */
function validateField(input, errorId, validator) {
    const errorEl = document.getElementById(errorId);
    const isValid = validator(input.value.trim());

    input.setAttribute('aria-invalid', String(!isValid));

    if (errorEl) {
        if (isValid) {
            errorEl.classList.remove('visible');
        } else {
            errorEl.classList.add('visible');
        }
    }

    return isValid;
}

/**
 * Validates the entire contact form.
 * Returns true if all fields pass validation.
 */
function validateContactForm() {
    let isFormValid = true;
    let firstInvalidField = null;

    // Validate name
    const nameInput = document.getElementById('contact-name');
    if (nameInput) {
        const nameValid = validateField(nameInput, 'name-error', (val) => val.length >= 1);
        if (!nameValid && !firstInvalidField) firstInvalidField = nameInput;
        isFormValid = isFormValid && nameValid;
    }

    // Validate email
    const emailInput = document.getElementById('contact-email');
    if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = validateField(emailInput, 'email-error', (val) => emailRegex.test(val));
        if (!emailValid && !firstInvalidField) firstInvalidField = emailInput;
        isFormValid = isFormValid && emailValid;
    }

    // Validate subject
    const subjectInput = document.getElementById('contact-subject');
    if (subjectInput) {
        const subjectValid = validateField(subjectInput, 'subject-error', (val) => val.length >= 1);
        if (!subjectValid && !firstInvalidField) firstInvalidField = subjectInput;
        isFormValid = isFormValid && subjectValid;
    }

    // Validate message
    const messageInput = document.getElementById('contact-message');
    if (messageInput) {
        const messageValid = validateField(messageInput, 'message-error', (val) => val.length >= 10);
        if (!messageValid && !firstInvalidField) firstInvalidField = messageInput;
        isFormValid = isFormValid && messageValid;
    }

    // Focus the first invalid field for accessibility
    if (firstInvalidField) {
        firstInvalidField.focus();
    }

    return isFormValid;
}

// Attach form validation
if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isValid = validateContactForm();

        if (isValid) {
            // Show success message
            if (DOM.formSuccess) {
                DOM.formSuccess.classList.add('visible');
            }

            // Reset form fields
            DOM.contactForm.reset();

            // Reset ARIA states
            DOM.contactForm.querySelectorAll('[aria-invalid]').forEach(input => {
                input.setAttribute('aria-invalid', 'false');
            });

            // Hide success after 5 seconds
            setTimeout(() => {
                if (DOM.formSuccess) DOM.formSuccess.classList.remove('visible');
            }, 5000);
        }
    });

    // Real-time validation on blur for each field
    const formInputs = DOM.contactForm.querySelectorAll('.form-input, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const fieldId = input.id;

            switch (fieldId) {
                case 'contact-name':
                    validateField(input, 'name-error', (val) => val.length >= 1);
                    break;
                case 'contact-email':
                    validateField(input, 'email-error', (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
                    break;
                case 'contact-subject':
                    validateField(input, 'subject-error', (val) => val.length >= 1);
                    break;
                case 'contact-message':
                    validateField(input, 'message-error', (val) => val.length >= 10);
                    break;
            }
        });

        // Clear error when user starts typing
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') {
                const errorId = input.getAttribute('aria-describedby')?.split(' ').find(id => id.endsWith('-error'));
                if (errorId) {
                    const errorEl = document.getElementById(errorId);
                    if (errorEl && input.value.trim().length > 0) {
                        // Re-validate on input
                        const fieldId = input.id;
                        switch (fieldId) {
                            case 'contact-name':
                                validateField(input, 'name-error', (val) => val.length >= 1);
                                break;
                            case 'contact-email':
                                validateField(input, 'email-error', (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
                                break;
                            case 'contact-subject':
                                validateField(input, 'subject-error', (val) => val.length >= 1);
                                break;
                            case 'contact-message':
                                validateField(input, 'message-error', (val) => val.length >= 10);
                                break;
                        }
                    }
                }
            }
        });
    });
}

// ─── Project Filtering ───────────────────────────────────────

/**
 * Filters project cards by category.
 * Accessible — uses aria-pressed on filter buttons.
 *
 * @param {string} category - The category to filter by ('all' shows everything)
 */
function filterProjects(category) {
    if (!DOM.projectCards || DOM.projectCards.length === 0) return;

    DOM.projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = '';
            card.removeAttribute('aria-hidden');
        } else {
            card.style.display = 'none';
            card.setAttribute('aria-hidden', 'true');
        }
    });
}

// Filter button click handlers
if (DOM.filterBtns && DOM.filterBtns.length > 0) {
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update aria-pressed state
            DOM.filterBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');

            // Filter projects
            const category = btn.getAttribute('data-filter');
            filterProjects(category);
        });

        // Keyboard support — Enter and Space
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ─── Scroll Animations (Intersection Observer) ──────────────

/**
 * Uses IntersectionObserver to trigger fade-in animations
 * when elements scroll into view. Also animates skill bars.
 */
function initScrollAnimations() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-in').forEach(el => {
        // Pause animation initially
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // Skill bar animation
    const skillObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const targetWidth = fill.style.width || fill.getAttribute('data-width');
                    if (targetWidth) {
                        // Reset then animate
                        fill.style.width = '0%';
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                fill.style.width = targetWidth;
                                fill.classList.add('animated');
                            });
                        });
                    }
                    skillObserver.unobserve(fill);
                }
            });
        },
        { threshold: 0.3 }
    );

    document.querySelectorAll('.skill-bar-fill').forEach(fill => {
        // Store the target width and reset
        const inlineWidth = fill.style.width;
        if (inlineWidth) {
            fill.setAttribute('data-width', inlineWidth);
            fill.style.width = '0%';
        }
        skillObserver.observe(fill);
    });
}

// ─── Initialization ──────────────────────────────────────────

function init() {
    initParticles();
    initScrollAnimations();
    initHeaderScroll();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
