// Modern Classical About Us JavaScript
AOS.init({
    duration: 1000,
    easing: 'ease-out-cubic',
    once: true,
    offset: 100
});

// Enhanced counter animation with easing
function animateCounter(element, target, duration = 2500) {
    let start = 0;
    const startTime = performance.now();
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        const current = Math.floor(start + (target - start) * easedProgress);
        element.textContent = current + (element.dataset.suffix || '');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.dataset.suffix || '');
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced intersection observer for stats
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.text-4xl, .text-5xl');
            statNumbers.forEach((stat, index) => {
                setTimeout(() => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/\D/g, ''));
                    const suffix = text.replace(/\d/g, '');
                    
                    stat.dataset.suffix = suffix;
                    animateCounter(stat, number);
                }, index * 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Parallax effect for hero section
function handleParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.absolute.top-20, .absolute.bottom-20');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Smooth reveal animations
function revealOnScroll() {
    const reveals = document.querySelectorAll('[data-aos]');
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-fadeInUp');
        }
    });
}

// Enhanced smooth scrolling
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
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
    const signupBtn = document.getElementById('signupBtn');
    const userProfile = document.getElementById('userProfile');
    const userGreeting = document.getElementById('userGreeting');
    const userIcon = document.getElementById('userIcon');
    
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
}

// Go to profile page
function goToProfile() {
    window.location.href = 'profile.html';
}

// Handle signup button click
document.addEventListener('click', function(e) {
    if (e.target.closest('#signupBtn')) {
        window.location.href = 'signup.html';
    }
});

// Initialize all functions
document.addEventListener('DOMContentLoaded', () => {
    // Check user login status
    checkUserLogin();
    
    // Observe stats section
    const statsSection = document.querySelector('.grid.md\\:grid-cols-4');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Initialize smooth scrolling
    smoothScroll();
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        handleParallax();
        revealOnScroll();
    });
    
    // Add floating animation to cards
    const cards = document.querySelectorAll('.bg-white');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('floating');
    });
});