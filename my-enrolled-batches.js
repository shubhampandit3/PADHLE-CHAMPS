// My Enrolled Batches JavaScript

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
let userEnrollments = [];
let userData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,
        offset: 50
    });
    
    checkUserLogin();
    loadUserData();
    loadEnrolledBatches();
});

// Check if user is logged in
function checkUserLogin() {
    const userDataStr = localStorage.getItem('padhleChamps_user');
    
    if (!userDataStr) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        userData = JSON.parse(userDataStr);
        
        // Redirect teachers to appropriate page
        if (userData.role === 'Teacher' || userData.role === 'teacher') {
            window.location.href = 'all-batches-teacher.html';
            return;
        }
        
        // Check if student is blocked
        if (userData.role === 'Student' || userData.role === 'student') {
            checkStudentBlockStatus(userData.userId);
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
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
                showBlockedMessage();
                return true;
            } else if (blockData.expiresAt && blockData.expiresAt <= now) {
                // Remove expired block
                await blockRef.remove();
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking block status:', error);
        return false;
    }
}

// Show blocked message
function showBlockedMessage() {
    document.body.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="text-center p-8">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-ban text-2xl text-red-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                <p class="text-gray-600 mb-6">Your account has been temporarily restricted. Please contact support.</p>
                <button onclick="window.location.href='home.html'" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Go Back
                </button>
            </div>
        </div>
    `;
}

// Load user data
function loadUserData() {
    if (!userData) return;
    
    // Update page title with user name
    document.title = `${userData.name}'s Batches - Padhle Champs`;
}

// Load enrolled batches
async function loadEnrolledBatches() {
    if (!userData) return;
    
    try {
        showLoadingState();
        
        const enrollmentsRef = database.ref('enrollments');
        const snapshot = await enrollmentsRef.once('value');
        const allEnrollments = snapshot.val();
        
        userEnrollments = [];
        
        if (allEnrollments) {
            // Find user's enrollments across all batches
            Object.keys(allEnrollments).forEach(batchType => {
                const batchEnrollments = allEnrollments[batchType];
                if (batchEnrollments) {
                    Object.keys(batchEnrollments).forEach(enrollmentId => {
                        const enrollment = batchEnrollments[enrollmentId];
                        if (enrollment.userId === userData.userId) {
                            userEnrollments.push({
                                ...enrollment,
                                batchType: batchType,
                                enrollmentId: enrollmentId
                            });
                        }
                    });
                }
            });
        }
        
        displayBatches();
        updateStats();
        
    } catch (error) {
        console.error('Error loading enrolled batches:', error);
        showErrorState();
    }
}

// Show loading state
function showLoadingState() {
    const container = document.getElementById('batchesContainer');
    container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <div class="text-center">
                <div class="loading-spinner mb-4"></div>
                <p class="text-gray-600 font-medium">Loading your batches...</p>
            </div>
        </div>
    `;
}

// Show error state
function showErrorState() {
    const container = document.getElementById('batchesContainer');
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Batches</h3>
            <p class="text-gray-600 mb-4">There was an error loading your enrolled batches.</p>
            <button onclick="loadEnrolledBatches()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-redo mr-2"></i>Try Again
            </button>
        </div>
    `;
}

// Display batches
function displayBatches() {
    const container = document.getElementById('batchesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (userEnrollments.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    const batchCards = userEnrollments.map(enrollment => createBatchCard(enrollment)).join('');
    container.innerHTML = batchCards;
    
    // Add animation to cards
    setTimeout(() => {
        const cards = container.querySelectorAll('.batch-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }, 100);
}

// Create batch card HTML
function createBatchCard(enrollment) {
    const batchInfo = getBatchInfo(enrollment.batchType);
    const enrollmentDate = new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="batch-card" onclick="openBatch('${enrollment.batchType}')">
            <div class="batch-header">
                <h3 class="batch-name">${enrollment.batchName}</h3>
                <p class="batch-mentor">Mentor: ${enrollment.mentor}</p>
            </div>
            <div class="batch-body">
                <div class="batch-info">
                    <div class="info-card">
                        <div class="info-icon blue">
                            <i class="material-icons-round">calendar_today</i>
                        </div>
                        <div class="info-content">
                            <div class="info-label">Enrolled On</div>
                            <div class="info-value">${enrollmentDate}</div>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-icon green">
                            <div class="info-icon green">
                            <i class="material-icons-round">schedule</i>
                        </div>
                        </div>
                        <div class="info-content">
                            <div class="info-label">Status</div>
                            <div class="info-value">Active</div>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-icon orange">
                            <i class="material-icons-round">book</i>
                        </div>
                        <div class="info-content">
                            <div class="info-label">Subjects</div>
                            <div class="info-value">${batchInfo.subjects}</div>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-icon purple">
                            <i class="material-icons-round">group</i>
                        </div>
                        <div class="info-content">
                            <div class="info-label">Batch Type</div>
                            <div class="info-value">${batchInfo.type}</div>
                        </div>
                    </div>
                </div>
                <div class="batch-actions">
                    <button onclick="event.stopPropagation(); openBatch('${enrollment.batchType}')" class="action-btn study-btn">
                        <i class="material-icons-round">school</i>
                        <span>Start Learning</span>
                    </button>
                    <button onclick="event.stopPropagation(); openBatchChat('${enrollment.batchType}')" class="action-btn chat-btn">
                        <i class="material-icons-round">chat</i>
                        <span>AI Assistant</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get batch information
function getBatchInfo(batchType) {
    const batchInfoMap = {
        'sangharsh-enrollments': {
            type: 'Foundation',
            subjects: '5 Subjects',
            icon: 'school',
            color: 'blue'
        },
        'manzil-enrollments': {
            type: 'Advanced',
            subjects: '5 Subjects',
            icon: 'trending_up',
            color: 'green'
        },
        'vigyan-enrollments': {
            type: 'Science Focus',
            subjects: '3 Subjects',
            icon: 'science',
            color: 'purple'
        },
        'codecrack-enrollments': {
            type: 'Programming',
            subjects: 'Coding',
            icon: 'code',
            color: 'orange'
        }
    };
    
    return batchInfoMap[batchType] || {
        type: 'General',
        subjects: 'Multiple',
        icon: 'book',
        color: 'gray'
    };
}

// Update statistics
function updateStats() {
    const totalBatchesEl = document.getElementById('totalBatches');
    const activeProgressEl = document.getElementById('activeProgress');
    const studyTimeEl = document.getElementById('studyTime');
    
    if (totalBatchesEl) {
        animateNumber(totalBatchesEl, 0, userEnrollments.length, 1000);
    }
    
    if (activeProgressEl) {
        // Calculate average progress (mock data for now)
        const avgProgress = userEnrollments.length > 0 ? Math.floor(Math.random() * 40) + 30 : 0;
        animateNumber(activeProgressEl, 0, avgProgress, 1500, '%');
    }
    
    if (studyTimeEl) {
        // Calculate study time (mock data for now)
        const studyHours = userEnrollments.length * Math.floor(Math.random() * 20) + 10;
        animateNumber(studyTimeEl, 0, studyHours, 2000, 'h');
    }
}

// Animate number counting
function animateNumber(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
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
    } else {
        showNotification('Batch page not found', 'error');
    }
}

// Open batch chat
function openBatchChat(batchType) {
    // For now, show a coming soon message
    showNotification('AI Assistant coming soon!', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        info: 'bg-blue-500 text-white',
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    
    notification.classList.add(...colors[type].split(' '));
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="material-icons-round text-sm">${type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info'}</i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals or go back
        window.location.href = 'home.html';
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate any responsive elements if needed
    const cards = document.querySelectorAll('.batch-card');
    cards.forEach(card => {
        card.style.transition = 'none';
        setTimeout(() => {
            card.style.transition = '';
        }, 100);
    });
});

// Refresh data when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadEnrolledBatches();
    }
});

// Export functions for global access
window.openBatch = openBatch;
window.openBatchChat = openBatchChat;