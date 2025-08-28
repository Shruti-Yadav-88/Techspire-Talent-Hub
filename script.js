// TechSpire Talent Hub - Main JavaScript File
// Author: TechSpire Development Team
// Description: Core functionality for the talent showcase platform

// Import navigation manager
import './js/navigation.js';

// Global variables and utilities
const TechSpireApp = {
    currentUser: null,
    isAuthenticated: false,
    
    // Initialize the application
    init() {
        this.checkAuthentication();
        this.setupGlobalEventListeners();
        this.loadPageSpecificFunctionality();
        // Navigation is now handled by NavigationManager
    },
    
    // Check if user is authenticated
    checkAuthentication() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                this.updateNavigationForAuthenticatedUser();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('currentUser');
            }
        }
    },
    
    // Update navigation based on authentication status
    updateNavigationForAuthenticatedUser() {
        const loginLink = document.getElementById('loginLink');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (loginLink && dashboardLink) {
            loginLink.style.display = 'none';
            dashboardLink.style.display = 'block';
        }
        
        // Update any user-specific content
        const userNameElements = document.querySelectorAll('[id^="userName"]');
        userNameElements.forEach(element => {
            if (this.currentUser) {
                element.textContent = this.currentUser.firstName;
            }
        });
    },
    
    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle navigation active states
        this.updateActiveNavigation();
        
        // Setup form validations
        this.setupFormValidations();
        
        // Setup smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    },
    
    // Setup mobile navigation functionality
    setupMobileNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const loginBtn = document.querySelector('.login-btn');
        const body = document.body;

        if (!hamburger || !navMenu) return;

        // Toggle menu function
        const toggleMenu = () => {
            const isOpen = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.style.overflow = isOpen ? 'hidden' : '';
            
            // Add/remove no-scroll class to body
            if (isOpen) {
                body.classList.add('no-scroll');
            } else {
                setTimeout(() => {
                    body.classList.remove('no-scroll');
                }, 300); // Match this with your CSS transition duration
            }
        };

        // Close menu function
        const closeMenu = () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
            body.classList.remove('no-scroll');
        };

        // Toggle menu on hamburger click
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close menu when clicking login button
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                closeMenu();
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hamburger.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close menu on window resize to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && hamburger.classList.contains('active')) {
                    closeMenu();
                }
            }, 100);
        });

        // Add animation to menu items
        navLinks.forEach((link, index) => {
            link.style.transitionDelay = `${index * 0.1}s`;
        });
    }
    },
    
    // Update active navigation based on current page and scroll position
    updateActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        let currentPage = currentPath.split('/').pop() || 'index.html';
        const hash = window.location.hash.substring(1);
        
        // Special case for root path
        if (currentPage === '') {
            currentPage = 'index.html';
        }
        
        // First remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // If we have a hash in the URL, handle section highlighting
        if (hash) {
            const targetLink = document.querySelector(`.nav-link[href="#${hash}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
                return; // Exit early if we found a matching hash link
            }
        }
        
        // Handle page-based navigation
        let foundMatch = false;
        
        // Try exact match first
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
                foundMatch = true;
            }
        });
        
        // If no exact match, try partial match (for dashboard navigation)
        if (!foundMatch) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href !== '#' && currentPage.startsWith(href.replace('.html', ''))) {
                    link.classList.add('active');
                }
            });
        }
        
        // Special case for index page
        if (currentPage === 'index.html' || currentPage === '') {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === 'index.html') {
                    link.classList.add('active');
                }
            });
        }
    },
    
    // Setup smooth scrolling and section highlighting
    setupSectionHighlighting() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        // Handle click on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                e.preventDefault();
                
                // Update URL without page reload
                history.pushState(null, '', targetId);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Smooth scroll to section
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Handle scroll-based highlighting
        window.addEventListener('scroll', this.debounce(() => {
            const fromTop = window.scrollY + 100; // Add some offset
            let currentSection = '';
            
            // Find which section is in view
            document.querySelectorAll('section[id]').forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (fromTop >= sectionTop && fromTop < sectionTop + sectionHeight) {
                    currentSection = '#' + section.getAttribute('id');
                }
            });
            
            // Update active state
            if (currentSection) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === currentSection);
                });
            }
        }, 100));
    },
    
    // Setup form validations
    setupFormValidations() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Real-time email validation for cps.edu.np domain
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                input.addEventListener('blur', (e) => {
                    this.validateEmailDomain(e.target);
                });
                
                input.addEventListener('input', (e) => {
                    this.clearValidationMessage(e.target);
                });
            });
            
            // Password strength validation
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            passwordInputs.forEach(input => {
                if (input.name === 'password') {
                    input.addEventListener('input', (e) => {
                        this.validatePasswordStrength(e.target);
                    });
                }
            });
        });
    },
    
    // Validate email domain
    validateEmailDomain(emailInput) {
        const email = emailInput.value.trim();
        if (email && !email.endsWith('@cps.edu.np')) {
            this.showValidationError(emailInput, 'Please use a valid cps.edu.np email address');
            return false;
        }
        this.clearValidationMessage(emailInput);
        return true;
    },
    
    // Validate password strength
    validatePasswordStrength(passwordInput) {
        const password = passwordInput.value;
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        let strength = 0;
        let message = '';
        
        if (password.length >= minLength) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecialChar) strength++;
        
        if (password.length < minLength) {
            message = `Password must be at least ${minLength} characters long`;
            this.showValidationError(passwordInput, message);
        } else {
            switch (strength) {
                case 1:
                case 2:
                    message = 'Weak password - consider adding uppercase, numbers, or special characters';
                    break;
                case 3:
                    message = 'Medium strength password';
                    break;
                case 4:
                case 5:
                    message = 'Strong password';
                    break;
            }
            this.showValidationSuccess(passwordInput, message);
        }
        
        return strength >= 3;
    },
    
    // Show validation error
    showValidationError(input, message) {
        this.clearValidationMessage(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.fontSize = 'var(--font-size-sm)';
        errorDiv.style.marginTop = 'var(--spacing-1)';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = 'var(--error-color)';
    },
    
    // Show validation success
    showValidationSuccess(input, message) {
        this.clearValidationMessage(input);
        const successDiv = document.createElement('div');
        successDiv.className = 'validation-success';
        successDiv.style.color = 'var(--success-color)';
        successDiv.style.fontSize = 'var(--font-size-sm)';
        successDiv.style.marginTop = 'var(--spacing-1)';
        successDiv.textContent = message;
        input.parentNode.appendChild(successDiv);
        input.style.borderColor = 'var(--success-color)';
    },
    
    // Clear validation message
    clearValidationMessage(input) {
        const parent = input.parentNode;
        const existingMessage = parent.querySelector('.validation-error, .validation-success');
        if (existingMessage) {
            existingMessage.remove();
        }
        input.style.borderColor = '';
    },
    
    // Setup smooth scrolling
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href !== '#') {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    },
    
    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes modals
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="flex"]');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }
            
            // Tab navigation improvements
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    },
    
    // Handle tab navigation for better accessibility
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);
        
        // Wrap around navigation
        if (e.shiftKey) {
            if (currentIndex === 0) {
                e.preventDefault();
                focusableArray[focusableArray.length - 1].focus();
            }
        } else {
            if (currentIndex === focusableArray.length - 1) {
                e.preventDefault();
                focusableArray[0].focus();
            }
        }
    },
    
    // Load page-specific functionality
    loadPageSpecificFunctionality() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        switch (page) {
            case 'index.html':
            case '':
                this.initHomePage();
                break;
            case 'login.html':
                this.initLoginPage();
                break;
            case 'register.html':
                this.initRegisterPage();
                break;
            case 'dashboard.html':
                this.initDashboardPage();
                break;
            case 'submit.html':
                this.initSubmitPage();
                break;
            case 'profile.html':
                this.initProfilePage();
                break;
            default:
                this.initGalleryPage();
                break;
        }
    },
    
    // Initialize home page functionality
    initHomePage() {
        this.animateCounters();
        this.setupHeroInteractions();
    },
    
    // Initialize login page
    initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.setupLoginForm(loginForm);
        }
    },
    
    // Initialize register page
    initRegisterPage() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            this.setupRegisterForm(registerForm);
        }
    },
    
    // Initialize dashboard page
    initDashboardPage() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        this.loadDashboardData();
    },
    
    // Initialize submit page
    initSubmitPage() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        this.setupSubmissionForm();
    },
    
    // Initialize profile page
    initProfilePage() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        this.setupProfileManagement();
    },
    
    // Initialize gallery pages
    initGalleryPage() {
        this.setupGalleryFiltering();
        this.setupInfiniteScroll();
    },
    
    // Animate counters on home page
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const animateCounter = (counter) => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = counter.textContent.replace(/\d+/, target);
                    clearInterval(timer);
                } else {
                    counter.textContent = counter.textContent.replace(/\d+/, Math.floor(current));
                }
            }, 16);
        };
        
        // Use Intersection Observer to trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        counters.forEach(counter => observer.observe(counter));
    },
    
    // Setup hero interactions
    setupHeroInteractions() {
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        heroButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    },
    
    // Setup login form
    setupLoginForm(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const remember = formData.get('remember') === 'on';
            
            try {
                const success = await this.authenticateUser(email, password, remember);
                if (success) {
                    this.showMessage('success', 'Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    this.showMessage('error', 'Invalid email or password');
                }
            } catch (error) {
                this.showMessage('error', 'Login failed. Please try again.');
                console.error('Login error:', error);
            }
        });
    },
    
    // Setup register form
    setupRegisterForm(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const userData = this.extractFormData(formData);
            
            try {
                const success = await this.registerUser(userData);
                if (success) {
                    this.showMessage('success', 'Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    this.showMessage('error', 'Registration failed. Please try again.');
                }
            } catch (error) {
                this.showMessage('error', error.message || 'Registration failed. Please try again.');
                console.error('Registration error:', error);
            }
        });
    },
    
    // Authenticate user
    async authenticateUser(email, password, remember) {
        // Validate email domain
        if (!email.endsWith('@cps.edu.np')) {
            throw new Error('Please use a valid cps.edu.np email address');
        }
        
        // Get stored users
        const users = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (remember) {
                localStorage.setItem('rememberUser', 'true');
            }
            
            this.currentUser = user;
            this.isAuthenticated = true;
            return true;
        }
        
        return false;
    },
    
    // Register new user
    async registerUser(userData) {
        // Validate required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            throw new Error('Please fill in all required fields');
        }
        
        // Validate email domain
        if (!userData.email.endsWith('@cps.edu.np')) {
            throw new Error('Please use a valid cps.edu.np email address');
        }
        
        // Validate password strength
        if (userData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        if (users.find(u => u.email === userData.email)) {
            throw new Error('An account with this email already exists');
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            studentId: userData.studentId,
            password: userData.password,
            talents: userData.talents || [],
            joinDate: new Date().toISOString(),
            submissions: [],
            emailNotifications: true,
            profileVisibility: true,
            showContact: false
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem('techspireUsers', JSON.stringify(users));
        
        return true;
    },
    
    // Extract form data
    extractFormData(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        return data;
    },
    
    // Load dashboard data
    loadDashboardData() {
        if (!this.currentUser) return;
        
        // Load user statistics
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const userSubmissions = submissions.filter(sub => sub.userId === this.currentUser.id);
        
        this.updateDashboardStats(userSubmissions);
        this.loadRecentSubmissions(userSubmissions);
        this.loadTrendingContent();
    },
    
    // Update dashboard statistics
    updateDashboardStats(userSubmissions) {
        const totalSubmissions = userSubmissions.length;
        const totalLikes = userSubmissions.reduce((sum, sub) => sum + (sub.likes || 0), 0);
        const totalViews = userSubmissions.reduce((sum, sub) => sum + (sub.views || 0), 0);
        
        this.updateElementText('userSubmissions', totalSubmissions);
        this.updateElementText('totalLikes', totalLikes);
        this.updateElementText('totalViews', totalViews);
        
        // Calculate user rank (simplified)
        const allUsers = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        const userScores = allUsers.map(user => {
            const userSubs = JSON.parse(localStorage.getItem('submissions') || '[]')
                .filter(sub => sub.userId === user.id);
            return {
                id: user.id,
                score: userSubs.reduce((sum, sub) => sum + (sub.likes || 0) + (sub.views || 0), 0)
            };
        }).sort((a, b) => b.score - a.score);
        
        const userRank = userScores.findIndex(u => u.id === this.currentUser.id) + 1;
        this.updateElementText('userRank', userRank > 0 ? `#${userRank}` : '-');
    },
    
    // Load recent submissions
    loadRecentSubmissions(submissions) {
        const recentSubmissions = submissions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
        
        const grid = document.getElementById('userSubmissionsGrid');
        if (grid) {
            if (recentSubmissions.length === 0) {
                grid.innerHTML = '<div class="empty-state">No submissions yet. <a href="submit.html">Create your first submission!</a></div>';
            } else {
                grid.innerHTML = recentSubmissions.map(sub => this.createSubmissionCard(sub)).join('');
            }
        }
    },
    
    // Load trending content
    loadTrendingContent() {
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const trending = allSubmissions
            .sort((a, b) => (b.likes + b.views || 0) - (a.likes + a.views || 0))
            .slice(0, 6);
        
        const grid = document.getElementById('trendingGrid');
        if (grid) {
            grid.innerHTML = trending.map(sub => this.createSubmissionCard(sub, true)).join('');
        }
    },
    
    // Create submission card HTML
    createSubmissionCard(submission, showAuthor = false) {
        return `
            <div class="submission-card" onclick="TechSpireApp.viewSubmission('${submission.id}')">
                <div class="submission-image">
                    <img src="${submission.image || 'https://via.placeholder.com/300x200'}" 
                         alt="${submission.title}" loading="lazy">
                </div>
                <div class="submission-info">
                    <h3>${submission.title}</h3>
                    ${showAuthor ? `<p>By ${submission.authorName}</p>` : ''}
                    <p class="category">${this.formatCategory(submission.category)}</p>
                    <div class="submission-stats">
                        <span><i class="fas fa-heart"></i> ${submission.likes || 0}</span>
                        <span><i class="fas fa-eye"></i> ${submission.views || 0}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // View submission details
    viewSubmission(submissionId) {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const submission = submissions.find(sub => sub.id === submissionId);
        
        if (submission) {
            // Increment views
            submission.views = (submission.views || 0) + 1;
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Navigate to appropriate category page with highlight
            window.location.href = `${submission.category}.html#submission-${submissionId}`;
        }
    },
    
    // Setup submission form
    setupSubmissionForm() {
        const form = document.getElementById('submitForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = new FormData(form);
                const submissionData = this.prepareSubmissionData(formData);
                
                await this.submitTalent(submissionData);
                this.showMessage('success', 'Your talent has been submitted successfully!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } catch (error) {
                this.showMessage('error', error.message || 'Submission failed. Please try again.');
                console.error('Submission error:', error);
            }
        });
        
        // Setup category-specific field visibility
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.toggleCategoryFields(e.target.value);
            });
        }
    },
    
    // Prepare submission data
    prepareSubmissionData(formData) {
        const data = this.extractFormData(formData);
        
        // Add metadata
        data.id = Date.now().toString();
        data.userId = this.currentUser.id;
        data.authorName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        data.date = new Date().toISOString();
        data.likes = 0;
        data.views = 0;
        
        // Process tags
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        
        // Validate required fields
        if (!data.title || !data.category || !data.description) {
            throw new Error('Please fill in all required fields');
        }
        
        return data;
    },
    
    // Submit talent
    async submitTalent(data) {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        
        // Update user's submission count
        this.currentUser.submissions = this.currentUser.submissions || [];
        this.currentUser.submissions.push(data.id);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update user in users array
        const users = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('techspireUsers', JSON.stringify(users));
        }
        
        return true;
    },
    
    // Toggle category-specific fields
    toggleCategoryFields(category) {
        // Hide all category fields
        document.querySelectorAll('.category-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show subcategory section
        const subcategorySection = document.getElementById('subcategorySection');
        if (subcategorySection && category) {
            subcategorySection.style.display = 'block';
            this.populateSubcategories(category);
        }
        
        // Show category-specific fields
        const fieldMapping = {
            'arts': 'artsFields',
            'singing': 'performanceFields',
            'dance': 'performanceFields',
            'poetry': 'writingFields',
            'blogs': 'writingFields',
            'innovations': 'innovationFields',
            'crafts': 'craftsFields'
        };
        
        const fieldsId = fieldMapping[category];
        if (fieldsId) {
            const fields = document.getElementById(fieldsId);
            if (fields) {
                fields.style.display = 'block';
            }
        }
    },
    
    // Populate subcategories
    populateSubcategories(category) {
        const subcategories = {
            arts: [
                { value: 'painting', text: 'Painting' },
                { value: 'drawing', text: 'Drawing' },
                { value: 'digital', text: 'Digital Art' },
                { value: 'sculpture', text: 'Sculpture' }
            ],
            singing: [
                { value: 'original', text: 'Original Song' },
                { value: 'cover', text: 'Cover Song' },
                { value: 'classical', text: 'Classical' },
                { value: 'pop', text: 'Pop' }
            ],
            dance: [
                { value: 'contemporary', text: 'Contemporary' },
                { value: 'hiphop', text: 'Hip Hop' },
                { value: 'classical', text: 'Classical' },
                { value: 'folk', text: 'Folk' }
            ],
            poetry: [
                { value: 'sonnet', text: 'Sonnet' },
                { value: 'haiku', text: 'Haiku' },
                { value: 'free-verse', text: 'Free Verse' },
                { value: 'spoken-word', text: 'Spoken Word' }
            ],
            blogs: [
                { value: 'tech', text: 'Technology' },
                { value: 'lifestyle', text: 'Lifestyle' },
                { value: 'education', text: 'Education' },
                { value: 'personal', text: 'Personal' }
            ],
            innovations: [
                { value: 'software', text: 'Software' },
                { value: 'hardware', text: 'Hardware' },
                { value: 'ai-ml', text: 'AI & ML' },
                { value: 'web-app', text: 'Web App' },
                { value: 'mobile', text: 'Mobile App' }
            ],
            crafts: [
                { value: 'handmade', text: 'Handmade' },
                { value: 'diy', text: 'DIY Project' },
                { value: 'woodwork', text: 'Woodwork' },
                { value: 'textile', text: 'Textile Arts' }
            ]
        };
        
        const subcategorySelect = document.getElementById('subcategory');
        if (subcategorySelect && subcategories[category]) {
            subcategorySelect.innerHTML = '<option value="">Select a subcategory</option>';
            subcategories[category].forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub.value}">${sub.text}</option>`;
            });
        }
    },
    
    // Setup profile management
    setupProfileManagement() {
        this.loadUserProfile();
        this.setupProfileForm();
        this.setupSettingsToggles();
    },
    
    // Load user profile
    loadUserProfile() {
        if (!this.currentUser) return;
        
        // Update profile display
        this.updateElementText('profileName', `${this.currentUser.firstName} ${this.currentUser.lastName}`);
        this.updateElementText('profileEmail', this.currentUser.email);
        this.updateElementText('profileStudentId', this.currentUser.studentId);
        
        const joinDate = new Date(this.currentUser.joinDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.updateElementText('profileJoinDate', joinDate);
        
        // Set avatar initials
        const initials = `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`;
        this.updateElementText('avatarInitials', initials);
        
        // Load profile statistics
        this.loadProfileStatistics();
    },
    
    // Load profile statistics
    loadProfileStatistics() {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const userSubmissions = submissions.filter(sub => sub.userId === this.currentUser.id);
        
        this.updateDashboardStats(userSubmissions);
    },
    
    // Setup profile form
    setupProfileForm() {
        const editBtn = document.getElementById('editProfileBtn');
        const editForm = document.getElementById('editProfileForm');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openProfileModal());
        }
        
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateUserProfile(new FormData(editForm));
            });
        }
    },
    
    // Open profile modal
    openProfileModal() {
        // Populate form with current data
        document.getElementById('editFirstName').value = this.currentUser.firstName;
        document.getElementById('editLastName').value = this.currentUser.lastName;
        document.getElementById('editBio').value = this.currentUser.bio || '';
        
        // Set talent checkboxes
        const talentCheckboxes = document.querySelectorAll('input[name="talents"]');
        talentCheckboxes.forEach(checkbox => {
            checkbox.checked = this.currentUser.talents && this.currentUser.talents.includes(checkbox.value);
        });
        
        // Show modal
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Update user profile
    updateUserProfile(formData) {
        const updatedData = this.extractFormData(formData);
        
        // Update current user object
        this.currentUser.firstName = updatedData.firstName;
        this.currentUser.lastName = updatedData.lastName;
        this.currentUser.bio = updatedData.bio;
        this.currentUser.talents = updatedData.talents || [];
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('techspireUsers', JSON.stringify(users));
        }
        
        // Reload profile and close modal
        this.loadUserProfile();
        this.closeModal('editProfileModal');
        this.showMessage('success', 'Profile updated successfully!');
    },
    
    // Setup settings toggles
    setupSettingsToggles() {
        const toggles = ['emailNotifications', 'profileVisibility', 'showContact'];
        
        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle && this.currentUser) {
                toggle.checked = this.currentUser[toggleId] !== false;
                toggle.addEventListener('change', () => {
                    this.updateUserSetting(toggleId, toggle.checked);
                });
            }
        });
    },
    
    // Update user setting
    updateUserSetting(setting, value) {
        this.currentUser[setting] = value;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('techspireUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('techspireUsers', JSON.stringify(users));
        }
    },
    
    // Setup gallery filtering
    setupGalleryFiltering() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGalleryContent();
            });
        });
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.filterGalleryContent();
            }, 300));
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.filterGalleryContent();
            });
        }
    },
    
    // Filter gallery content
    filterGalleryContent() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';
        
        // This would be implemented per page
        console.log('Filtering:', { activeFilter, searchTerm, sortBy });
    },
    
    // Setup infinite scroll
    setupInfiniteScroll() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreContent();
            });
        }
        
        // Optional: Auto-load on scroll
        let isLoading = false;
        window.addEventListener('scroll', () => {
            if (isLoading) return;
            
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 1000) {
                isLoading = true;
                this.loadMoreContent().finally(() => {
                    isLoading = false;
                });
            }
        });
    },
    
    // Load more content
    async loadMoreContent() {
        // This would be implemented per page
        console.log('Loading more content...');
        return Promise.resolve();
    },
    
    // Utility Functions
    
    // Update element text content
    updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    },
    
    // Format category name
    formatCategory(category) {
        const categoryNames = {
            'arts': 'Arts',
            'singing': 'Singing',
            'dance': 'Dance',
            'poetry': 'Poetry',
            'blogs': 'Blogs',
            'innovations': 'Innovations',
            'crafts': 'Crafts'
        };
        return categoryNames[category] || category;
    },
    
    // Show message
    showMessage(type, message) {
        const messageElement = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
        const otherMessageElement = document.getElementById(type === 'success' ? 'errorMessage' : 'successMessage');
        
        if (otherMessageElement) {
            otherMessageElement.style.display = 'none';
        }
        
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
            
            // Scroll to message
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },
    
    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Logout user
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberUser');
            this.currentUser = null;
            this.isAuthenticated = false;
            window.location.href = 'index.html';
        }
    }
};

// Enhanced gallery functionality for talent pages
const GalleryManager = {
    // Like functionality
    likeItem(itemId, category) {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const item = submissions.find(sub => sub.id === itemId);
        
        if (item) {
            item.likes = (item.likes || 0) + 1;
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Update UI
            const likeButton = document.querySelector(`[onclick*="${itemId}"]`);
            if (likeButton) {
                const likeCount = likeButton.querySelector('.like-count') || likeButton;
                likeCount.textContent = item.likes;
            }
            
            // Show feedback
            this.showLikeFeedback(likeButton);
        }
    },
    
    // Show like feedback
    showLikeFeedback(button) {
        if (button) {
            button.style.transform = 'scale(1.2)';
            button.style.color = 'var(--error-color)';
            
            setTimeout(() => {
                button.style.transform = '';
                button.style.color = '';
            }, 200);
        }
    },
    
    // Share functionality
    shareItem(itemId, category) {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const item = submissions.find(sub => sub.id === itemId);
        
        if (item) {
            const shareData = {
                title: item.title,
                text: `Check out "${item.title}" by ${item.authorName} on TechSpire Talent Hub`,
                url: `${window.location.origin}/${category}.html#item-${itemId}`
            };
            
            if (navigator.share) {
                navigator.share(shareData);
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareData.url).then(() => {
                    TechSpireApp.showMessage('success', 'Link copied to clipboard!');
                });
            }
        }
    }
};

// Contact form functionality
const ContactManager = {
    init() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            this.setupContactForm(contactForm);
        }
        
        this.setupFAQToggles();
    },
    
    setupContactForm(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const contactData = {
                id: Date.now().toString(),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                studentId: formData.get('studentId'),
                category: formData.get('category'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                priority: formData.get('priority'),
                emailUpdates: document.getElementById('emailUpdates')?.checked || false,
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            // Validate email domain
            if (!contactData.email.endsWith('@cps.edu.np')) {
                TechSpireApp.showMessage('error', 'Please use a valid cps.edu.np email address');
                return;
            }
            
            // Store contact submission
            const contacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            contacts.push(contactData);
            localStorage.setItem('contactSubmissions', JSON.stringify(contacts));
            
            TechSpireApp.showMessage('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
            form.reset();
        });
    },
    
    setupFAQToggles() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const answer = faqItem.querySelector('.faq-answer');
                const icon = question.querySelector('i');
                
                faqItem.classList.toggle('active');
                
                if (faqItem.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    answer.style.maxHeight = '0';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TechSpireApp.init();
    ContactManager.init();
});

// Global functions for onclick handlers
function likeItem(itemId, category) {
    GalleryManager.likeItem(itemId, category);
}

function shareItem(itemId, category) {
    GalleryManager.shareItem(itemId, category);
}

function logout() {
    TechSpireApp.logout();
}

// Export for use in other scripts
window.TechSpireApp = TechSpireApp;
window.GalleryManager = GalleryManager;
window.ContactManager = ContactManager;
