// Navigation Manager
class NavigationManager {
    constructor() {
        this.navLinks = [];
        this.currentPage = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateActiveNavigation();
    }

    cacheElements() {
        this.navLinks = Array.from(document.querySelectorAll('.nav-link:not(.login-btn)'));
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.currentPage = this.getCurrentPage();
    }

    getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path === '' ? 'index.html' : path;
    }

    setupEventListeners() {
        // Handle navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveLink(link);
                this.closeMobileMenu();
            });
        });

        // Handle mobile menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    }

    updateActiveNavigation() {
        // Reset all active states
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Find and set active link
        const activeLink = this.navLinks.find(link => {
            const href = link.getAttribute('href');
            if (!href) return false;
            
            // Handle index page
            if (this.currentPage === 'index.html' || this.currentPage === '') {
                return href === 'index.html' || href === '/';
            }
            
            // Handle other pages
            return href === this.currentPage;
        });

        if (activeLink) {
            this.setActiveLink(activeLink);
        }
    }

    setActiveLink(link) {
        this.navLinks.forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
    }

    toggleMobileMenu() {
        if (this.navMenu && this.hamburger) {
            this.navMenu.classList.toggle('active');
            this.hamburger.classList.toggle('active');
            document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
        }
    }

    closeMobileMenu() {
        if (this.navMenu && this.hamburger && this.navMenu.classList.contains('active')) {
            this.navMenu.classList.remove('active');
            this.hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});
