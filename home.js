// Home Page JavaScript for Padhle Champs

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDZJeZeJPkuDUZ5Vf_-rsy0PQsx8tQw4k",
    authDomain: "quiz-app-10f81.firebaseapp.com",
    databaseURL: "https://quiz-app-10f81-default-rtdb.firebaseio.com",
    projectId: "quiz-app-10f81",
    storageBucket: "quiz-app-10f81.firebasestorage.app",
    messagingSenderId: "351578019731",
    appId: "1:351578019731:web:2055fe24498ca17908fa66",
    measurementId: "G-XVQ1GQ58E2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let streakTimer = null;
let streakCounted = false;
let sessionStartTime = Date.now();

// Initialize AOS and modern animations
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,
        offset: 50
    });
    
    // Initialize modern interactions
    initializeModernAnimations();
    addParallaxEffects();
    initializeCardAnimations();
    initializeHeroCarousel();
    
    checkUserLogin();
    loadUserData();
    loadEnrolledBatches();
    startStreakTracking();
    startSessionTracking();
    refreshXPDisplay();
    loadNotifications();
    checkFeedbackForm();
    
    // Render math content after page load
    setTimeout(() => {
        renderMathContent();
    }, 1000);
    
    // Check if bot chat should be opened
    const openBotChat = localStorage.getItem('openBotChat');
    if (openBotChat) {
        setTimeout(() => {
            openBatchChat(openBotChat);
            localStorage.removeItem('openBotChat');
        }, 1000);
    }
});

// Initialize modern animations
function initializeModernAnimations() {
    // Add stagger animation to cards
    const cards = document.querySelectorAll('.quick-access-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-slide-in');
    });
    
    // Add hover sound effects (optional)
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.03)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add parallax effects
function addParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-icon');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

// Initialize card animations
function initializeCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.quick-access-card').forEach(card => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
}

// Initialize Hero Carousel
let currentSlide = 0;
let carouselInterval;

function initializeHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    if (slides.length === 0) return;
    
    // Add click handlers to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetCarouselTimer();
        });
    });
    
    // Start automatic carousel
    startCarousel();
    
    // Pause on hover
    const carousel = document.querySelector('.hero-carousel-container');
    if (carousel) {
        carousel.addEventListener('mouseenter', pauseCarousel);
        carousel.addEventListener('mouseleave', startCarousel);
    }
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
    }
    if (dots[slideIndex]) {
        dots[slideIndex].classList.add('active');
    }
    
    currentSlide = slideIndex;
}

function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

function startCarousel() {
    carouselInterval = setInterval(nextSlide, 4000);
}

function pauseCarousel() {
    clearInterval(carouselInterval);
}

function resetCarouselTimer() {
    pauseCarousel();
    startCarousel();
}



// Refresh XP when page becomes visible (user returns from video)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(() => {
            refreshXPDisplay();
            const userData = localStorage.getItem('padhleChamps_user');
            if (userData) {
                const user = JSON.parse(userData);
                loadUserStats(user.userId);
            }
        }, 1000);
    }
});

// Listen for storage changes (XP updates from other tabs)
window.addEventListener('storage', function(e) {
    if (e.key === 'padhleChamps_user') {
        setTimeout(() => {
            refreshXPDisplay();
            const userData = localStorage.getItem('padhleChamps_user');
            if (userData) {
                const user = JSON.parse(userData);
                loadUserStats(user.userId);
            }
        }, 500);
    }
});

async function refreshXPDisplay() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Get latest XP from Firebase
            if (user.userId && database) {
                const snapshot = await database.ref(`userStats/${user.userId}/xp`).once('value');
                const latestXP = snapshot.val() || 0;
                
                // Update localStorage if Firebase has newer data
                if (latestXP > (user.xp || 0)) {
                    user.xp = latestXP;
                    localStorage.setItem('padhleChamps_user', JSON.stringify(user));
                }
            }
            
            const xpElement = document.getElementById('userXP');
            const statsXPElement = document.getElementById('statsXP');
            if (xpElement && user.xp !== undefined) {
                const currentXP = parseInt(xpElement.textContent) || 0;
                const newXP = user.xp;
                
                if (newXP > currentXP) {
                    animateXPChange(xpElement, currentXP, newXP);
                    if (statsXPElement) animateXPChange(statsXPElement, currentXP, newXP);
                } else {
                    xpElement.textContent = user.xp;
                    if (statsXPElement) statsXPElement.textContent = user.xp;
                }
            }
        } catch (error) {
            console.error('Error refreshing XP display:', error);
        }
    }
}

// Animate XP change
function animateXPChange(element, from, to) {
    const duration = 1000;
    const increment = (to - from) / (duration / 16);
    let current = from;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= to) {
            current = to;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Render MathJax content
function renderMathContent() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch((err) => {
            console.warn('MathJax rendering failed:', err);
        });
    }
}

// Check if user is logged in
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if student is blocked
    const user = JSON.parse(userData);
    if (user.role === 'Student' || user.role === 'student') {
        checkStudentBlockStatus(user.userId);
    }
}

// Check if student is blocked
async function checkStudentBlockStatus(userId) {
    try {
        const blockRef = database.ref(`blockedStudents/${userId}`);
        const snapshot = await blockRef.once('value');
        const blockData = snapshot.val();
        
        if (blockData) {
            const now = Date.now();
            
            // Check if block is still active
            if (blockData.type === 'permanent' || (blockData.expiresAt && blockData.expiresAt > now)) {
                showBlockedStatus(blockData);
                return true; // Student is blocked
            } else if (blockData.expiresAt && blockData.expiresAt <= now) {
                // Remove expired block
                await blockRef.remove();
            }
        }
        return false; // Student is not blocked
    } catch (error) {
        console.error('Error checking block status:', error);
        return false;
    }
}

// Show blocked status in navbar
function showBlockedStatus(blockData) {
    // Add blocked status to navbar
    const navbar = document.querySelector('.navbar .max-w-7xl');
    if (navbar) {
        const blockedBadge = document.createElement('div');
        blockedBadge.className = 'blocked-status-badge';
        blockedBadge.innerHTML = `
            <div style="background: linear-gradient(135deg, #FEE2E2, #FECACA); color: #991B1B; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: 600; font-size: 0.875rem; border: 1px solid #FCA5A5; animation: pulse 2s infinite;">
                <i class="fas fa-ban mr-2"></i>
                Account ${blockData.type === 'permanent' ? 'Permanently' : 'Temporarily'} Blocked
            </div>
        `;
        navbar.appendChild(blockedBadge);
    }
    
    // Disable all interactive elements
    disableAllInteractions();
    
    // Show restriction popup after a short delay
    setTimeout(() => {
        showRestrictionPopup(blockData);
    }, 1000);
}

// Load user data and display
function loadUserData() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Update welcome message
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Hi ${user.name.split(' ')[0]}!`;
            }
            
            // Hide student-only elements for teachers
            if (user.role === 'Teacher' || user.role === 'teacher') {
                document.body.classList.add('teacher-role');
                
                // Hide student-only elements
                const studentElements = document.querySelectorAll('.student-only');
                studentElements.forEach(element => {
                    element.style.display = 'none';
                });
                
                // Show teacher-only elements
                const teacherElements = document.querySelectorAll('.teacher-only');
                teacherElements.forEach(element => {
                    element.style.display = 'flex';
                });
                
                // Hide XP and Streak from navbar
                const xpContainer = document.querySelector('.xp-container');
                const streakContainer = document.querySelector('.streak-container');
                if (xpContainer) xpContainer.style.display = 'none';
                if (streakContainer) streakContainer.style.display = 'none';
                
                // Hide welcome stats section
                const welcomeStats = document.querySelector('.welcome-stats');
                if (welcomeStats) welcomeStats.style.display = 'none';
                
                // Update welcome message for teachers
                if (welcomeMessage) {
                    welcomeMessage.textContent = `Welcome, ${user.name.split(' ')[0]}!`;
                }
                
                // Update quote for teachers
                const quoteElement = document.getElementById('dailyQuote');
                if (quoteElement) {
                    const teacherQuotes = [
                        "Empowering minds, shaping futures! 🎓",
                        "Great teachers inspire great students! ⭐",
                        "Your guidance makes all the difference! 💡",
                        "Teaching is the art of awakening curiosity! 🌟",
                        "Every student's success is your success! 🏆"
                    ];
                    const today = new Date().getDate();
                    quoteElement.textContent = teacherQuotes[today % teacherQuotes.length];
                }
                
                return; // Exit early for teachers
            }
            
            // Load XP and streak only for students
            if (user.role === 'Student' || user.role === 'student') {
                loadUserStats(user.userId);
            }
            
            // Set daily quote
            setDailyQuote();
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Load user stats (XP and streak) - EXACT COPY FROM DASHBOARD.JS
async function loadUserStats(userId) {
    try {
        // Calculate total XP from all sources
        const [testSnapshot, dppSnapshot, progressSnapshot] = await Promise.all([
            database.ref('testResults').orderByChild('studentId').equalTo(userId).once('value'),
            database.ref('dppResults').orderByChild('studentId').equalTo(userId).once('value'),
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
        const statsRef = database.ref(`userStats/${userId}`);
        const statsSnapshot = await statsRef.once('value');
        const stats = statsSnapshot.val() || {};
        const videoXP = stats.videoXP || 0;
        const creativeXP = await getCreativeXP(userId);
        
        // Show video XP notification if user just returned from video
        if (videoXP > 0 && !sessionStorage.getItem('homeVideoXPShown')) {
            setTimeout(() => {
                showVideoXPSummary(videoXP);
                sessionStorage.setItem('homeVideoXPShown', 'true');
            }, 3000);
        }
        
        // Calculate total XP from all sources
        const totalXP = testXP + dppXP + contentXP + videoXP + creativeXP;
        
        // Update Firebase userStats with calculated total XP
        await statsRef.update({
            xp: totalXP,
            lastActivity: Date.now()
        });
        
        const streakElement = document.getElementById('userStreak');
        const xpElement = document.getElementById('userXP');
        const statsXPElement = document.getElementById('statsXP');
        const statsStreakElement = document.getElementById('statsStreak');
        
        if (streakElement) {
            streakElement.textContent = stats.streak || 0;
        }
        
        if (xpElement) {
            xpElement.textContent = totalXP;
        }
        
        if (statsXPElement) {
            statsXPElement.textContent = totalXP;
        }
        
        if (statsStreakElement) {
            statsStreakElement.textContent = stats.streak || 0;
        }
        
        console.log(`XP Calculation - Test: ${testXP}, DPP: ${dppXP}, Content: ${contentXP}, Video: ${videoXP}, Creative: ${creativeXP}, Total: ${totalXP}`);
        
        // Update localStorage user data
        const userDataLocal = JSON.parse(localStorage.getItem('padhleChamps_user') || '{}');
        userDataLocal.xp = totalXP;
        localStorage.setItem('padhleChamps_user', JSON.stringify(userDataLocal));
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        const streakElement = document.getElementById('userStreak');
        const xpElement = document.getElementById('userXP');
        
        if (streakElement) streakElement.textContent = '0';
        if (xpElement) xpElement.textContent = '0';
    }
}

// Show video XP summary notification
function showVideoXPSummary(videoXP) {
    console.log(`Showing video XP summary: ${videoXP} XP`);
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.video-xp-summary');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'video-xp-summary';
    notification.innerHTML = `
        <div class="video-xp-content">
            <div class="video-xp-icon">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="video-xp-text">
                <h3>Video XP Earned!</h3>
                <p>You earned <strong>${videoXP} XP</strong> from watching videos</p>
                <div class="video-xp-progress">
                    <div class="video-xp-bar" style="width: 100%"></div>
                </div>
            </div>
            <button class="video-xp-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('videoXPStyles')) {
        const style = document.createElement('style');
        style.id = 'videoXPStyles';
        style.textContent = `
            .video-xp-summary {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                background: linear-gradient(135deg, #8B5CF6, #7C3AED);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
                transform: translateX(100%);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 350px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .video-xp-summary.show {
                transform: translateX(0);
            }
            
            .video-xp-content {
                display: flex;
                align-items: center;
                padding: 20px;
                gap: 15px;
            }
            
            .video-xp-icon {
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                animation: videoPulse 2s infinite;
            }
            
            .video-xp-text {
                flex: 1;
            }
            
            .video-xp-text h3 {
                margin: 0 0 5px 0;
                font-size: 18px;
                font-weight: 700;
            }
            
            .video-xp-text p {
                margin: 0 0 10px 0;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .video-xp-progress {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .video-xp-bar {
                height: 100%;
                background: linear-gradient(90deg, #FFF, #E0E7FF);
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .video-xp-close {
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
            }
            
            .video-xp-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @keyframes videoPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @media (max-width: 768px) {
                .video-xp-summary {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    transform: translateY(-100%);
                }
                
                .video-xp-summary.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show with animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto remove after 6 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }
    }, 6000);
}

// Get creative XP from user's posts - EXACT COPY FROM DASHBOARD.JS
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

// Open XP Leaderboard
function openXPLeaderboard() {
    window.location.href = 'xp-ladder.html';
}

// Set daily motivational quote with typewriter effect
function setDailyQuote() {
    const quotes = [
        "Ready to learn something new today? 🚀",
        "Every expert was once a beginner! 🌱",
        "Knowledge is power, keep learning! 💪",
        "Today's learning is tomorrow's success! ⭐",
        "Stay curious, stay growing! 🌿",
        "Education is the key to unlock your potential! 🔑",
        "Learn something new every day! 💡"
    ];
    
    const today = new Date().getDate();
    const quote = quotes[today % quotes.length];
    const quoteElement = document.getElementById('dailyQuote');
    if (!quoteElement) return;
    
    // Typewriter effect
    quoteElement.textContent = '';
    quoteElement.style.borderRight = '3px solid var(--primary-color)';
    
    let i = 0;
    const typeWriter = () => {
        if (i < quote.length) {
            quoteElement.textContent += quote.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            // Remove cursor after typing
            setTimeout(() => {
                quoteElement.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    setTimeout(typeWriter, 1500);
}

// Load enrolled batches
async function loadEnrolledBatches() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        
        // Load all batches for teachers
        if (user.role === 'Teacher' || user.role === 'teacher') {
            return;
        }
        
        const enrollmentsRef = database.ref('enrollments');
        const snapshot = await enrollmentsRef.once('value');
        const allEnrollments = snapshot.val();
        
        const userEnrollments = [];
        
        if (allEnrollments) {
            // Find user's enrollments across all batches
            Object.keys(allEnrollments).forEach(batchType => {
                const batchEnrollments = allEnrollments[batchType];
                Object.keys(batchEnrollments).forEach(enrollmentId => {
                    const enrollment = batchEnrollments[enrollmentId];
                    if (enrollment.userId === user.userId) {
                        userEnrollments.push({
                            ...enrollment,
                            batchType: batchType,
                            enrollmentId: enrollmentId
                        });
                    }
                });
            });
        }
        
        updateBatchCount(userEnrollments.length);
        
        // Update stats batches count
        const statsBatchesElement = document.getElementById('statsBatches');
        if (statsBatchesElement) {
            statsBatchesElement.textContent = userEnrollments.length;
        }
        
    } catch (error) {
        console.error('Error loading enrolled batches:', error);
    }
}





// Update batch count
function updateBatchCount(count) {
    const batchCountElement = document.getElementById('batchCount');
    if (batchCountElement) {
        batchCountElement.textContent = `${count} Batch${count !== 1 ? 'es' : ''}`;
    }
}



// Go to batches page
function goToBatches() {
    window.location.href = 'batch.html';
}

// Open batch
function openBatch(batchType) {
    const batchPages = {
        'sangharsh-enrollments': 'sangharsh.html',
        'manzil-enrollments': 'manzil.html',
        'vigyan-enrollments': 'vigyan.html',
        'codecrack-enrollments': 'codecrack.html'
    };
    
    const page = batchPages[batchType];
    if (page) {
        window.location.href = page;
    }
}

// Open batch-specific chat
function openBatchChat(batchType) {
    alert('Chat feature coming soon for ' + batchType);
}

// Initialize batch bot with monitoring
function initializeBatchBot(batchType) {
    const userData = JSON.parse(localStorage.getItem('padhleChamps_user'));
    const botMessages = document.getElementById('botMessages');
    const batchInfo = {
        'sangharsh-enrollments': 'Sangharsh Batch',
        'manzil-enrollments': 'Manzil Batch',
        'vigyan-enrollments': 'Vigyan Batch',
        'codecrack-enrollments': 'CodeCrack Batch'
    };
    
    const batchName = batchInfo[batchType] || 'Your Batch';
    
    // Start monitoring session
    startMonitoringSession(userData.userId, batchType);
    
    botMessages.innerHTML = `
        <div class="bot-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello ${userData.name.split(' ')[0]}! I'm your ${batchName} learning assistant. 👁️ I'll be monitoring your progress and providing guidance throughout your learning journey. How can I help you today?</p>
            </div>
        </div>
        <div class="bot-message">
            <div class="message-avatar" style="background: #10B981;">
                <i class="fas fa-eye"></i>
            </div>
            <div class="message-content" style="background: #D1FAE5; border-left: 4px solid #10B981;">
                <p><strong>Monitoring Active:</strong> I'm keeping track of your study patterns, engagement levels, and progress to provide personalized guidance.</p>
            </div>
        </div>
    `;
    
    // Provide initial guidelines
    setTimeout(() => {
        provideInitialGuidelines(batchType);
    }, 3000);
}

// Start monitoring session
async function startMonitoringSession(userId, batchType) {
    try {
        const sessionRef = database.ref(`monitoringSessions/${userId}/${Date.now()}`);
        await sessionRef.set({
            batchType: batchType,
            startTime: Date.now(),
            status: 'active'
        });
    } catch (error) {
        console.error('Error starting monitoring session:', error);
    }
}

// Provide initial guidelines based on batch
function provideInitialGuidelines(batchType) {
    const batchGuidelines = {
        'sangharsh-enrollments': [
            "Class 5 Focus: Build strong fundamentals in Math and Science",
            "Daily Practice: Solve at least 5 problems in each subject",
            "Reading Habit: Read for 30 minutes daily to improve comprehension"
        ],
        'manzil-enrollments': [
            "Advanced Class 5: Focus on conceptual understanding",
            "Problem Solving: Practice logical reasoning daily",
            "Time Management: Allocate specific time slots for each subject"
        ],
        'vigyan-enrollments': [
            "Class 10 Science: Focus on practical applications",
            "Board Exam Prep: Practice previous year questions",
            "Lab Work: Understand experiments and their principles"
        ],
        'codecrack-enrollments': [
            "Programming: Practice coding for at least 1 hour daily",
            "Logic Building: Solve algorithmic problems step by step",
            "Project Work: Build small projects to apply concepts"
        ]
    };
    
    const guidelines = batchGuidelines[batchType] || [
        "Stay consistent with your studies",
        "Ask questions when in doubt",
        "Practice regularly for better results"
    ];
    
    const botMessages = document.getElementById('botMessages');
    const guidelineMessage = document.createElement('div');
    guidelineMessage.className = 'bot-message';
    guidelineMessage.innerHTML = `
        <div class="message-avatar" style="background: #F59E0B;">
            <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="message-content" style="background: #FEF3C7; border-left: 4px solid #F59E0B;">
            <p><strong>Your Learning Guidelines:</strong></p>
            <ul style="margin-top: 8px; padding-left: 16px;">
                ${guidelines.map(guideline => `<li style="margin-bottom: 4px;">${guideline}</li>`).join('')}
            </ul>
        </div>
    `;
    
    botMessages.appendChild(guidelineMessage);
    botMessages.scrollTop = botMessages.scrollHeight;
}

// Close bot chat
function closeBotChat() {
    const botChat = document.getElementById('botChat');
    botChat.classList.add('hidden');
}

// Send bot message
function sendBotMessage() {
    const input = document.getElementById('botInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    
    // Clear input
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        addBotResponse(message);
    }, 1000);
}

// Add user message to chat
function addUserMessage(message) {
    const botMessages = document.getElementById('botMessages');
    const userMessage = document.createElement('div');
    userMessage.className = 'bot-message';
    userMessage.style.flexDirection = 'row-reverse';
    userMessage.innerHTML = `
        <div class="message-avatar" style="background: #10B981; margin-left: 0.75rem; margin-right: 0;">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content" style="background: #3B82F6; color: white;">
            <p>${message}</p>
        </div>
    `;
    
    botMessages.appendChild(userMessage);
    botMessages.scrollTop = botMessages.scrollHeight;
}

// Add bot response with monitoring and guidelines
function addBotResponse(userMessage) {
    const userData = JSON.parse(localStorage.getItem('padhleChamps_user'));
    
    // Monitor student activity
    trackStudentActivity(userData.userId, userMessage);
    
    // Generate intelligent response based on message
    const response = generateBotResponse(userMessage.toLowerCase());
    
    const botMessages = document.getElementById('botMessages');
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${response}</p>
        </div>
    `;
    
    botMessages.appendChild(botMessage);
    botMessages.scrollTop = botMessages.scrollHeight;
    
    // Provide guidelines after response
    setTimeout(() => {
        provideGuidelines();
    }, 2000);
}

// Generate intelligent bot response
function generateBotResponse(message) {
    if (message.includes('help') || message.includes('stuck')) {
        return "I see you need help! Remember, every expert was once a beginner. Let's break down the problem step by step.";
    } else if (message.includes('difficult') || message.includes('hard')) {
        return "I understand this feels challenging. That's completely normal! Difficulty means you're growing. Let me guide you through this.";
    } else if (message.includes('study') || message.includes('learn')) {
        return "Great attitude towards learning! I'm monitoring your progress and I can see you're dedicated. Keep up the excellent work!";
    } else if (message.includes('time') || message.includes('schedule')) {
        return "Time management is crucial for success. I've been tracking your study patterns. Would you like me to suggest an optimal study schedule?";
    } else {
        const responses = [
            "I'm keeping an eye on your progress and you're doing well! Here's what I recommend for your next steps...",
            "Based on my monitoring, I can see you're engaged. Let me provide some guidance to help you excel.",
            "I'm here to guide you every step of the way. Your learning journey is important to me.",
            "I've been observing your study habits. You're on the right track! Here's how to improve further..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Track student activity for monitoring
async function trackStudentActivity(userId, message) {
    try {
        const activityRef = database.ref(`studentActivity/${userId}/${Date.now()}`);
        await activityRef.set({
            message: message,
            timestamp: Date.now(),
            type: 'chat_interaction'
        });
    } catch (error) {
        console.error('Error tracking activity:', error);
    }
}

// Provide learning guidelines
function provideGuidelines() {
    const guidelines = [
        "📚 Study Tip: Take breaks every 25 minutes to maintain focus and retention.",
        "🎯 Goal Setting: Set small, achievable daily goals to build momentum.",
        "📝 Note Taking: Write down key points in your own words to improve understanding.",
        "🔄 Review: Revisit yesterday's topics for 10 minutes before starting new material.",
        "❓ Ask Questions: Don't hesitate to ask when you don't understand something.",
        "⏰ Consistency: Study at the same time daily to build a strong habit.",
        "🧠 Active Learning: Teach concepts to yourself or others to deepen understanding."
    ];
    
    const randomGuideline = guidelines[Math.floor(Math.random() * guidelines.length)];
    
    const botMessages = document.getElementById('botMessages');
    const guidelineMessage = document.createElement('div');
    guidelineMessage.className = 'bot-message';
    guidelineMessage.innerHTML = `
        <div class="message-avatar" style="background: #F59E0B;">
            <i class="fas fa-lightbulb"></i>
        </div>
        <div class="message-content" style="background: #FEF3C7; border-left: 4px solid #F59E0B;">
            <p><strong>Learning Guideline:</strong><br>${randomGuideline}</p>
        </div>
    `;
    
    botMessages.appendChild(guidelineMessage);
    botMessages.scrollTop = botMessages.scrollHeight;
}

// Handle Enter key in bot input
document.addEventListener('keypress', function(e) {
    if (e.target.id === 'botInput' && e.key === 'Enter') {
        sendBotMessage();
    }
});

// Show restriction popup
function showRestrictionPopup(blockData) {
    // Create and show the restriction popup
    const overlay = document.createElement('div');
    overlay.className = 'restriction-overlay';
    overlay.innerHTML = `
        <div class="restriction-popup">
            <div class="restriction-icon">
                <i class="fas fa-ban"></i>
            </div>
            <div class="blocked-status" id="blockStatus">
                Account ${blockData.type === 'permanent' ? 'Permanently' : 'Temporarily'} Blocked
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 700; color: #1F2937; margin-bottom: 1rem;">
                Access Restricted
            </h2>
            <div id="blockMessage" style="color: #6B7280; margin-bottom: 1.5rem; line-height: 1.6;">
                ${blockData.type === 'permanent' 
                    ? 'Your account has been permanently blocked. Please contact administration for assistance.'
                    : `Your account is temporarily blocked until ${new Date(blockData.expiresAt).toLocaleString()}. Please contact your teacher for more information.`
                }
            </div>
            <div id="blockDetails" style="margin-bottom: 2rem;">
                <div class="text-left">
                    <div class="text-sm text-red-800">
                        <strong>Block Details:</strong><br>
                        <div class="mt-2 space-y-1">
                            <div><strong>Type:</strong> ${blockData.type === 'permanent' ? 'Permanent' : 'Temporary'}</div>
                            ${blockData.expiresAt ? `<div><strong>Expires:</strong> ${new Date(blockData.expiresAt).toLocaleString()}</div>` : ''}
                            <div><strong>Blocked On:</strong> ${new Date(blockData.blockedAt).toLocaleString()}</div>
                            <div><strong>Reason:</strong> ${blockData.reason || 'No reason provided'}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="contactSupport()" style="
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    pointer-events: auto !important;
                    z-index: 99999;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-envelope mr-2"></i>Contact Support
                </button>
                <button onclick="logout()" style="
                    background: linear-gradient(135deg, #6B7280, #4B5563);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    pointer-events: auto !important;
                    z-index: 99999;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Ensure contact functionality works
    enableContactFunctionality();
}

// Disable all interactions
function disableAllInteractions() {
    // Disable all clickable elements except contact and logout functions
    const clickableElements = document.querySelectorAll('button, a, .quick-access-card, .batch-card, [onclick]');
    clickableElements.forEach(element => {
        // Skip elements inside restriction popup
        if (element.closest('.restriction-overlay')) {
            return;
        }
        
        // Skip contact and logout related elements
        if (element.onclick && (element.onclick.toString().includes('contactSupport') || element.onclick.toString().includes('logout'))) {
            return;
        }
        
        element.style.pointerEvents = 'none';
        element.style.opacity = '0.5';
        element.style.cursor = 'not-allowed';
        
        // Store original onclick and replace with blocked handler
        if (element.onclick) {
            element.setAttribute('data-original-onclick', element.onclick.toString());
            element.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                showBlockedMessage();
                return false;
            };
        }
    });
    
    // Disable form inputs except those in restriction popup
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Skip elements inside restriction popup
        if (input.closest('.restriction-overlay')) {
            return;
        }
        
        input.disabled = true;
        input.style.opacity = '0.5';
    });
}

// Show blocked message
function showBlockedMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FEE2E2, #FECACA);
        color: #991B1B;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        border: 1px solid #FCA5A5;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    `;
    message.innerHTML = '<i class="fas fa-ban mr-2"></i>Access Restricted - Account Blocked';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
        }
    }, 3000);
}

// Enable contact functionality
function enableContactFunctionality() {
    // Ensure contact support function works even when blocked
    window.contactSupport = function() {
        window.location.href = 'students-contact-us.html';
    };
    
    // Ensure logout function works
    window.logout = function() {
        localStorage.removeItem('padhleChamps_user');
        window.location.href = 'login.html';
    };
}

// Contact support function
function contactSupport() {
    window.location.href = 'students-contact-us.html';
}

// Logout function
function logout() {
    localStorage.removeItem('padhleChamps_user');
    window.location.href = 'login.html';
}

// Navigate to brainstorm
function goToBrainstorm() {
    window.location.href = 'brainstorm.html';
}

// Open dashboard
function openDashboard() {
    const dashboardModal = document.getElementById('dashboardModal');
    dashboardModal.classList.remove('hidden');
    
    // Load dashboard data
    loadDashboardData();
}

// Close dashboard
function closeDashboard() {
    const dashboardModal = document.getElementById('dashboardModal');
    dashboardModal.classList.add('hidden');
}

// Load dashboard data
async function loadDashboardData() {
    const userData = JSON.parse(localStorage.getItem('padhleChamps_user'));
    
    // Load bot remarks
    await loadBotRemarks(userData.userId);
    
    // Load website updates
    loadWebsiteUpdates();
    
    // Load progress stats
    loadProgressStats(userData.userId);
}

// Load bot remarks and motivations
async function loadBotRemarks(userId) {
    const remarks = [
        {
            icon: 'fas fa-star',
            color: 'text-amber-500',
            text: 'Excellent progress this week! You\'ve maintained a 5-day study streak.',
            time: '2 hours ago'
        },
        {
            icon: 'fas fa-trophy',
            color: 'text-green-500', 
            text: 'Congratulations! You\'ve completed 80% of your weekly learning goals.',
            time: '1 day ago'
        },
        {
            icon: 'fas fa-fire',
            color: 'text-orange-500',
            text: 'Keep up the momentum! Your consistency is paying off.',
            time: '2 days ago'
        },
        {
            icon: 'fas fa-heart',
            color: 'text-red-500',
            text: 'I\'m proud of your dedication to learning. You\'re doing amazing!',
            time: '3 days ago'
        }
    ];
    
    const container = document.getElementById('botRemarks');
    container.innerHTML = remarks.map(remark => `
        <div class="remark-card">
            <div class="remark-icon">
                <i class="${remark.icon} ${remark.color}"></i>
            </div>
            <div class="remark-content">
                <p class="remark-text">${remark.text}</p>
                <span class="remark-time">${remark.time}</span>
            </div>
        </div>
    `).join('');
}

// Load website updates
function loadWebsiteUpdates() {
    const updates = [
        {
            badge: 'NEW',
            badgeColor: '#F59E0B',
            title: 'Interactive Quizzes Added',
            desc: 'New interactive quizzes available for all batches with instant feedback',
            time: '6 hours ago'
        },
        {
            badge: 'UPDATE',
            badgeColor: '#10B981',
            title: 'Bot Assistant Enhanced',
            desc: 'Improved AI responses with better learning guidance and motivation',
            time: '1 day ago'
        },
        {
            badge: 'FEATURE',
            badgeColor: '#3B82F6',
            title: 'Progress Tracking System',
            desc: 'New dashboard to track your learning progress and achievements',
            time: '2 days ago'
        },
        {
            badge: 'NEW',
            badgeColor: '#F59E0B',
            title: 'Study Materials Updated',
            desc: 'Fresh content and practice questions added to all courses',
            time: '1 week ago'
        }
    ];
    
    const container = document.getElementById('websiteUpdates');
    container.innerHTML = updates.map(update => `
        <div class="update-card">
            <div class="update-badge" style="background: ${update.badgeColor};">${update.badge}</div>
            <div class="update-content">
                <h4 class="update-title">${update.title}</h4>
                <p class="update-desc">${update.desc}</p>
                <span class="update-time">${update.time}</span>
            </div>
        </div>
    `).join('');
}

// Start streak tracking
function startStreakTracking() {
    streakTimer = setTimeout(async () => {
        if (!streakCounted) {
            const userData = localStorage.getItem('padhleChamps_user');
            if (userData) {
                const user = JSON.parse(userData);
                await updateDayStreak(user.userId);
                streakCounted = true;
            }
        }
    }, 20000);
}

// Update day streak
async function updateDayStreak(userId) {
    try {
        const today = new Date().toDateString();
        const statsRef = database.ref(`userStats/${userId}`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        
        if (stats.lastStreakDate === today) return;
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = 1;
        
        if (stats.lastStreakDate === yesterday) {
            newStreak = (stats.streak || 0) + 1;
        }
        
        await statsRef.update({
            streak: newStreak,
            lastStreakDate: today
        });
        
        // Update UI
        const streakElement = document.getElementById('userStreak');
        const statsStreakElement = document.getElementById('statsStreak');
        if (streakElement) streakElement.textContent = newStreak;
        if (statsStreakElement) statsStreakElement.textContent = newStreak;
        
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// Start session tracking
function startSessionTracking() {
    setInterval(() => {
        const sessionDuration = Date.now() - sessionStartTime;
    }, 60000);
}

// Load notifications
function loadNotifications() {
    // Implementation for notifications
}

// Check feedback form
function checkFeedbackForm() {
    // Implementation for feedback
}

// Ask doubts function
function askDoubts() {
    window.location.href = 'ask-doubts.html';
}

// Open XP leaderboard
function openXPLeaderboard() {
    window.location.href = 'xp-ladder.html';
}

// Get creative XP
async function getCreativeXP(userId) {
    try {
        const creativeRef = database.ref(`creativeCorner`);
        const snapshot = await creativeRef.once('value');
        const allPosts = snapshot.val();
        
        let creativeXP = 0;
        if (allPosts) {
            Object.values(allPosts).forEach(post => {
                if (post.userId === userId) {
                    creativeXP += 10;
                }
            });
        }
        
        return creativeXP;
    } catch (error) {
        console.error('Error getting creative XP:', error);
        return 0;
    }
}

// Show video XP summary notification
function showVideoXPSummary(videoXP) {
    // Remove existing notification if any
    const existingNotification = document.getElementById('videoXPSummary');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'videoXPSummary';
    notification.className = 'video-xp-summary';
    notification.innerHTML = `
        <div class="video-xp-content">
            <div class="video-xp-icon">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="video-xp-text">
                <h3>Video Learning Complete!</h3>
                <p>You earned <strong>${videoXP} XP</strong> from watching videos</p>
                <div class="video-xp-details">
                    <span><i class="fas fa-clock"></i> ${Math.floor(videoXP / 5)} minutes watched</span>
                    <span><i class="fas fa-star"></i> 5 XP per minute</span>
                </div>
            </div>
            <button class="video-xp-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .video-xp-summary {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 400px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .video-xp-summary.show {
            transform: translateX(0);
        }
        
        .video-xp-content {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            gap: 15px;
        }
        
        .video-xp-icon {
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
        
        .video-xp-text {
            flex: 1;
        }
        
        .video-xp-text h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 700;
        }
        
        .video-xp-text p {
            margin: 0 0 12px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .video-xp-details {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .video-xp-details span {
            font-size: 12px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .video-xp-close {
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
        
        .video-xp-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    
    if (!document.getElementById('videoXPSummaryStyles')) {
        style.id = 'videoXPSummaryStyles';
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

// Load progress stats
function loadProgressStats(userId) {
    const progressOverview = document.getElementById('progressOverview');
    if (progressOverview) {
        progressOverview.innerHTML = `
            <div class="progress-stat">
                <div class="stat-value">85%</div>
                <div class="stat-label">Completion Rate</div>
            </div>
            <div class="progress-stat">
                <div class="stat-value">12</div>
                <div class="stat-label">Tests Taken</div>
            </div>
            <div class="progress-stat">
                <div class="stat-value">8</div>
                <div class="stat-label">DPPs Completed</div>
            </div>
        `;
    }
}
