// Batch Page JavaScript for Padhle Champs

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
let sessionStartTime = Date.now();

// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
    
    checkUserLogin();
    startSessionTracking();
});

// Check if user is logged in
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) {
        showMessage('Please login first to enroll in batches!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }
}

// Enroll in batch function
function enrollBatch(batchName) {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) {
        showMessage('Please login first to enroll!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        // Check if user is a student
        if (user.role !== 'Student') {
            showMessage('Only students can enroll in batches!', 'error');
            return;
        }
        
        // Batch information
        const batches = {
            sangharsh: {
                name: 'SANGHARSH BATCH 2025',
                class: '5',
                mentor: 'Aarav Pandit',
                description: 'Foundation building batch for Class 5 students'
            },
            manzil: {
                name: 'MANZIL BATCH 2025',
                class: '5',
                mentor: 'Aarav Pandit',
                description: 'Advanced learning batch for Class 5 students'
            },
            vigyan: {
                name: 'VIGYAN BATCH 2025',
                class: '10',
                mentor: 'Shubham Pandit',
                description: 'Science focused batch for Class 10 students'
            },
            codecrack: {
                name: 'CODECRACK BATCH',
                class: '7-12',
                mentor: 'Shubham Pandit',
                description: 'Programming and coding batch for Class 7-12 students'
            }
        };
        
        const selectedBatch = batches[batchName];
        
        if (!selectedBatch) {
            showMessage('Invalid batch selection!', 'error');
            return;
        }
        
        // Check class eligibility
        if (!checkClassEligibility(user.class, selectedBatch.class)) {
            showMessage(`This batch is for Class ${selectedBatch.class} students only!`, 'error');
            return;
        }
        
        // Show enrollment confirmation
        showEnrollmentModal(selectedBatch, user);
        
    } catch (error) {
        console.error('Error enrolling in batch:', error);
        showMessage('Error processing enrollment. Please try again.', 'error');
    }
}

// Check class eligibility
function checkClassEligibility(userClass, batchClass) {
    if (batchClass === '7-12') {
        const classNum = parseInt(userClass);
        return classNum >= 7 && classNum <= 12;
    }
    return userClass === batchClass;
}

// Show enrollment modal
function showEnrollmentModal(batch, user) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-graduation-cap text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Confirm Enrollment</h3>
                <p class="text-gray-600">You're about to enroll in:</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-bold text-lg text-blue-600 mb-2">${batch.name}</h4>
                <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center">
                        <i class="fas fa-graduation-cap mr-2 text-blue-600"></i>
                        <span>Class: ${batch.class}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-user-tie mr-2 text-green-600"></i>
                        <span>Mentor: ${batch.mentor}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-gift mr-2 text-amber-600"></i>
                        <span>Fee: FREE</span>
                    </div>
                </div>
                <p class="mt-3 text-sm text-gray-700">${batch.description}</p>
            </div>
            
            <div class="flex space-x-4">
                <button onclick="confirmEnrollment('${batch.name}', '${user.name}')" class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    <i class="fas fa-check mr-2"></i>Confirm Enrollment
                </button>
                <button onclick="closeModal()" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Confirm enrollment
async function confirmEnrollment(batchName, userName) {
    try {
        const userData = JSON.parse(localStorage.getItem('padhleChamps_user'));
        
        // Determine batch type for Firebase
        const batchTypes = {
            'SANGHARSH BATCH 2025': 'sangharsh-enrollments',
            'MANZIL BATCH 2025': 'manzil-enrollments', 
            'VIGYAN BATCH 2025': 'vigyan-enrollments',
            'CODECRACK BATCH': 'codecrack-enrollments'
        };
        
        const batchType = batchTypes[batchName];
        const mentors = {
            'SANGHARSH BATCH 2025': 'Aarav Pandit',
            'MANZIL BATCH 2025': 'Aarav Pandit',
            'VIGYAN BATCH 2025': 'Shubham Pandit', 
            'CODECRACK BATCH': 'Shubham Pandit'
        };
        
        // Save to Firebase
        const enrollmentRef = database.ref(`enrollments/${batchType}`).push();
        await enrollmentRef.set({
            userId: userData.userId,
            userName: userName,
            batchName: batchName,
            mentor: mentors[batchName],
            enrolledAt: Date.now(),
            status: 'active',
            progress: 0
        });
        
        closeModal();
        showMessage(`🎉 Congratulations ${userName}! You've successfully enrolled in ${batchName}`, 'success');
        
        // Show bot chat after enrollment
        setTimeout(() => {
            showBotWelcome(batchType);
        }, 2000);
        
        // Redirect to home after 5 seconds
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 5000);
        
    } catch (error) {
        console.error('Error enrolling in batch:', error);
        showMessage('Error enrolling in batch. Please try again.', 'error');
    }
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Go to home page
function goHome() {
    window.location.href = 'index.html';
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navToggle = document.getElementById('navToggle');
    
    mobileMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Show bot welcome after enrollment
function showBotWelcome(batchType) {
    const botWelcome = document.createElement('div');
    botWelcome.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-sm z-50 border border-gray-200';
    botWelcome.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <i class="fas fa-robot text-white"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-1">Learning Bot</h4>
                <p class="text-sm text-gray-600 mb-3">Welcome to your batch! I'm here to help you learn. Ready to start your journey?</p>
                <div class="flex space-x-2">
                    <button onclick="startBotChat('${batchType}')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                        Start Chat
                    </button>
                    <button onclick="closeBotWelcome()" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400">
                        Later
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(botWelcome);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (botWelcome.parentNode) {
            botWelcome.remove();
        }
    }, 10000);
}

// Start bot chat
function startBotChat(batchType) {
    closeBotWelcome();
    localStorage.setItem('openBotChat', batchType);
    window.location.href = 'home.html';
}

// Close bot welcome
function closeBotWelcome() {
    const botWelcome = document.querySelector('.fixed.bottom-4.right-4');
    if (botWelcome) {
        botWelcome.remove();
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Start session tracking
function startSessionTracking() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (userData) {
        const user = JSON.parse(userData);
        trackPageSession(user.userId, 'batch');
    }
}

// Track page session
async function trackPageSession(userId, pageName) {
    try {
        const sessionRef = database.ref(`userSessions/${userId}/${Date.now()}`);
        await sessionRef.set({
            page: pageName,
            startTime: Date.now(),
            date: new Date().toDateString()
        });
    } catch (error) {
        console.error('Error tracking session:', error);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    const userData = localStorage.getItem('padhleChamps_user');
    if (userData) {
        const user = JSON.parse(userData);
        const sessionTime = Date.now() - sessionStartTime;
        try {
            const totalSessionRef = database.ref(`userStats/${user.userId}/totalSessionTime`);
            const snapshot = await totalSessionRef.once('value');
            const currentTotal = snapshot.val() || 0;
            await totalSessionRef.set(currentTotal + sessionTime);
        } catch (error) {
            console.error('Error saving session time:', error);
        }
    }
});

// Navbar scroll effect
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
});