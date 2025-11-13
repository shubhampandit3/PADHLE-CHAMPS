// Student Dashboard JavaScript with Real-time Bot Monitoring

// Initialize Firebase if not already done
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyCDZJeZeJPkuDUZ5Vf_-rsy0PQsx8tQw4k",
        authDomain: "quiz-app-10f81.firebaseapp.com",
        databaseURL: "https://quiz-app-10f81-default-rtdb.firebaseio.com",
        projectId: "quiz-app-10f81",
        storageBucket: "quiz-app-10f81.firebasestorage.app",
        messagingSenderId: "351578019731",
        appId: "1:351578019731:web:2055fe24498ca17908fa66",
        measurementId: "G-XVQ1GQ58E2"
    });
}
var database = firebase.database();

// Global variables
let sessionStartTime = Date.now();
let activityCount = 0;
let currentUser = null;
let websiteStatsTimer = null;
let crossPageMonitor = null;
let streakTimer = null;
let streakCounted = false;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS with enhanced settings
    AOS.init({
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,
        offset: 50,
        delay: 0,
        disable: window.innerWidth < 768 ? 'mobile' : false
    });
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Add welcome animation with delay
    setTimeout(() => {
        showMessage('Welcome to your enhanced dashboard! 🚀', 'success');
    }, 1500);
    
    // Initialize modern features
    initializeModernAnimations();
    initializeResponsiveFeatures();
    addParallaxEffects();
    setupIntersectionObserver();
    
    // Core functionality
    checkUserLogin();
    initializeDashboard();
    startRealTimeMonitoring();
    startCrossPageMonitoring();
    startWebsitePerformanceTracking();
    startStreakTracking();
    
    // Performance monitoring
    monitorPerformance();
    
    // Add responsive event listeners
    addResponsiveEventListeners();
});

// Add responsive event listeners
function addResponsiveEventListeners() {
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleResize();
            adjustLayoutForScreenSize();
            optimizeForCurrentViewport();
        }, 100);
    });
    
    // Handle visibility change for mobile
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && currentUser) {
            loadUserStats();
        }
    });
    
    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Ensure focus is visible on mobile
            document.body.classList.add('keyboard-navigation');
        }
        
        // Arrow key navigation for bot tabs
        if (e.target.classList.contains('bot-tab')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                switchToPreviousBotTab();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                switchToNextBotTab();
            }
        }
    });
    
    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Add responsive image loading
    if ('IntersectionObserver' in window) {
        setupLazyLoading();
    }
    
    // Monitor viewport changes
    if ('ResizeObserver' in window) {
        setupViewportMonitoring();
    }
}

// Initialize modern animations with enhanced performance
function initializeModernAnimations() {
    // Add stagger animation to cards with performance optimization
    const cards = document.querySelectorAll('.stat-card, .bot-section, .progress-section, .quick-access-section, .recommendations-section');
    
    cards.forEach((card, index) => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-slide-in');
        });
    });
    
    // Enhanced hover effects with GPU acceleration
    cards.forEach(card => {
        card.style.willChange = 'transform';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02) translateZ(0)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1) translateZ(0)';
        });
    });
    
    // Initialize particle background with reduced count for mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
        createParticleBackground();
    }
    
    // Add smooth number counting animation
    animateNumbers();
    
    // Initialize micro-interactions
    initializeMicroInteractions();
}

// Create optimized particle background effect
function createParticleBackground() {
    const particleCount = window.innerWidth < 1024 ? 15 : 25; // Reduce particles on smaller screens
    const container = document.querySelector('.pt-20');
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 10;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle${i} ${duration}s infinite ease-in-out;
            animation-delay: ${delay}s;
            will-change: transform, opacity;
        `;
        fragment.appendChild(particle);
    }
    
    document.body.appendChild(fragment);
    
    // Add optimized particle animations
    const style = document.createElement('style');
    let animations = '';
    
    for (let i = 0; i < particleCount; i++) {
        const x1 = Math.random() * 100 - 50;
        const y1 = Math.random() * 100 - 50;
        const x2 = Math.random() * 100 - 50;
        const y2 = Math.random() * 100 - 50;
        
        animations += `
            @keyframes floatParticle${i} {
                0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.3; }
                25% { transform: translate3d(${x1}px, ${y1}px, 0) scale(1.2); opacity: 0.6; }
                50% { transform: translate3d(${x2}px, ${y2}px, 0) scale(0.8); opacity: 0.4; }
                75% { transform: translate3d(${-x1}px, ${-y1}px, 0) scale(1.1); opacity: 0.5; }
            }
        `;
    }
    
    style.textContent = animations;
    document.head.appendChild(style);
}

// Enhanced number animation with better performance
function animateNumbers() {
    const animateValue = (element, start, end, duration) => {
        const range = end - start;
        const startTime = performance.now();
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smoother animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (range * easeOutQuart);
            
            element.textContent = Math.round(current) + (element.dataset.suffix || '');
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    };
    
    // Animate stat values with intersection observer
    const statValues = document.querySelectorAll('.stat-value');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const stat = entry.target;
                const text = stat.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                
                if (number > 0) {
                    stat.dataset.suffix = text.replace(/[0-9]/g, '');
                    stat.dataset.animated = 'true';
                    animateValue(stat, 0, number, 1500);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statValues.forEach(stat => observer.observe(stat));
}

// Enhanced parallax effects with performance optimization
function addParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-icon, .stat-card');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.2 + (index * 0.05); // Reduced speed for subtlety
            const rotation = scrolled * 0.05;
            element.style.transform = `translate3d(0, ${scrolled * speed}px, 0) rotate(${rotation}deg)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // Only add parallax on non-mobile devices
    if (window.innerWidth >= 768) {
        window.addEventListener('scroll', requestTick, { passive: true });
    }
}

// Initialize mobile menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Toggle mobile menu');
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && 
            !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    });
    
    // Close mobile menu on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            const mobileMenu = document.getElementById('mobileMenu');
            const menuIcon = document.getElementById('menuIcon');
            const closeIcon = document.getElementById('closeIcon');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

// Initialize responsive features
function initializeResponsiveFeatures() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResize();
            adjustLayoutForScreenSize();
        }, 250);
    });
    
    // Initialize touch gestures for mobile
    if ('ontouchstart' in window) {
        initializeTouchGestures();
    }
    
    // Initial layout adjustment
    adjustLayoutForScreenSize();
    
    // Add responsive grid classes
    addResponsiveGridClasses();
    
    // Initial viewport optimization
    optimizeForCurrentViewport();
}

// Handle mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (mobileMenu && menuIcon && closeIcon) {
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            // Show menu
            mobileMenu.classList.remove('hidden');
            mobileMenu.style.maxHeight = '0';
            mobileMenu.style.opacity = '0';
            
            requestAnimationFrame(() => {
                mobileMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                mobileMenu.style.maxHeight = '300px';
                mobileMenu.style.opacity = '1';
            });
            
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        } else {
            // Hide menu
            mobileMenu.style.maxHeight = '0';
            mobileMenu.style.opacity = '0';
            
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
            
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }
}

// Handle window resize
function handleResize() {
    const isMobile = window.innerWidth < 768;
    
    // Reinitialize AOS for responsive changes
    AOS.refresh();
    
    // Update particle background based on screen size
    const particles = document.querySelectorAll('[style*="floatParticle"]');
    if (isMobile && particles.length > 0) {
        particles.forEach(particle => particle.remove());
    } else if (!isMobile && particles.length === 0) {
        createParticleBackground();
    }
    
    // Adjust bot tabs layout
    adjustBotTabsLayout();
    
    // Update grid layouts
    updateGridLayouts();
}

// Adjust layout for current screen size
function adjustLayoutForScreenSize() {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;
    
    // Add responsive classes to body
    document.body.classList.remove('mobile', 'tablet', 'desktop');
    if (isMobile) {
        document.body.classList.add('mobile');
    } else if (isTablet) {
        document.body.classList.add('tablet');
    } else {
        document.body.classList.add('desktop');
    }
    
    // Adjust dashboard header
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader) {
        if (isMobile) {
            dashboardHeader.style.padding = '1rem';
            dashboardHeader.style.marginBottom = '1.5rem';
        } else if (isTablet) {
            dashboardHeader.style.padding = '2rem 1.5rem';
            dashboardHeader.style.marginBottom = '2rem';
        } else {
            dashboardHeader.style.padding = '3rem 2rem';
            dashboardHeader.style.marginBottom = '3rem';
        }
    }
    
    // Adjust section padding
    const sections = document.querySelectorAll('.bot-section, .progress-section, .quick-access-section, .recommendations-section');
    sections.forEach(section => {
        if (isMobile) {
            section.style.padding = '1rem';
        } else if (isTablet) {
            section.style.padding = '1.5rem';
        } else {
            section.style.padding = '2.5rem';
        }
    });
    
    // Optimize card layouts
    optimizeCardLayouts();
    
    // Adjust font sizes dynamically
    adjustResponsiveFontSizes();
}

// Adjust bot tabs layout for mobile
function adjustBotTabsLayout() {
    const botTabs = document.querySelector('.bot-tabs');
    const botTabElements = document.querySelectorAll('.bot-tab');
    
    if (botTabs && window.innerWidth < 640) {
        botTabs.style.flexWrap = 'wrap';
        botTabs.style.gap = '0.25rem';
        
        botTabElements.forEach(tab => {
            tab.style.flex = '1 1 calc(50% - 0.125rem)';
            tab.style.minWidth = '0';
            tab.style.padding = '0.75rem 0.5rem';
            tab.style.fontSize = '0.75rem';
            
            const span = tab.querySelector('span');
            if (span) {
                span.style.display = 'block';
                span.style.marginTop = '0.25rem';
            }
        });
    } else if (botTabs && window.innerWidth >= 640) {
        botTabs.style.flexWrap = 'nowrap';
        botTabs.style.gap = '0.5rem';
        
        botTabElements.forEach(tab => {
            tab.style.flex = '1';
            tab.style.minWidth = '120px';
            tab.style.padding = '0.875rem 1rem';
            tab.style.fontSize = '0.875rem';
            
            const span = tab.querySelector('span');
            if (span) {
                span.style.display = 'inline';
                span.style.marginTop = '0';
            }
        });
    }
}

// Update grid layouts based on screen size
function updateGridLayouts() {
    const grids = document.querySelectorAll('.responsive-grid, .grid');
    const screenWidth = window.innerWidth;
    
    grids.forEach(grid => {
        if (screenWidth < 640) {
            grid.style.gridTemplateColumns = '1fr';
            grid.style.gap = '1rem';
        } else if (screenWidth < 1024) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.gap = '1.5rem';
        } else {
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            grid.style.gap = '2rem';
        }
    });
}

// Add responsive grid classes to existing elements
function addResponsiveGridClasses() {
    const statsGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    if (statsGrid) {
        statsGrid.classList.add('responsive-grid');
    }
    
    const quickAccessGrid = document.querySelector('.quick-access-section .grid');
    if (quickAccessGrid) {
        quickAccessGrid.classList.add('responsive-grid');
    }
    
    // Add responsive classes to all grids
    const allGrids = document.querySelectorAll('.grid');
    allGrids.forEach(grid => {
        if (!grid.classList.contains('responsive-grid')) {
            grid.classList.add('responsive-grid');
        }
    });
}

// Optimize for current viewport
function optimizeForCurrentViewport() {
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight
    };
    
    // Optimize for different aspect ratios
    if (viewport.ratio < 0.75) {
        // Very tall screens (like phones in portrait)
        document.body.classList.add('aspect-tall');
        optimizeForTallScreens();
    } else if (viewport.ratio > 1.5) {
        // Very wide screens
        document.body.classList.add('aspect-wide');
        optimizeForWideScreens();
    } else {
        // Standard aspect ratios
        document.body.classList.remove('aspect-tall', 'aspect-wide');
    }
    
    // Optimize for small screens
    if (viewport.width < 480) {
        document.body.classList.add('screen-small');
        optimizeForSmallScreens();
    } else {
        document.body.classList.remove('screen-small');
    }
}

// Optimize card layouts
function optimizeCardLayouts() {
    const cards = document.querySelectorAll('.stat-card, .quick-access-card, .recommendation-card');
    const isMobile = window.innerWidth < 640;
    
    cards.forEach(card => {
        if (isMobile) {
            // Ensure proper mobile layout
            card.style.minHeight = 'auto';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            
            // Adjust icon sizes for mobile
            const icon = card.querySelector('.stat-icon, .quick-access-icon, .recommendation-icon');
            if (icon) {
                icon.style.flexShrink = '0';
            }
        } else {
            // Reset styles for larger screens
            card.style.minHeight = '';
            card.style.display = '';
            card.style.alignItems = '';
        }
    });
}

// Adjust responsive font sizes
function adjustResponsiveFontSizes() {
    const screenWidth = window.innerWidth;
    const scaleFactor = Math.min(Math.max(screenWidth / 1024, 0.8), 1.2);
    
    // Adjust title sizes
    const titles = document.querySelectorAll('.section-title, .dashboard-title');
    titles.forEach(title => {
        const baseFontSize = parseFloat(getComputedStyle(title).fontSize);
        title.style.fontSize = `${baseFontSize * scaleFactor}px`;
    });
}

// Setup lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Setup viewport monitoring
function setupViewportMonitoring() {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === document.body) {
                handleResize();
                optimizeForCurrentViewport();
            }
        }
    });
    
    resizeObserver.observe(document.body);
}

// Optimize for tall screens
function optimizeForTallScreens() {
    const sections = document.querySelectorAll('.bot-section, .progress-section, .quick-access-section');
    sections.forEach(section => {
        section.style.marginBottom = '1rem';
    });
}

// Optimize for wide screens
function optimizeForWideScreens() {
    const container = document.querySelector('.responsive-container');
    if (container) {
        container.style.maxWidth = '1600px';
    }
}

// Optimize for small screens
function optimizeForSmallScreens() {
    // Reduce padding and margins for very small screens
    const elements = document.querySelectorAll('.stat-card, .bot-section, .progress-card');
    elements.forEach(element => {
        element.style.padding = '0.75rem';
    });
    
    // Adjust font sizes for readability
    const smallText = document.querySelectorAll('.stat-label, .bot-status, .progress-desc');
    smallText.forEach(text => {
        text.style.fontSize = '0.75rem';
    });
}

// Initialize touch gestures
function initializeTouchGestures() {
    let startY = 0;
    let startX = 0;
    let startTime = 0;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        startTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const endTime = Date.now();
        const diffY = startY - endY;
        const diffX = startX - endX;
        const timeDiff = endTime - startTime;
        
        // Only process quick swipes (less than 300ms)
        if (timeDiff < 300) {
            // Detect swipe gestures
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
                if (diffY > 0) {
                    // Swipe up
                    handleSwipeUp();
                } else {
                    // Swipe down
                    handleSwipeDown();
                }
            }
            
            // Detect horizontal swipes for tab navigation
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
                if (diffX > 0) {
                    // Swipe left - next tab
                    switchToNextBotTab();
                } else {
                    // Swipe right - previous tab
                    switchToPreviousBotTab();
                }
            }
        }
    }, { passive: true });
    
    // Add pinch-to-zoom prevention for better mobile experience
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Handle swipe gestures
function handleSwipeUp() {
    // Scroll to next section or perform action
    const sections = document.querySelectorAll('.bot-section, .progress-section, .quick-access-section, .recommendations-section');
    const currentScroll = window.pageYOffset;
    
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = sections[i].offsetTop;
        if (sectionTop > currentScroll + 100) {
            sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        }
    }
}

function handleSwipeDown() {
    // Scroll to previous section or perform action
    const sections = document.querySelectorAll('.bot-section, .progress-section, .quick-access-section, .recommendations-section');
    const currentScroll = window.pageYOffset;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        const sectionTop = sections[i].offsetTop;
        if (sectionTop < currentScroll - 100) {
            sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        }
    }
}

// Switch to next bot tab
function switchToNextBotTab() {
    const tabs = document.querySelectorAll('.bot-tab');
    const activeTab = document.querySelector('.bot-tab.active');
    
    if (activeTab && tabs.length > 0) {
        const currentIndex = Array.from(tabs).indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        
        // Remove active class from current tab
        activeTab.classList.remove('active');
        
        // Add active class to next tab
        tabs[nextIndex].classList.add('active');
        
        // Trigger tab switch
        const tabId = tabs[nextIndex].id;
        if (tabId) {
            const tabName = tabId.replace('Tab', '').replace(/([A-Z])/g, (match, letter) => 
                letter.toLowerCase()
            );
            switchBotTab(tabName);
        }
    }
}

// Switch to previous bot tab
function switchToPreviousBotTab() {
    const tabs = document.querySelectorAll('.bot-tab');
    const activeTab = document.querySelector('.bot-tab.active');
    
    if (activeTab && tabs.length > 0) {
        const currentIndex = Array.from(tabs).indexOf(activeTab);
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        
        // Remove active class from current tab
        activeTab.classList.remove('active');
        
        // Add active class to previous tab
        tabs[prevIndex].classList.add('active');
        
        // Trigger tab switch
        const tabId = tabs[prevIndex].id;
        if (tabId) {
            const tabName = tabId.replace('Tab', '').replace(/([A-Z])/g, (match, letter) => 
                letter.toLowerCase()
            );
            switchBotTab(tabName);
        }
    }
}

// Setup intersection observer for animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Trigger any specific animations for the element
                triggerElementAnimation(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.stat-card, .bot-section, .progress-section, .quick-access-card, .recommendation-card');
    animatableElements.forEach(el => observer.observe(el));
}

// Trigger specific animations for elements
function triggerElementAnimation(element) {
    if (element.classList.contains('stat-card')) {
        // Animate stat values
        const statValue = element.querySelector('.stat-value');
        if (statValue && !statValue.dataset.animated) {
            animateStatValue(statValue);
            statValue.dataset.animated = 'true';
        }
    }
}

// Animate stat values with counting effect
function animateStatValue(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    const suffix = text.replace(/[0-9]/g, '');
    
    if (number > 0) {
        let current = 0;
        const increment = number / 30; // 30 frames
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            element.textContent = Math.round(current) + suffix;
        }, 50);
    }
}

// Initialize micro-interactions
function initializeMicroInteractions() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .bot-tab, .quick-access-card');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Add hover sound effects (optional)
    if (window.AudioContext || window.webkitAudioContext) {
        initializeAudioFeedback();
    }
}

// Create ripple effect
function createRippleEffect(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    // Ensure button has relative positioning
    if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
    }
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (button.contains(ripple)) {
            button.removeChild(ripple);
        }
    }, 600);
}

// Initialize audio feedback
function initializeAudioFeedback() {
    // Create subtle audio context for UI sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playTone(frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Add subtle hover sounds to interactive elements
    const interactiveElements = document.querySelectorAll('.stat-card, .bot-tab, .quick-access-card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (audioContext.state === 'running') {
                playTone(800, 0.1);
            }
        });
    });
}

// Monitor performance
function monitorPerformance() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
        // Implementation would go here for real performance monitoring
    }
    
    // Simple performance logging
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Dashboard Performance:', {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }, 0);
    });
}

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out;
    }
`;
document.head.appendChild(rippleStyle);

// Listen for XP updates from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'padhleChamps_user' && currentUser) {
        loadUserStats();
    }
});

// Refresh XP when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentUser) {
        loadUserStats();
    }
});

// Check user login
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
        document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
    }
}

// Initialize dashboard with user data
async function initializeDashboard() {
    if (!currentUser) return;
    
    // Load user stats
    await loadUserStats();
    
    // Load enrolled batches and progress
    loadLearningProgress();
    
    // Start bot analysis
    startBotAnalysis();
    
    // Track dashboard visit
    trackActivity('dashboard_opened', 'Dashboard accessed');
}

// Calculate batch progress from localStorage
function calculateBatchProgress(batchType) {
    try {
        const localProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        
        // Count completed items for this batch type
        const completed = Object.keys(localProgress).filter(key => 
            localProgress[key].completed && localProgress[key].batchType === batchType
        ).length;
        
        const total = getTotalContentCount(batchType);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percent };
    } catch (error) {
        console.error('Error calculating progress:', error);
        return { completed: 0, total: 0, percent: 0 };
    }
}

// Get total content count for batch (from home.js)
function getTotalContentCount(batchType) {
    const contentCounts = {
        'sangharsh-enrollments': 8, // 2 videos + 2 notes per subject (Math, Science)
        'manzil-enrollments': 8,
        'vigyan-enrollments': 6,
        'codecrack-enrollments': 4
    };
    return contentCounts[batchType] || 0;
}

// Start real-time monitoring
function startRealTimeMonitoring() {
    // Update session time every minute
    setInterval(updateSessionTime, 60000);
    
    // Track user interactions
    trackUserInteractions();
    
    // Generate bot insights periodically
    setInterval(() => {
        generateBotInsight();
        generateTestInsights();
    }, 25000); // Every 25 seconds
    
    // Update activity score
    setInterval(updateActivityScore, 10000); // Every 10 seconds
}

// Load user stats from Firebase
async function loadUserStats() {
    try {
        // Calculate total XP from all sources
        const [testSnapshot, dppSnapshot, progressSnapshot] = await Promise.all([
            database.ref('testResults').orderByChild('studentId').equalTo(currentUser.userId).once('value'),
            database.ref('dppResults').orderByChild('studentId').equalTo(currentUser.userId).once('value'),
            database.ref('userProgress').once('value')
        ]);
        
        // Calculate test XP (including reattempt XP)
        let testXP = 0;
        const testAttempts = {};
        
        testSnapshot.forEach(childSnapshot => {
            const result = childSnapshot.val();
            const testId = result.testId;
            
            if (!testAttempts[testId]) {
                testAttempts[testId] = [];
            }
            testAttempts[testId].push(result);
        });
        
        // Calculate XP: first attempt gets full XP, reattempts get 1 XP per correct
        Object.values(testAttempts).forEach(attempts => {
            attempts.sort((a, b) => a.submittedAt - b.submittedAt);
            
            attempts.forEach((attempt, index) => {
                if (index === 0) {
                    // First attempt gets full XP
                    testXP += attempt.earnedXP || 0;
                } else {
                    // Reattempts get 1 XP per correct answer
                    testXP += attempt.correctAnswers || 0;
                }
            });
        });
        
        // Calculate content XP from userProgress
        let contentXP = 0;
        if (progressSnapshot.exists()) {
            progressSnapshot.forEach(childSnapshot => {
                const progress = childSnapshot.val();
                if (progress && progress.completed) {
                    contentXP += 5;
                }
            });
        }
        
        // Also check localStorage for content XP
        try {
            const localProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            Object.keys(localProgress).forEach(key => {
                if (localProgress[key].completed) {
                    contentXP += 5;
                }
            });
        } catch (error) {
            console.log('No local progress found');
        }
        
        // Calculate DPP XP (all attempts)
        let dppXP = 0;
        dppSnapshot.forEach(childSnapshot => {
            const result = childSnapshot.val();
            dppXP += result.earnedXP || 0;
        });
        
        // Get video XP and creative XP from userStats
        const statsRef = database.ref(`userStats/${currentUser.userId}`);
        const statsSnapshot = await statsRef.once('value');
        const stats = statsSnapshot.val() || {};
        const videoXP = stats.videoXP || 0;
        const creativeXP = await getCreativeXP(currentUser.userId);
        
        // Show video XP notification if user just returned from video
        if (videoXP > 0 && !sessionStorage.getItem('dashboardVideoXPShown')) {
            setTimeout(() => {
                showVideoXPDashboardSummary(videoXP);
                sessionStorage.setItem('dashboardVideoXPShown', 'true');
            }, 3000);
        }
        
        // Calculate total XP from all sources
        const totalXP = testXP + dppXP + contentXP + videoXP + creativeXP;
        
        // Update Firebase userStats with calculated total XP
        await statsRef.update({
            xp: totalXP,
            lastActivity: Date.now()
        });
        
        const streakElement = document.getElementById('streakCount');
        const xpElement = document.getElementById('totalXP');
        
        if (streakElement) {
            streakElement.textContent = stats.streak || 0;
        }
        
        if (xpElement) {
            xpElement.textContent = totalXP;
        }
        
        // Update last activity display
        const lastActivityElement = document.getElementById('lastActivity');
        if (lastActivityElement) {
            lastActivityElement.textContent = `Last activity: Just now`;
        }
        
        console.log(`XP Calculation - Test: ${testXP}, DPP: ${dppXP}, Content: ${contentXP}, Video: ${videoXP}, Creative: ${creativeXP}, Total: ${totalXP}`);
        
        // Update localStorage user data
        const userDataLocal = JSON.parse(localStorage.getItem('padhleChamps_user') || '{}');
        userDataLocal.xp = totalXP;
        localStorage.setItem('padhleChamps_user', JSON.stringify(userDataLocal));
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        const streakElement = document.getElementById('streakCount');
        const xpElement = document.getElementById('totalXP');
        
        if (streakElement) streakElement.textContent = '0';
        if (xpElement) xpElement.textContent = '0';
    }
}

// Stub functions to prevent errors from old cached code
function updateMonitoringData() {
    // Prevent error - this function is not needed in the simplified version
    return;
}

function analyzePerformance() {
    // Prevent error - this function is not needed in the simplified version
    return;
}

// Apply AI recommendation function
function applyRecommendation(type) {
    switch(type) {
        case 'schedule':
            alert('📅 Study schedule optimized! Set reminders for 2-4 PM daily study sessions.');
            break;
        case 'focus':
            window.location.href = 'test-analysis.html';
            break;
        case 'tests':
            window.location.href = 'batch.html';
            break;
        case 'groups':
            alert('👥 Feature coming soon! Study groups will be available in the next update.');
            break;
        default:
            alert('✅ Recommendation applied successfully!');
    }
}

// Load learning progress
function loadLearningProgress() {
    try {
        // Use localStorage for faster progress calculation
        const localProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        
        // Calculate progress for Sangharsh batch
        const sangharshProgress = calculateBatchProgress('sangharsh-enrollments');
        
        const userEnrollments = [{
            batchName: 'Sangharsh Batch 2025',
            mentor: 'Expert Mentor',
            batchType: 'sangharsh-enrollments',
            progress: sangharshProgress.percent
        }];
        
        displayLearningProgress(userEnrollments);
        
    } catch (error) {
        console.error('Error loading learning progress:', error);
    }
}

// Display learning progress
function displayLearningProgress(enrollments) {
    const progressCards = document.getElementById('progressCards');
    const progressSummary = document.getElementById('progressSummary');
    
    if (enrollments.length === 0) {
        progressSummary.textContent = '0% Complete';
        return;
    }
    
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / enrollments.length);
    
    progressSummary.textContent = `${avgProgress}% Complete`;
    
    progressCards.innerHTML = enrollments.map(enrollment => `
        <div class="progress-card">
            <div class="progress-header">
                <h3 class="progress-title">${enrollment.batchName}</h3>
                <span class="progress-percent">${enrollment.progress || 0}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${enrollment.progress || 0}%"></div>
            </div>
            <p class="progress-desc">Mentor: ${enrollment.mentor}</p>
        </div>
    `).join('');
}

// Track user activity
function trackActivity(type, description) {
    activityCount++;
    
    const activityItem = {
        type: type,
        description: description,
        timestamp: Date.now()
    };
    
    // Save to Firebase
    if (currentUser) {
        const activityRef = database.ref(`studentActivity/${currentUser.userId}/${Date.now()}`);
        activityRef.set(activityItem);
    }
    
    // Update UI
    addActivityToUI(activityItem);
    const activityCountElement = document.getElementById('activityCount');
    if (activityCountElement) {
        activityCountElement.textContent = `${activityCount} activities`;
    }
}

// Add activity to UI
function addActivityToUI(activity) {
    const activityContainer = document.getElementById('realtimeActivity');
    if (!activityContainer) return;
    
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    activityElement.innerHTML = `
        <div class="activity-dot"></div>
        <div class="activity-text">
            <p>${activity.description}</p>
            <span class="activity-time">${formatTimeAgo(new Date(activity.timestamp))}</span>
        </div>
    `;
    
    activityContainer.insertBefore(activityElement, activityContainer.firstChild);
    
    // Keep only last 5 activities visible
    const activities = activityContainer.children;
    if (activities.length > 5) {
        activityContainer.removeChild(activities[activities.length - 1]);
    }
}

// Track user interactions
function trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            trackActivity('button_click', `Clicked: ${e.target.textContent || 'Button'}`);
        }
    });
    
    // Track scrolling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            trackActivity('scroll', 'Page scrolled');
        }, 1000);
    });
    
    // Track time spent on sections
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.className || 'section';
                trackActivity('section_view', `Viewing: ${sectionName}`);
            }
        });
    });
    
    document.querySelectorAll('.stats-grid, .insight-panel, .progress-section').forEach(el => {
        observer.observe(el);
    });
}

// Generate bot insights based on activity
function generateBotInsight() {
    const insights = [
        {
            icon: 'fas fa-brain',
            color: 'text-purple-500',
            text: `You've been active for ${Math.floor((Date.now() - sessionStartTime) / 60000)} minutes. Great focus!`,
            analysis: 'engagement_high'
        },
        {
            icon: 'fas fa-chart-line',
            color: 'text-blue-500',
            text: `I notice you're checking your progress frequently. This shows good self-awareness!`,
            analysis: 'progress_conscious'
        },
        {
            icon: 'fas fa-target',
            color: 'text-green-500',
            text: `Your activity pattern suggests you're goal-oriented. Keep up the excellent work!`,
            analysis: 'goal_focused'
        },
        {
            icon: 'fas fa-lightbulb',
            color: 'text-amber-500',
            text: `Based on your behavior, I recommend taking a 5-minute break to maintain peak performance.`,
            analysis: 'break_suggestion'
        },
        {
            icon: 'fas fa-robot',
            color: 'text-indigo-500',
            text: `🤖 Bot Notice: I'm tracking your test performance based on first attempts only. This gives you the most accurate progress assessment.`,
            analysis: 'test_tracking'
        },
        {
            icon: 'fas fa-robot',
            color: 'text-orange-500',
            text: `🔄 Bot Insight: Test reattempts show dedication! Each reattempt earns 1 XP per correct answer as bonus.`,
            analysis: 'reattempt_motivation'
        },
        {
            icon: 'fas fa-robot',
            color: 'text-green-500',
            text: `🎯 Bot Tip: I recommend taking tests when you feel 80% prepared for maximum first-attempt success.`,
            analysis: 'test_strategy'
        }
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    addBotInsight(randomInsight);
    
    // Save insight to Firebase
    if (currentUser) {
        const insightRef = database.ref(`botInsights/${currentUser.userId}/${Date.now()}`);
        insightRef.set({
            ...randomInsight,
            timestamp: Date.now()
        });
    }
}

// Start cross-page monitoring
function startCrossPageMonitoring() {
    crossPageMonitor = setInterval(async () => {
        try {
            // Monitor community activity
            const postsRef = database.ref('communityPosts');
            const postsSnapshot = await postsRef.limitToLast(10).once('value');
            
            let newPosts = 0;
            let moderatedPosts = 0;
            
            if (postsSnapshot.exists()) {
                postsSnapshot.forEach(child => {
                    const post = child.val();
                    const postTime = post.timestamp;
                    const hourAgo = Date.now() - (60 * 60 * 1000);
                    
                    if (postTime > hourAgo) {
                        if (post.status === 'approved') newPosts++;
                        if (post.status === 'banned') moderatedPosts++;
                    }
                });
            }
            
            // Monitor user registrations
            const usersRef = database.ref('users');
            const usersSnapshot = await usersRef.limitToLast(5).once('value');
            let newUsers = 0;
            
            if (usersSnapshot.exists()) {
                usersSnapshot.forEach(child => {
                    const user = child.val();
                    if (user.createdAt && user.createdAt > Date.now() - (60 * 60 * 1000)) {
                        newUsers++;
                    }
                });
            }
            
            // Generate website activity insights
            const websiteInsights = [
                {
                    icon: 'fas fa-users',
                    color: 'text-green-500',
                    text: `${newUsers} new users joined in the last hour. Community is growing!`,
                    analysis: 'user_growth'
                },
                {
                    icon: 'fas fa-comments',
                    color: 'text-blue-500',
                    text: `${newPosts} new posts created, ${moderatedPosts} posts moderated by bot`,
                    analysis: 'community_activity'
                },
                {
                    icon: 'fas fa-shield-alt',
                    color: 'text-red-500',
                    text: `Bot is actively monitoring all pages for safety and guidelines`,
                    analysis: 'security_monitoring'
                }
            ];
            
            const randomWebsiteInsight = websiteInsights[Math.floor(Math.random() * websiteInsights.length)];
            addBotInsight(randomWebsiteInsight);
            
        } catch (error) {
            console.error('Error in cross-page monitoring:', error);
        }
    }, 45000); // Every 45 seconds
}

// Start website performance tracking
function startWebsitePerformanceTracking() {
    websiteStatsTimer = setInterval(async () => {
        try {
            // Track batch enrollments
            const enrollmentsRef = database.ref('enrollments');
            const enrollmentsSnapshot = await enrollmentsRef.once('value');
            
            let totalEnrollments = 0;
            let todayEnrollments = 0;
            const today = new Date().toDateString();
            
            if (enrollmentsSnapshot.exists()) {
                enrollmentsSnapshot.forEach(batchType => {
                    batchType.forEach(enrollment => {
                        const enrollmentData = enrollment.val();
                        totalEnrollments++;
                        
                        if (enrollmentData.enrolledAt) {
                            const enrollDate = new Date(enrollmentData.enrolledAt).toDateString();
                            if (enrollDate === today) {
                                todayEnrollments++;
                            }
                        }
                    });
                });
            }
            
            // Track active bans
            const bansRef = database.ref('userBans');
            const bansSnapshot = await bansRef.once('value');
            let activeBans = 0;
            
            if (bansSnapshot.exists()) {
                bansSnapshot.forEach(child => {
                    const ban = child.val();
                    if (ban.banUntil > Date.now()) {
                        activeBans++;
                    }
                });
            }
            
            // Generate performance insights
            const performanceInsights = [
                {
                    icon: 'fas fa-graduation-cap',
                    color: 'text-purple-500',
                    text: `${totalEnrollments} total enrollments, ${todayEnrollments} new today`,
                    analysis: 'enrollment_stats'
                },
                {
                    icon: 'fas fa-ban',
                    color: 'text-orange-500',
                    text: `${activeBans} users currently restricted. Bot maintaining community safety`,
                    analysis: 'moderation_stats'
                },
                {
                    icon: 'fas fa-chart-bar',
                    color: 'text-indigo-500',
                    text: `Website performance: All systems running smoothly across all pages`,
                    analysis: 'system_performance'
                }
            ];
            
            const randomPerformanceInsight = performanceInsights[Math.floor(Math.random() * performanceInsights.length)];
            addBotInsight(randomPerformanceInsight);
            
        } catch (error) {
            console.error('Error tracking website performance:', error);
        }
    }, 60000); // Every minute
}

// Add bot insight to UI
function addBotInsight(insight) {
    const insightsContainer = document.getElementById('botInsights');
    if (!insightsContainer) return;
    
    const insightElement = document.createElement('div');
    insightElement.className = 'insight-item';
    insightElement.innerHTML = `
        <div class="insight-icon">
            <i class="${insight.icon} ${insight.color}"></i>
        </div>
        <div class="insight-text">
            <p>${insight.text}</p>
            <span class="insight-time">Just now</span>
        </div>
    `;
    
    insightsContainer.insertBefore(insightElement, insightsContainer.firstChild);
    
    // Keep only last 3 insights visible
    const insights = insightsContainer.children;
    if (insights.length > 3) {
        insightsContainer.removeChild(insights[insights.length - 1]);
    }
}

// Start bot analysis
function startBotAnalysis() {
    trackActivity('bot_analysis_started', 'Bot started analyzing learning patterns');
    
    setTimeout(() => {
        addBotInsight({
            icon: 'fas fa-robot',
            color: 'text-blue-500',
            text: `🤖 Hello ${currentUser.name.split(' ')[0]}! I'm your AI assistant. I'm monitoring your study patterns and will provide smart insights.`,
            analysis: 'welcome_message'
        });
    }, 2000);
    
    // Add initial website overview
    setTimeout(() => {
        addBotInsight({
            icon: 'fas fa-robot',
            color: 'text-green-500',
            text: `🔍 Bot Status: Actively scanning your activity across all pages. I'll provide personalized recommendations based on your patterns.`,
            analysis: 'website_overview'
        });
    }, 8000);
}

// Update session time with animation
function updateSessionTime() {
    const sessionTimeElement = document.getElementById('sessionTime');
    if (sessionTimeElement) {
        const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        sessionTimeElement.textContent = `${minutes}m`;
        
        // Add pulse animation on update
        sessionTimeElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            sessionTimeElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update current session in monitoring
    const currentSessionElement = document.getElementById('currentSession');
    if (currentSessionElement) {
        const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        currentSessionElement.textContent = `${minutes} minutes`;
    }
}

// Update activity score based on engagement
function updateActivityScore() {
    const activityScoreElement = document.getElementById('activityScore');
    if (activityScoreElement) {
        // Calculate activity score based on time spent and interactions
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 60000);
        const baseScore = Math.min(timeSpent * 2, 80); // 2% per minute, max 80%
        const interactionBonus = Math.min(activityCount * 5, 20); // 5% per interaction, max 20%
        const totalScore = Math.min(baseScore + interactionBonus, 100);
        
        activityScoreElement.textContent = `${totalScore}%`;
        
        // Update progress bar if exists
        const progressBar = document.querySelector('.activity-progress');
        if (progressBar) {
            progressBar.style.width = `${totalScore}%`;
        }
    }
}

// Start streak tracking
function startStreakTracking() {
    // Check if user visited today
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisitDate');
    
    if (lastVisit !== today) {
        localStorage.setItem('lastVisitDate', today);
        
        // Update streak in Firebase if user is logged in
        if (currentUser) {
            updateUserStreak();
        }
    }
}

// Update user streak in Firebase
async function updateUserStreak() {
    try {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        const statsRef = database.ref(`userStats/${currentUser.userId}`);
        const statsSnapshot = await statsRef.once('value');
        const stats = statsSnapshot.val() || {};
        
        let newStreak = 1;
        
        if (stats.lastStreakDate === yesterday) {
            // Continue streak
            newStreak = (stats.streak || 0) + 1;
        } else if (stats.lastStreakDate === today) {
            // Already counted today
            newStreak = stats.streak || 1;
        }
        
        // Update streak data
        await statsRef.update({
            streak: newStreak,
            lastStreakDate: today,
            lastActivity: Date.now()
        });
        
        // Update UI
        const streakElement = document.getElementById('streakCount');
        if (streakElement) {
            streakElement.textContent = newStreak;
        }
        
        console.log(`Streak updated: ${newStreak} days`);
        
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// Get creative XP from community posts
async function getCreativeXP(userId) {
    try {
        const postsRef = database.ref('communityPosts');
        const postsSnapshot = await postsRef.orderByChild('authorId').equalTo(userId).once('value');
        
        let creativeXP = 0;
        
        if (postsSnapshot.exists()) {
            postsSnapshot.forEach(childSnapshot => {
                const post = childSnapshot.val();
                if (post.status === 'approved') {
                    creativeXP += 10; // 10 XP per approved post
                }
            });
        }
        
        return creativeXP;
    } catch (error) {
        console.error('Error getting creative XP:', error);
        return 0;
    }
}

// Generate test insights
function generateTestInsights() {
    if (!currentUser) return;
    
    // Get test data from localStorage or generate insights
    const testInsights = [
        {
            icon: 'fas fa-chart-line',
            color: 'text-blue-500',
            text: `📊 Test Insight: Your performance shows consistent improvement across all subjects.`,
            analysis: 'test_performance'
        },
        {
            icon: 'fas fa-target',
            color: 'text-green-500',
            text: `🎯 Strategy Tip: Focus on time management - you're getting answers right but could be faster.`,
            analysis: 'time_management'
        },
        {
            icon: 'fas fa-brain',
            color: 'text-purple-500',
            text: `🧠 Learning Pattern: You perform best in the afternoon sessions. Schedule important tests accordingly.`,
            analysis: 'optimal_timing'
        }
    ];
    
    const randomInsight = testInsights[Math.floor(Math.random() * testInsights.length)];
    addBotInsight(randomInsight);
}

// Format time ago helper function
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Show message helper function
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set message type styling
    switch (type) {
        case 'success':
            messageEl.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            messageEl.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            messageEl.classList.add('bg-yellow-500', 'text-black');
            break;
        default:
            messageEl.classList.add('bg-blue-500', 'text-white');
    }
    
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Apply recommendation function
function applyRecommendation(type) {
    switch (type) {
        case 'schedule':
            showMessage('Study schedule optimization applied! 📅', 'success');
            break;
        default:
            showMessage('Recommendation applied successfully! ✅', 'success');
    }
}

// Switch bot tab function
function switchBotTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.bot-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.bot-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}Content`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Track tab switch
    trackActivity('tab_switch', `Switched to ${tabName} tab`);
}
function updateSessionTime() {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    const sessionElement = document.getElementById('sessionTime');
    
    if (sessionElement) {
        // Animate number change with glow effect
        sessionElement.style.transform = 'scale(1.15)';
        sessionElement.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
        sessionElement.textContent = `${sessionMinutes}m`;
        
        setTimeout(() => {
            sessionElement.style.transform = 'scale(1)';
            sessionElement.style.textShadow = 'none';
        }, 300);
    }
}

// Enhanced modern message function with better accessibility
function showMessage(message, type = 'info') {
    // Remove existing notifications to prevent spam
    const existingNotifications = document.querySelectorAll('.toast-notification');
    existingNotifications.forEach(notification => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    });
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const colors = {
        success: 'background: linear-gradient(135deg, #10B981, #059669); border-color: #10B981;',
        error: 'background: linear-gradient(135deg, #EF4444, #DC2626); border-color: #EF4444;',
        info: 'background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-color: #3B82F6;',
        warning: 'background: linear-gradient(135deg, #F59E0B, #D97706); border-color: #F59E0B;'
    };
    
    const icons = {
        success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
        info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        right: 1rem;
        max-width: 400px;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid;
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
        ${colors[type] || colors.info}
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icons[type] || icons.info}"/>
            </svg>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; opacity: 0.7; hover:opacity: 1;">
                <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto-remove after delay
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }
    }, type === 'error' ? 5000 : 3000); // Keep error messages longer
}

// Update activity score
function updateActivityScore() {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    const score = Math.min(100, Math.floor((activityCount / Math.max(1, sessionMinutes)) * 20));
    document.getElementById('activityScore').textContent = `${score}%`;
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Update AI recommendations based on activity
function updateRecommendations() {
    const container = document.getElementById('aiRecommendations');
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    
    let recommendations = [];
    
    if (activityCount > 15) {
        recommendations.push({
            icon: 'fas fa-trophy',
            color: 'text-amber-500',
            title: 'Excellent Engagement',
            description: 'Your high activity level shows great dedication. Consider taking a practice test to consolidate your learning.',
            action: 'Take Practice Test',
            actionFn: 'startPracticeTest()'
        });
    }
    
    if (sessionMinutes > 30 && sessionMinutes < 60) {
        recommendations.push({
            icon: 'fas fa-clock',
            color: 'text-blue-500',
            title: 'Optimal Study Duration',
            description: 'You\'re in the sweet spot for learning. This is the perfect time to tackle challenging topics.',
            action: 'View Challenges',
            actionFn: 'viewChallenges()'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            icon: 'fas fa-lightbulb',
            color: 'text-purple-500',
            title: 'Personalized Learning Path',
            description: 'Based on your learning patterns, I recommend focusing on consistent daily practice for optimal results.',
            action: 'View Learning Path',
            actionFn: 'viewLearningPath()'
        });
    }
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <div class="recommendation-icon">
                <i class="${rec.icon} ${rec.color}"></i>
            </div>
            <div class="recommendation-content">
                <h3 class="recommendation-title">${rec.title}</h3>
                <p class="recommendation-desc">${rec.description}</p>
                <button class="recommendation-btn" onclick="${rec.actionFn}">
                    ${rec.action}
                </button>
            </div>
        </div>
    `).join('');
}

// Recommendation actions
function startPracticeTest() {
    showMessage('Practice test feature coming soon! Keep up the great work.', 'info');
}

function viewChallenges() {
    showMessage('Challenge mode will be available soon. Continue your excellent progress!', 'info');
}

function viewLearningPath() {
    showMessage('Personalized learning path is being prepared based on your activity patterns.', 'info');
}

// Switch bot tabs
function switchBotTab(tab) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.bot-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bot-tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.getElementById(`${tab}Tab`).classList.add('active');
    document.getElementById(`${tab}Content`).classList.add('active');
    
    // Load content based on tab
    switch(tab) {
        case 'monitoring':
            updateMonitoringData();
            break;
        case 'improvements':
            generateImprovementSuggestions();
            break;
        case 'updates':
            loadSystemUpdates();
            break;
        case 'performance':
            analyzePerformance();
            break;
        case 'testAnalysis':
            loadTestAnalysisData();
            break;
        case 'dppAnalysis':
            loadDppAnalysisData();
            break;
    }
}

// Update monitoring data
function updateMonitoringData() {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    const currentSessionEl = document.getElementById('currentSession');
    if (currentSessionEl) {
        currentSessionEl.textContent = `${sessionMinutes} minutes`;
    }
    
    // Load and display total session time
    loadTotalSessionTime();
    
    // Update focus level based on activity
    const focusLevel = Math.min(100, Math.max(20, (activityCount / Math.max(1, sessionMinutes)) * 30));
    const patternFillEl = document.querySelector('.pattern-fill');
    const patternValueEl = document.querySelector('.pattern-value');
    
    if (patternFillEl) {
        patternFillEl.style.width = `${focusLevel}%`;
    }
    if (patternValueEl) {
        patternValueEl.textContent = `${Math.round(focusLevel)}%`;
    }
}

// Load total session time
async function loadTotalSessionTime() {
    if (!currentUser) return;
    
    try {
        const totalSessionRef = database.ref(`userStats/${currentUser.userId}/totalSessionTime`);
        const snapshot = await totalSessionRef.once('value');
        const totalTime = snapshot.val() || 0;
        
        const totalHours = Math.floor(totalTime / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
        
        // Update pages visited to show total time
        document.getElementById('pagesVisited').textContent = `Total: ${totalHours}h ${totalMinutes}m`;
        
    } catch (error) {
        console.error('Error loading total session time:', error);
    }
}

// Generate intelligent improvement suggestions
function generateImprovementSuggestions() {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    const suggestions = [];
    
    // Analyze session length
    if (sessionMinutes > 45) {
        suggestions.push({
            icon: 'fas fa-pause-circle',
            color: 'text-blue-500',
            title: 'Take a Break',
            description: 'You\'ve been studying for over 45 minutes. Research shows that taking 10-15 minute breaks improves retention and prevents mental fatigue.',
            priority: 'high'
        });
    }
    
    // Analyze activity patterns
    if (activityCount < sessionMinutes * 0.5) {
        suggestions.push({
            icon: 'fas fa-bolt',
            color: 'text-orange-500',
            title: 'Increase Engagement',
            description: 'Your interaction level seems low. Try taking notes, asking questions, or discussing topics to boost active learning.',
            priority: 'medium'
        });
    }
    
    // Check streak and consistency
    const streakElement = document.getElementById('streakCount');
    const currentStreak = parseInt(streakElement?.textContent || '0');
    
    if (currentStreak < 3) {
        suggestions.push({
            icon: 'fas fa-calendar-check',
            color: 'text-green-500',
            title: 'Build Consistency',
            description: 'Consistency is key to learning success. Try to visit the platform daily, even if just for 10 minutes, to build a strong learning habit.',
            priority: 'high'
        });
    }
    
    // Default suggestions if none generated
    if (suggestions.length === 0) {
        suggestions.push({
            icon: 'fas fa-star',
            color: 'text-purple-500',
            title: 'Excellent Progress',
            description: 'You\'re doing great! Your learning patterns show good engagement and consistency. Keep up the excellent work!',
            priority: 'low'
        });
    }
    
    // Display suggestions
    const container = document.getElementById('improvementsList');
    if (!container) return;
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="improvement-item">
            <div class="improvement-icon">
                <i class="${suggestion.icon} ${suggestion.color}"></i>
            </div>
            <div class="improvement-content">
                <h4>${suggestion.title}</h4>
                <p>${suggestion.description}</p>
                <div class="improvement-priority ${suggestion.priority}">${suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority</div>
            </div>
        </div>
    `).join('');
}

// Load system updates
function loadSystemUpdates() {
    const updates = [
        {
            icon: 'fas fa-shield-alt',
            color: 'text-green-500',
            title: 'Enhanced Security',
            description: 'Advanced bot moderation system deployed across all pages. Community interactions are now safer with intelligent content filtering.',
            time: '2 hours ago'
        },
        {
            icon: 'fas fa-brain',
            color: 'text-purple-500',
            title: 'AI Learning Assistant Upgraded',
            description: 'Your AI assistant now provides more personalized insights based on advanced learning pattern analysis.',
            time: '1 day ago'
        },
        {
            icon: 'fas fa-chart-line',
            color: 'text-blue-500',
            title: 'Performance Analytics',
            description: 'New detailed performance tracking helps you understand your learning progress better with actionable insights.',
            time: '2 days ago'
        },
        {
            icon: 'fas fa-users',
            color: 'text-orange-500',
            title: 'Community Features',
            description: 'Reply system and improved post interactions make learning more collaborative and engaging.',
            time: '3 days ago'
        }
    ];
    
    const container = document.getElementById('updatesList');
    container.innerHTML = updates.map(update => `
        <div class="update-item">
            <div class="update-icon">
                <i class="${update.icon} ${update.color}"></i>
            </div>
            <div class="update-content">
                <h4>${update.title}</h4>
                <p>${update.description}</p>
                <span class="update-time">${update.time}</span>
            </div>
        </div>
    `).join('');
}

// Analyze performance with AI insights
function analyzePerformance() {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    const streakElement = document.getElementById('streakCount');
    const currentStreak = parseInt(streakElement?.textContent || '0');
    const xpElement = document.getElementById('totalXP');
    const currentXP = parseInt(xpElement?.textContent || '0');
    
    // Calculate performance metrics
    const consistency = Math.min(100, currentStreak * 10 + 10);
    const engagement = Math.min(100, Math.max(20, (activityCount / Math.max(1, sessionMinutes)) * 25));
    const progressRate = Math.min(100, Math.max(10, currentXP / 10));
    const overallScore = Math.round((consistency + engagement + progressRate) / 3);
    
    // Update performance display
    document.getElementById('overallScore').textContent = overallScore;
    
    const metrics = document.querySelectorAll('.metric-item');
    metrics[0].querySelector('.metric-fill').style.width = `${consistency}%`;
    metrics[0].querySelector('.metric-value').textContent = `${consistency}%`;
    
    metrics[1].querySelector('.metric-fill').style.width = `${engagement}%`;
    metrics[1].querySelector('.metric-value').textContent = `${Math.round(engagement)}%`;
    
    metrics[2].querySelector('.metric-fill').style.width = `${progressRate}%`;
    metrics[2].querySelector('.metric-value').textContent = `${Math.round(progressRate)}%`;
    
    // Generate performance insights
    setTimeout(() => {
        generatePerformanceInsight(overallScore, consistency, engagement, progressRate);
    }, 1000);
}

// Generate performance insight
function generatePerformanceInsight(overall, consistency, engagement, progress) {
    let insight = '';
    
    if (overall >= 80) {
        insight = 'Outstanding performance! You\'re demonstrating excellent learning habits with high consistency and engagement. Keep up this exceptional work!';
    } else if (overall >= 60) {
        insight = 'Good progress! You\'re on the right track. Focus on areas where you can improve to reach your full potential.';
    } else {
        insight = 'There\'s room for improvement. Don\'t worry - every expert was once a beginner. Let\'s work together to enhance your learning journey.';
    }
    
    // Add specific recommendations
    if (consistency < 50) {
        insight += ' Try to maintain daily learning habits for better consistency.';
    }
    if (engagement < 50) {
        insight += ' Increase your interaction with the content through active participation.';
    }
    if (progress < 50) {
        insight += ' Focus on completing more learning activities to boost your progress rate.';
    }
    
    addBotInsight({
        icon: 'fas fa-chart-bar',
        color: 'text-indigo-500',
        text: insight,
        analysis: 'performance_review'
    });
}

// Apply AI recommendation
function applyRecommendation(type) {
    switch(type) {
        case 'schedule':
            showMessage('Study schedule optimization applied! You\'ll receive reminders during your peak learning hours.', 'success');
            break;
        default:
            showMessage('Recommendation applied successfully!', 'success');
    }
}

// Load test analysis data
async function loadTestAnalysisData() {
    try {
        if (!currentUser) return;
        
        const testResultsSnapshot = await database.ref('testResults')
            .orderByChild('studentId')
            .equalTo(currentUser.userId)
            .once('value');
        
        const allResults = [];
        testResultsSnapshot.forEach(childSnapshot => {
            allResults.push(childSnapshot.val());
        });
        
        const testAttempts = {};
        allResults.forEach(result => {
            if (!testAttempts[result.testId]) {
                testAttempts[result.testId] = [];
            }
            testAttempts[result.testId].push(result);
        });
        
        const firstAttempts = Object.values(testAttempts).map(attempts => {
            return attempts.sort((a, b) => a.submittedAt - b.submittedAt)[0];
        });
        
        displayTestAnalysis(firstAttempts);
        
    } catch (error) {
        console.error('Error loading test analysis:', error);
    }
}

function displayTestAnalysis(firstAttempts) {
    const testsAttempted = firstAttempts.length;
    const avgScore = testsAttempted > 0 ? 
        Math.round(firstAttempts.reduce((sum, result) => 
            sum + ((result.totalMarks / result.maxMarks) * 100), 0) / testsAttempted) : 0;
    
    const testsElement = document.getElementById('testsAttempted');
    const avgElement = document.getElementById('avgTestScore');
    const recentTestsContainer = document.getElementById('recentTestResults');
    
    if (testsElement) testsElement.textContent = testsAttempted;
    if (avgElement) avgElement.textContent = avgScore + '%';
    
    if (!recentTestsContainer) return;
    
    if (testsAttempted === 0) {
        recentTestsContainer.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fas fa-clipboard-list text-3xl mb-2"></i>
                <p>No test attempts yet</p>
            </div>
        `;
        return;
    }
    
    const recentTests = firstAttempts
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 3);
    
    recentTestsContainer.innerHTML = recentTests.map(result => {
        const percentage = Math.round((result.totalMarks / result.maxMarks) * 100);
        const statusColor = percentage >= 80 ? 'text-green-600' : 
                           percentage >= 60 ? 'text-blue-600' : 
                           percentage >= 40 ? 'text-yellow-600' : 'text-red-600';
        
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800 text-sm">${result.testTitle}</h4>
                    <p class="text-xs text-gray-600">${new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold ${statusColor}">${percentage}%</div>
                    <div class="text-xs text-gray-500">${result.totalMarks}/${result.maxMarks}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Get creative XP from user's posts
async function getCreativeXP(userId) {
    try {
        const postsSnapshot = await database.ref('creativePosts')
            .orderByChild('authorId')
            .equalTo(userId)
            .once('value');
        
        let creativeXP = 0;
        postsSnapshot.forEach(childSnapshot => {
            creativeXP += 3; // 3 XP per creative post
        });
        
        return creativeXP;
    } catch (error) {
        console.error('Error calculating creative XP:', error);
        return 0;
    }
}

// Initialize bot section
setTimeout(() => {
    updateMonitoringData();
    generateImprovementSuggestions();
    loadTestAnalysisData();
    loadDppAnalysisData();
}, 2000);

// Update bot data periodically
setInterval(() => {
    const activeTab = document.querySelector('.bot-tab.active');
    if (activeTab) {
        if (activeTab.id === 'monitoringTab') {
            updateMonitoringData();
        } else if (activeTab.id === 'testAnalysisTab') {
            loadTestAnalysisData();
        } else if (activeTab.id === 'dppAnalysisTab') {
            loadDppAnalysisData();
        }
    }
}, 30000);

// Initialize real-time updates
setInterval(updateRecommendations, 60000); // Update every minute

// Start streak tracking
function startStreakTracking() {
    streakTimer = setTimeout(async () => {
        if (!streakCounted && currentUser) {
            await updateDayStreak();
            streakCounted = true;
        }
    }, 20000); // 20 seconds
}

// Update day streak
async function updateDayStreak() {
    try {
        const today = new Date().toDateString();
        const statsRef = database.ref(`userStats/${currentUser.userId}`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        
        // Check if streak already counted today
        if (stats.lastStreakDate === today) {
            return;
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = 1;
        
        // Continue streak if last activity was yesterday
        if (stats.lastStreakDate === yesterday) {
            newStreak = (stats.streak || 0) + 1;
        }
        
        // Update streak
        await statsRef.update({
            streak: newStreak,
            lastStreakDate: today,
            lastActivity: Date.now()
        });
        
        // Update UI
        document.getElementById('streakCount').textContent = newStreak;
        
        // Track activity
        trackActivity('streak_updated', `Day streak updated to ${newStreak}`);
        
        // Add bot insight
        addBotInsight({
            icon: 'fas fa-fire',
            color: 'text-orange-500',
            text: `🔥 Streak updated! You're on a ${newStreak}-day learning streak. Consistency is the key to success!`,
            analysis: 'streak_milestone'
        });
        
    } catch (error) {
        console.error('Error updating day streak:', error);
    }
}

// Load DPP analysis data
async function loadDppAnalysisData() {
    try {
        if (!currentUser) return;
        
        const dppResultsSnapshot = await database.ref('dppResults')
            .orderByChild('studentId')
            .equalTo(currentUser.userId)
            .once('value');
        
        const allResults = [];
        dppResultsSnapshot.forEach(childSnapshot => {
            allResults.push(childSnapshot.val());
        });
        
        const dppAttempts = {};
        allResults.forEach(result => {
            if (!dppAttempts[result.dppId]) {
                dppAttempts[result.dppId] = [];
            }
            dppAttempts[result.dppId].push(result);
        });
        
        const firstAttempts = Object.values(dppAttempts).map(attempts => {
            return attempts.sort((a, b) => a.submittedAt - b.submittedAt)[0];
        });
        
        const totalDppXP = allResults.reduce((sum, result) => sum + (result.earnedXP || 0), 0);
        
        displayDppAnalysis(firstAttempts, totalDppXP);
        
    } catch (error) {
        console.error('Error loading DPP analysis:', error);
    }
}

function displayDppAnalysis(firstAttempts, totalXP) {
    const dppsAttempted = firstAttempts.length;
    
    const dppsElement = document.getElementById('dppsAttempted');
    const xpElement = document.getElementById('totalDppXP');
    const recentDppsContainer = document.getElementById('recentDppResults');
    
    if (dppsElement) dppsElement.textContent = dppsAttempted;
    if (xpElement) xpElement.textContent = totalXP;
    
    if (!recentDppsContainer) return;
    
    if (dppsAttempted === 0) {
        recentDppsContainer.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fas fa-tasks text-3xl mb-2"></i>
                <p>No DPP attempts yet</p>
            </div>
        `;
        return;
    }
    
    const recentDpps = firstAttempts
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 3);
    
    recentDppsContainer.innerHTML = recentDpps.map(result => {
        const percentage = Math.round((result.totalMarks / result.maxMarks) * 100);
        const statusColor = percentage >= 80 ? 'text-green-600' : 
                           percentage >= 60 ? 'text-blue-600' : 
                           percentage >= 40 ? 'text-yellow-600' : 'text-red-600';
        
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800 text-sm">${result.dppTitle}</h4>
                    <p class="text-xs text-gray-600">${new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold ${statusColor}">${percentage}%</div>
                    <div class="text-xs text-gray-500">${result.totalMarks}/${result.maxMarks}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate test insights
function generateTestInsights() {
    const testInsights = [
        {
            icon: 'fas fa-robot',
            color: 'text-blue-500',
            text: '🤖 Test Tip: I track your first attempts for accurate progress. Reattempts help you learn and earn bonus XP!',
            analysis: 'test_tracking_info'
        },
        {
            icon: 'fas fa-robot',
            color: 'text-green-500',
            text: '📊 DPP Insight: Unlimited time DPPs let you learn at your pace. First attempt: +3 XP per correct, reattempts: +1 XP per correct.',
            analysis: 'dpp_system_info'
        },
        {
            icon: 'fas fa-robot',
            color: 'text-purple-500',
            text: '🎯 Smart Tip: I recommend 80% preparation before taking tests for optimal first-attempt performance.',
            analysis: 'preparation_advice'
        }
    ];
    
    const randomInsight = testInsights[Math.floor(Math.random() * testInsights.length)];
    addBotInsight(randomInsight);
}

// Cleanup timers on page unload
window.addEventListener('beforeunload', () => {
    if (websiteStatsTimer) clearInterval(websiteStatsTimer);
    if (crossPageMonitor) clearInterval(crossPageMonitor);
    if (streakTimer) clearTimeout(streakTimer);
});

// Add page visibility tracking
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        trackActivity('page_hidden', 'Dashboard tab became inactive');
    } else {
        trackActivity('page_visible', 'Dashboard tab became active');
    }
});

// Show video XP summary notification for dashboard
function showVideoXPDashboardSummary(videoXP) {
    // Remove existing notification if any
    const existingNotification = document.getElementById('dashboardVideoXPSummary');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'dashboardVideoXPSummary';
    notification.className = 'dashboard-video-xp-summary';
    notification.innerHTML = `
        <div class="dashboard-video-xp-content">
            <div class="dashboard-video-xp-icon">
                <i class="fas fa-video"></i>
            </div>
            <div class="dashboard-video-xp-text">
                <h3>Video Learning Progress</h3>
                <p>Total video XP earned: <strong>${videoXP} XP</strong></p>
                <div class="dashboard-video-xp-details">
                    <span><i class="fas fa-clock"></i> ${Math.floor(videoXP / 5)} minutes of video content</span>
                    <span><i class="fas fa-trophy"></i> Keep watching to earn more XP!</span>
                </div>
            </div>
            <button class="dashboard-video-xp-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-video-xp-summary {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 400px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-video-xp-summary.show {
            transform: translateX(0);
        }
        
        .dashboard-video-xp-content {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            gap: 15px;
        }
        
        .dashboard-video-xp-icon {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            animation: pulse 2s infinite;
            flex-shrink: 0;
        }
        
        .dashboard-video-xp-text {
            flex: 1;
        }
        
        .dashboard-video-xp-text h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 700;
        }
        
        .dashboard-video-xp-text p {
            margin: 0 0 12px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .dashboard-video-xp-details {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .dashboard-video-xp-details span {
            font-size: 12px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .dashboard-video-xp-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            flex-shrink: 0;
        }
        
        .dashboard-video-xp-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    
    if (!document.getElementById('dashboardVideoXPSummaryStyles')) {
        style.id = 'dashboardVideoXPSummaryStyles';
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 400);
        }
    }, 8000);
}

// Apply AI recommendation function
function applyRecommendation(type) {
    switch(type) {
        case 'schedule':
            showMessage('📅 Study schedule optimized! Set reminders for 2-4 PM daily study sessions.', 'success');
            break;
        case 'focus':
            window.location.href = 'test-analysis.html';
            break;
        case 'tests':
            window.location.href = 'batch.html';
            break;
        case 'groups':
            showMessage('👥 Feature coming soon! Study groups will be available in the next update.', 'info');
            break;
        default:
            showMessage('✅ Recommendation applied successfully!', 'success');
    }
}