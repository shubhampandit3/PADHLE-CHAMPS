// Padhle Champs Landing Page JavaScript

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,
        offset: 50,
        delay: 100
    });
    
    // Add stagger effect to cards
    document.querySelectorAll('.feature-card, .batch-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

mobileMenuBtn.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
    
    // Toggle menu icon
    const icon = mobileMenuBtn.querySelector('.material-icons');
    if (mobileMenu.classList.contains('hidden')) {
        icon.textContent = 'menu';
    } else {
        icon.textContent = 'close';
    }
});

// Close mobile menu when clicking on links
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('.material-icons').textContent = 'menu';
    });
});

// Navbar scroll effect with smooth transition
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        navbar.style.transform = currentScroll > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('button, .batch-card').forEach(el => {
    el.addEventListener('click', createRipple);
});

// Button click handlers
document.addEventListener('click', function(e) {
    
    // Signup button handler
    if (e.target.classList.contains('signup-btn') || e.target.closest('.signup-btn')) {
        handleSignup();
    }
    
    // CTA buttons handler
    if (e.target.classList.contains('cta-primary') || e.target.closest('.cta-primary')) {
        handleGetStarted();
    }
    
    if (e.target.classList.contains('cta-secondary') || e.target.closest('.cta-secondary')) {
        handleWatchDemo();
    }
    
    // Batch card click handler
    if (e.target.classList.contains('batch-card') || e.target.closest('.batch-card')) {
        handleBatchClick();
    }
    
    // Navigation link handlers
    if (e.target.getAttribute('href') === 'home.html' || e.target.closest('[href="home.html"]')) {
        e.preventDefault();
        goToHome();
    }
    
    if (e.target.getAttribute('href') === 'batch.html' || e.target.closest('[href="batch.html"]')) {
        e.preventDefault();
        handleGetStarted();
    }
});

// Signup handler
function handleSignup() {
    window.location.href = 'signup.html';
}

// Get Started handler
function handleGetStarted() {
    console.log('Get Started clicked');
    // Redirect to batches page
    window.location.href = 'batch.html';
}

// Batch card click handler
function handleBatchClick() {
    console.log('Batch card clicked');
    // Redirect to batches page
    window.location.href = 'batch.html';
}

// Watch Demo handler
function handleWatchDemo() {
    openDemoModal();
}

// Demo Modal Functions
function openDemoModal() {
    const modal = document.getElementById('demoModal');
    const video = document.getElementById('demoVideo');
    
    video.src = `https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1`;
    modal.classList.remove('hidden');
    
    loadReactions();
}

function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    const video = document.getElementById('demoVideo');
    
    video.src = '';
    modal.classList.add('hidden');
}

// Reactions System
function loadReactions() {
    const data = JSON.parse(localStorage.getItem(REACTIONS_DOC)) || { love: 0, fire: 0, smile: 0 };
    
    document.querySelectorAll('.reaction-count').forEach((count, index) => {
        const reactions = ['love', 'fire', 'smile'];
        count.textContent = data[reactions[index]] || 0;
    });
}

function addReaction(type) {
    const data = JSON.parse(localStorage.getItem(REACTIONS_DOC)) || { love: 0, fire: 0, smile: 0 };
    data[type] = (data[type] || 0) + 1;
    localStorage.setItem(REACTIONS_DOC, JSON.stringify(data));
    
    loadReactions();
    
    // Add visual feedback
    const btn = document.querySelector(`[data-reaction="${type}"]`);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 300);
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Demo Video Configuration
const DEMO_VIDEO_ID = 'qBr2bC3AzFk'; // Put your YouTube video ID here
const REACTIONS_DOC = 'react-demo-vid';

// User authentication functions (placeholders)
function signUpUser(email, password) {
    // TODO: Implement Firebase user registration
    console.log('User signup function - Firebase integration pending');
}

function signInUser(email, password) {
    // TODO: Implement Firebase user login
    console.log('User signin function - Firebase integration pending');
}

function signOutUser() {
    // TODO: Implement Firebase user logout
    console.log('User signout function - Firebase integration pending');
}

// Database functions (placeholders)
function saveUserData(userId, userData) {
    // TODO: Implement Firestore data saving
    console.log('Save user data function - Firebase integration pending');
}

function getUserData(userId) {
    // TODO: Implement Firestore data retrieval
    console.log('Get user data function - Firebase integration pending');
}

// Form validation helper
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Loading state management
function showLoading(element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
}

function hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}

// Error handling
function showError(message) {
    console.error('Error:', message);
    // TODO: Implement proper error display
    alert('Error: ' + message);
}

// Success message
function showSuccess(message) {
    console.log('Success:', message);
    // TODO: Implement proper success display
    alert('Success: ' + message);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Padhle Champs app initialized');
    checkUserLogin();
    initializeDemoModal();
});

// Initialize Demo Modal Event Listeners
function initializeDemoModal() {
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('demoModal');
    
    closeBtn.addEventListener('click', closeDemoModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDemoModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDemoModal();
    });
    
    // Reaction buttons
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reaction = btn.dataset.reaction;
            addReaction(reaction);
        });
    });
}

// Check if user is logged in
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            showUserProfile(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('padhleChamps_user');
        }
    }
}

// Show user profile in navbar
function showUserProfile(user) {
    // Desktop version
    const signupBtn = document.getElementById('signupBtn');
    const userProfile = document.getElementById('userProfile');
    const userGreeting = document.getElementById('userGreeting');
    const userIcon = document.getElementById('userIcon');
    
    // Mobile version
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');
    const mobileUserProfile = document.getElementById('mobileUserProfile');
    const mobileUserGreeting = document.getElementById('mobileUserGreeting');
    const mobileUserIcon = document.getElementById('mobileUserIcon');
    
    if (signupBtn && userProfile && userGreeting) {
        signupBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');
        userGreeting.textContent = `Hi ${user.name.split(' ')[0]}`;
        
        // Set appropriate icon based on role
        if (user.role === 'Student') {
            userIcon.className = 'fas fa-user-graduate text-white text-sm';
        } else {
            userIcon.className = 'fas fa-chalkboard-teacher text-white text-sm';
        }
    }
    
    if (mobileSignupBtn && mobileUserProfile && mobileUserGreeting) {
        mobileSignupBtn.classList.add('hidden');
        mobileUserProfile.classList.remove('hidden');
        mobileUserGreeting.textContent = `Hi ${user.name.split(' ')[0]}`;
        
        // Set appropriate icon based on role
        if (user.role === 'Student') {
            mobileUserIcon.className = 'fas fa-user-graduate text-white text-sm';
        } else {
            mobileUserIcon.className = 'fas fa-chalkboard-teacher text-white text-sm';
        }
    }
}

// Go to profile page
function goToProfile() {
    window.location.href = 'profile.html';
}

// Update navigation to home page
function goToHome() {
    window.location.href = 'home.html';
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.feature-card, .batch-card').forEach(el => {
    observer.observe(el);
});

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleSignup,
        handleGetStarted,
        handleWatchDemo,
        validateEmail,
        showLoading,
        hideLoading,
        showError,
        showSuccess
    };
}