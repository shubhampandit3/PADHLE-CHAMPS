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

// Class content data
const classContent = {
    '10': {
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
        courses: [
            { title: 'CBSE Math Class 10', instructor: 'Dr. Sharma', icon: 'fa-calculator', rating: '4.9', duration: '45 hours', level: 'Advanced' },
            { title: 'Physics & Chemistry', instructor: 'Prof. Kumar', icon: 'fa-atom', rating: '4.8', duration: '40 hours', level: 'Advanced' }
        ],
        historyCourses: [
            { title: 'The Rise of Nationalism in Europe', instructor: 'Prof. History', thumbnail: 'rise_nationalism-class10.png', rating: '4.9', duration: '12 hours', level: 'Advanced' }
        ],
        englishCourses: [
            { title: 'A Letter to God', instructor: 'Prof. English', thumbnail: 'letter_god-class10.png', rating: '4.8', duration: '8 hours', level: 'Advanced' }
        ]
    },
    '9': {
        subjects: ['Mathematics', 'Science', 'English', 'Hindi'],
        courses: [
            { title: 'Algebra Fundamentals', instructor: 'Ms. Gupta', icon: 'fa-square-root-alt', rating: '4.7', duration: '35 hours', level: 'Intermediate' },
            { title: 'Biology Basics', instructor: 'Dr. Patel', icon: 'fa-leaf', rating: '4.6', duration: '30 hours', level: 'Intermediate' }
        ]
    },
    '8': {
        subjects: ['Mathematics', 'Science', 'English', 'Geography'],
        courses: [
            { title: 'Number Systems', instructor: 'Mr. Singh', icon: 'fa-hashtag', rating: '4.5', duration: '25 hours', level: 'Intermediate' },
            { title: 'Earth Science', instructor: 'Ms. Verma', icon: 'fa-globe', rating: '4.4', duration: '28 hours', level: 'Beginner' }
        ]
    },
    '5': {
        subjects: ['Mathematics', 'Science', 'English', 'Hindi'],
        courses: [
            { title: 'Light', instructor: 'Dr. Science', thumbnail: 'light-class5.png', rating: '4.9', duration: '8 hours', level: 'Beginner' },
            { title: 'Food We Eat', instructor: 'Mrs. Nutrition', thumbnail: 'food_we_eat-class5.png', rating: '4.8', duration: '6 hours', level: 'Beginner' },
            { title: 'Friction As A Force', instructor: 'Prof. Physics', thumbnail: 'friction-class5.png', rating: '4.7', duration: '7 hours', level: 'Beginner' },
            { title: 'Digestive and Excretory System', instructor: 'Dr. Biology', thumbnail: 'digestive-class5.png', rating: '4.8', duration: '9 hours', level: 'Beginner' },
            { title: 'Teeth', instructor: 'Dr. Biology', thumbnail: 'teeth-class5.png', rating: '4.7', duration: '6 hours', level: 'Beginner' },
            { title: 'Push and Pull', instructor: 'Prof. Physics', thumbnail: 'push_pull-class5.png', rating: '4.6', duration: '5 hours', level: 'Beginner' },
            { title: 'Circulatory System', instructor: 'Dr. Biology', thumbnail: 'circulatory-class5.png', rating: '4.8', duration: '7 hours', level: 'Beginner' }
        ],
        englishCourses: [
            { title: 'The Warmth of a Candle', instructor: 'Ms. English', thumbnail: 'the_warmth_candle-class5.png', rating: '4.8', duration: '4 hours', level: 'Beginner' },
            { title: 'My Shadow', instructor: 'Ms. English', thumbnail: 'my_shadow-class5.png', rating: '4.7', duration: '3 hours', level: 'Beginner' }
        ],
        socialScienceCourses: [
            { title: 'Evolution of Human Beings', instructor: 'Prof. History', thumbnail: 'evolution-class5.png', rating: '4.9', duration: '8 hours', level: 'Beginner' }
        ]
    }
};

// Initialize class selection
function initializeClassSelection() {
    const classSelector = document.getElementById('classSelector');
    
    // Load saved class from localStorage
    const savedClass = localStorage.getItem('selectedClass');
    if (savedClass) {
        classSelector.value = savedClass;
        selectClass(savedClass);
    }
    
    classSelector.addEventListener('change', function() {
        const selectedClass = this.value;
        if (selectedClass) {
            selectClass(selectedClass);
            localStorage.setItem('selectedClass', selectedClass);
        }
    });
}

// Select class and load content
function selectClass(classNumber) {
    if (!classNumber) return;
    
    // Hide no progress state if it exists
    const noProgress = document.getElementById('noProgress');
    if (noProgress) {
        noProgress.style.display = 'none';
    }
    
    // Load class content
    loadClassContent(classNumber);
}

// Load class-specific content
function loadClassContent(classNumber) {
    const content = classContent[classNumber];
    const coursesGrid = document.getElementById('coursesGrid');
    const learningProgress = document.getElementById('learningProgress');
    const scienceSection = document.getElementById('scienceSection');
    
    // Load continue learning progress
    loadContinueLearning(classNumber, learningProgress);
    
    // Show science and english sections for class 5
    if (classNumber === '5') {
        scienceSection.style.display = 'block';
        coursesGrid.innerHTML = `
            <div class="courses-scroll" id="coursesScroll">
                ${content.courses.map(course => `
                    <div class="course-card" style="background-image: url('${course.thumbnail}');" title="${course.title}" onclick="openChapter('${course.title}')">
                    </div>
                `).join('')}
            </div>
        `;
        
        // Show English section
        const englishSection = document.getElementById('englishSection');
        const englishGrid = document.getElementById('englishGrid');
        englishSection.style.display = 'block';
        englishGrid.innerHTML = `
            <div class="courses-scroll" id="englishScroll">
                ${content.englishCourses.map(course => `
                    <div class="course-card" style="background-image: url('${course.thumbnail}');" title="${course.title}" onclick="openChapter('${course.title}')">
                    </div>
                `).join('')}
            </div>
        `;
        
        // Show Social Science section
        const socialScienceSection = document.getElementById('socialScienceSection');
        const socialScienceGrid = document.getElementById('socialScienceGrid');
        socialScienceSection.style.display = 'block';
        socialScienceGrid.innerHTML = `
            <div class="courses-scroll" id="socialScienceScroll">
                ${content.socialScienceCourses.map(course => `
                    <div class="course-card" style="background-image: url('${course.thumbnail}');" title="${course.title}" onclick="openChapter('${course.title}')">
                    </div>
                `).join('')}
            </div>
        `;
    } else if (classNumber === '10') {
        scienceSection.style.display = 'none';
        const englishSection = document.getElementById('englishSection');
        const socialScienceSection = document.getElementById('socialScienceSection');
        const historySection = document.getElementById('historySection');
        
        if (englishSection) englishSection.style.display = 'none';
        if (socialScienceSection) socialScienceSection.style.display = 'none';
        
        // Show History section for class 10
        if (historySection && content.historyCourses) {
            historySection.style.display = 'block';
            const historyGrid = document.getElementById('historyGrid');
            historyGrid.innerHTML = content.historyCourses.map(course => `
                <div class="course-card" style="background-image: url('${course.thumbnail}');" title="${course.title}" onclick="openChapter('${course.title}')">
                </div>
            `).join('');
        }
        
        // Show English section for class 10
        if (content.englishCourses) {
            englishSection.style.display = 'block';
            const englishGrid = document.getElementById('englishGrid');
            englishGrid.innerHTML = content.englishCourses.map(course => `
                <div class="course-card" style="background-image: url('${course.thumbnail}');" title="${course.title}" onclick="openChapter('${course.title}')">
                </div>
            `).join('');
        }
    } else {
        scienceSection.style.display = 'none';
        const englishSection = document.getElementById('englishSection');
        const socialScienceSection = document.getElementById('socialScienceSection');
        const historySection = document.getElementById('historySection');
        if (englishSection) englishSection.style.display = 'none';
        if (socialScienceSection) socialScienceSection.style.display = 'none';
        if (historySection) historySection.style.display = 'none';
    }
}

// Load continue learning progress
async function loadContinueLearning(classNumber, container) {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) {
        container.innerHTML = `
            <div class="progress-card">
                <div class="progress-info">
                    <h3>Continue Learning - Class ${classNumber}</h3>
                    <p>Start your learning journey</p>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0% Complete</span>
            </div>
        `;
        return;
    }
    
    const user = JSON.parse(userData);
    
    try {
        const progressRef = database.ref(`userProgress/${user.userId}`);
        const snapshot = await progressRef.once('value');
        const allProgress = snapshot.val() || {};
        
        // Get chapters for current class
        const classChapters = getChaptersForClass(classNumber);
        
        // Find all unfinished videos for current class only
        let unfinishedVideos = [];
        
        Object.keys(allProgress).forEach(chapter => {
            // Only include chapters that belong to current class
            if (classChapters.includes(chapter)) {
                Object.keys(allProgress[chapter]).forEach(videoKey => {
                    const progress = allProgress[chapter][videoKey];
                    // Only show videos that are not completed AND have less than 90% progress
                    if (progress.percentage < 90 && !progress.completed) {
                        unfinishedVideos.push({ ...progress, chapter, videoKey });
                    }
                });
            }
        });
        
        // Sort by most recent
        unfinishedVideos.sort((a, b) => b.timestamp - a.timestamp);
        
        if (unfinishedVideos.length > 0) {
            container.innerHTML = `
                <div class="continue-scroll" id="continueScroll">
                    ${unfinishedVideos.map(progress => `
                        <div class="continue-learning-card" onclick="continueLearning('${progress.chapter}', '${progress.videoKey}', ${progress.currentTime})">
                            <div class="continue-thumbnail" style="background-image: url('${getChapterThumbnail(progress.chapter)}');"></div>
                            <div class="continue-progress">
                                <div class="continue-progress-bar">
                                    <div class="continue-progress-fill" style="width: ${progress.percentage}%"></div>
                                </div>
                            </div>
                            <div class="continue-info">
                                <h3>${progress.videoTitle}</h3>
                                <p>(${progress.chapterName})</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            // Check if there are any videos at all for current class
            let hasAnyProgress = false;
            Object.keys(allProgress).forEach(chapter => {
                if (classChapters.includes(chapter) && Object.keys(allProgress[chapter]).length > 0) {
                    hasAnyProgress = true;
                }
            });
            
            if (hasAnyProgress) {
                container.innerHTML = `
                    <div class="no-continue-card">
                        <div class="no-continue-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                        </div>
                        <div class="no-continue-info">
                            <h3>All Caught Up!</h3>
                            <p>No videos in progress. Start a new chapter to continue learning.</p>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="no-continue-card">
                        <div class="no-continue-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91-6.91a2.12 2.12 0 0 1 0-3l2.83-2.83a2.12 2.12 0 0 1 3 0l.13.13"/>
                                <path d="M12.8 21.6A1 1 0 0 0 14 20.8l.13-.13a2.12 2.12 0 0 0 0-3L12.8 16.4a1 1 0 0 0-1.4 0L7.6 20.2a6 6 0 0 0 7.94-7.94l6.91 6.91a2.12 2.12 0 0 0 3 0l2.83-2.83a2.12 2.12 0 0 0 0-3l-.13-.13"/>
                            </svg>
                        </div>
                        <div class="no-continue-info">
                            <h3>Start Learning!</h3>
                            <p>Begin your educational journey by selecting a chapter below.</p>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading continue learning:', error);
    }
}

// Get chapters for specific class
function getChaptersForClass(classNumber) {
    const classChapters = {
        '5': ['Light', 'Food We Eat', 'Friction As A Force', 'Digestive and Excretory System', 'Teeth', 'Push and Pull', 'Circulatory System', 'The Warmth of a Candle', 'My Shadow', 'Evolution of Human Beings'],
        '8': ['Number Systems', 'Earth Science'],
        '9': ['Algebra Fundamentals', 'Biology Basics'],
        '10': ['CBSE Math Class 10', 'Physics & Chemistry', 'The Rise of Nationalism in Europe', 'A Letter to God']
    };
    return classChapters[classNumber] || [];
}

// Get chapter thumbnail
function getChapterThumbnail(chapterName) {
    const thumbnails = {
        'Light': 'light-class5.png',
        'Food We Eat': 'food_we_eat-class5.png',
        'Friction As A Force': 'friction-class5.png',
        'Digestive and Excretory System': 'digestive-class5.png',
        'Teeth': 'teeth-class5.png',
        'Push and Pull': 'push_pull-class5.png',
        'Circulatory System': 'circulatory-class5.png',
        'The Rise of Nationalism in Europe': 'rise_nationalism-class10.png',
        'A Letter to God': 'letter_god-class10.png',
        'The Warmth of a Candle': 'the_warmth_candle-class5.png',
        'My Shadow': 'my_shadow-class5.png',
        'Evolution of Human Beings': 'evolution-class5.png'
    };
    return thumbnails[chapterName] || 'default-thumbnail.png';
}

// Continue learning function
function continueLearning(chapter, videoKey, currentTime) {
    const parts = videoKey.split('_');
    const videoIndex = parseInt(parts[parts.length - 1]); // Get last part as index
    window.location.href = `brainstream-player.html?chapter=${encodeURIComponent(chapter)}&video=${videoIndex}&time=${currentTime}`;
}

// Scroll carousel function
function scrollCarousel(direction) {
    const scrollContainer = document.getElementById('continueScroll');
    const cardWidth = 320 + 16; // card width + gap
    const scrollAmount = cardWidth * direction;
    
    scrollContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Scroll courses carousel function
function scrollCoursesCarousel(direction) {
    const scrollContainer = document.getElementById('coursesScroll');
    const cardWidth = parseInt(getComputedStyle(document.querySelector('.course-card')).width) + 20;
    const scrollAmount = cardWidth * direction;
    
    scrollContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Load user profile from localStorage
function loadUserProfile() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (userData) {
        const user = JSON.parse(userData);
        displayUserInfo(user);
    } else {
        // Redirect to login if no user data
        window.location.href = 'login.html';
    }
}

// Display user information
function displayUserInfo(user) {
    const userName = user.name || 'Student';
    
    // Update navigation user name
    document.getElementById('userName').textContent = userName;
    
    // Update hero greeting
    document.getElementById('heroUserName').textContent = userName;
    
    // Load additional user data if student
    if (user.role === 'Student') {
        loadStudentProgress(user.userId);
    }
}

// Load student progress and stats
async function loadStudentProgress(userId) {
    try {
        const xpSnapshot = await database.ref(`userStats/${userId}/xp`).once('value');
        const currentXP = xpSnapshot.val() || 0;
        
        // Calculate progress percentage (example: based on XP)
        const progressPercentage = Math.min((currentXP / 1000) * 100, 100);
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
        }
        
    } catch (error) {
        console.error('Error loading student progress:', error);
    }
}

// Initialize animations and interactions
function initializeAnimations() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.category-card, .course-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click handlers for category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('h3').textContent;
            navigateToCategory(categoryName);
        });
    });
    
    // Add click handlers for course cards
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseName = this.querySelector('h3').textContent;
            navigateToCourse(courseName);
        });
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data
        localStorage.removeItem('padhleChamps_user');
        
        // Show logout message
        showNotification('Logging out...');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Navigate to category page
function navigateToCategory(categoryName) {
    console.log(`Navigating to category: ${categoryName}`);
    showNotification(`Exploring ${categoryName} courses...`);
}

// Navigate to course page
function navigateToCourse(courseName) {
    console.log(`Navigating to course: ${courseName}`);
    showNotification(`Opening ${courseName} course...`);
}

// Open chapter in player
function openChapter(chapterName) {
    window.location.href = `brainstream-player.html?chapter=${encodeURIComponent(chapterName)}`;
}

// Navbar scroll functionality
let lastScrollTop = 0;
let scrollTimeout;

function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let ticking = false;
    
    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down & past threshold
            navbar.classList.add('hidden');
        } else {
            // Scrolling up or at top
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Load top picks based on views
async function loadTopPicks() {
    try {
        const topPicksGrid = document.getElementById('topPicksGrid');
        const videoStatsRef = database.ref('ott-views/stats');
        const snapshot = await videoStatsRef.once('value');
        const allStats = snapshot.val() || {};
        
        // Collect all chapters with their total views
        const chapterViews = {};
        
        Object.keys(allStats).forEach(chapter => {
            let totalViews = 0;
            Object.keys(allStats[chapter]).forEach(videoKey => {
                totalViews += allStats[chapter][videoKey] || 0;
            });
            if (totalViews >= 10) {
                chapterViews[chapter] = totalViews;
            }
        });
        
        // Sort chapters by views and get top 5
        const topChapters = Object.entries(chapterViews)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([chapter]) => chapter);
        
        if (topChapters.length > 0) {
            const thumbnails = {
                'Light': 'light-class5.png',
                'Food We Eat': 'food_we_eat-class5.png',
                'Friction As A Force': 'friction-class5.png',
                'Digestive and Excretory System': 'digestive-class5.png',
                'Teeth': 'teeth-class5.png',
                'Push and Pull': 'push_pull-class5.png',
                'Circulatory System': 'circulatory-class5.png',
                'The Rise of Nationalism in Europe': 'rise_nationalism-class10.png',
                'A Letter to God': 'letter_god-class10.png',
                'The Warmth of a Candle': 'the_warmth_candle-class5.png',
                'My Shadow': 'my_shadow-class5.png',
                'Evolution of Human Beings': 'evolution-class5.png'
            };
            
            topPicksGrid.innerHTML = topChapters.map((chapter, index) => `
                <div class="course-card" style="background-image: url('${thumbnails[chapter] || 'default-thumbnail.png'}');" title="${chapter}" onclick="openChapter('${chapter}')">
                    <div class="rank-badge">${index + 1}</div>
                    <div class="views-overlay">${chapterViews[chapter]} views</div>
                </div>
            `).join('');
        } else {
            topPicksGrid.innerHTML = `
                <div class="no-top-picks">
                    <div class="no-picks-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5c0-1.66-4-3-9-3S3 3.34 3 5z"/>
                        </svg>
                    </div>
                    <h3>No Top Picks This Week</h3>
                    <p>Start watching videos to see the most popular chapters here!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading top picks:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initializeAnimations();
    initializeClassSelection();
    initializeNavbarScroll();
    initializeHamburgerMenu();
    loadTopPicks();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('Something went wrong. Please try again.');
});

// Handle offline/online status
window.addEventListener('online', function() {
    showNotification('Connection restored!');
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.');
});

// Scroll english carousel function
function scrollEnglishCarousel(direction) {
    const scrollContainer = document.getElementById('englishScroll');
    const cardWidth = parseInt(getComputedStyle(document.querySelector('.course-card')).width) + 20;
    const scrollAmount = cardWidth * direction;
    
    scrollContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Scroll social science carousel function
function scrollSocialScienceCarousel(direction) {
    const scrollContainer = document.getElementById('socialScienceScroll');
    const cardWidth = parseInt(getComputedStyle(document.querySelector('.course-card')).width) + 20;
    const scrollAmount = cardWidth * direction;
    
    scrollContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}