// XP Ladder JavaScript - Leaderboard System

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

// Level system configuration
const LEVELS = {
    1: { name: "Honhar Level", minXP: 0, maxXP: 99 },
    2: { name: "Beginner", minXP: 100, maxXP: 499 },
    3: { name: "Focused", minXP: 500, maxXP: 999 },
    4: { name: "Dedicated", minXP: 1000, maxXP: 1499 },
    5: { name: "Quick Learner", minXP: 1500, maxXP: 1999 },
    6: { name: "Smart Student", minXP: 2000, maxXP: 2499 },
    7: { name: "Brilliant Mind", minXP: 2500, maxXP: 2999 },
    8: { name: "Rare Genius", minXP: 3000, maxXP: 3999 },
    9: { name: "Epic Scholar", minXP: 4000, maxXP: 4999 },
    10: { name: "Legend Master", minXP: 5000, maxXP: Infinity }
};

// Global variables
let currentUser = null;
let allStudents = [];
let currentFilter = 'class';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadCurrentUser();
    loadLeaderboardData();
    updateWeekDisplay();
});

// Check if user is logged in
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
}

// Load current user data
function loadCurrentUser() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        displayUserStats();
    }
}

// Display user statistics
async function displayUserStats() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userClass').textContent = `Class ${currentUser.class || 'N/A'}`;
    
    // Get latest XP from Firebase
    try {
        const xpSnapshot = await database.ref(`userStats/${currentUser.userId}/xp`).once('value');
        const currentXP = xpSnapshot.val() || 0;
        
        // Update localStorage
        currentUser.xp = currentXP;
        localStorage.setItem('padhleChamps_user', JSON.stringify(currentUser));
        
        // Calculate level and progress
        const levelInfo = calculateLevel(currentXP);
        
        // Update UI
        document.getElementById('userXP').textContent = currentXP;
        document.getElementById('userLevel').textContent = levelInfo.name;
        document.getElementById('nextLevelXP').textContent = levelInfo.nextLevelXP;
        document.getElementById('progressPercent').textContent = `${levelInfo.progressPercent}%`;
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${levelInfo.progressPercent}%`;
        
        // Update badge showcase
        updateBadgeShowcase(levelInfo.level);
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Calculate user level based on XP
function calculateLevel(xp) {
    let currentLevel = 1;
    let levelName = "Honhar Level";
    
    for (let level = 1; level <= 10; level++) {
        if (xp >= LEVELS[level].minXP && xp <= LEVELS[level].maxXP) {
            currentLevel = level;
            levelName = LEVELS[level].name;
            break;
        }
    }
    
    const nextLevel = currentLevel < 10 ? currentLevel + 1 : 10;
    const nextLevelMinXP = LEVELS[nextLevel].minXP;
    const currentLevelMinXP = LEVELS[currentLevel].minXP;
    const xpInCurrentLevel = xp - currentLevelMinXP;
    const xpNeededForLevel = nextLevelMinXP - currentLevelMinXP;
    const progressPercent = currentLevel === 10 ? 100 : Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
    const nextLevelXP = currentLevel === 10 ? 0 : nextLevelMinXP - xp;
    
    return {
        level: currentLevel,
        name: levelName,
        xp: xp,
        nextLevelXP: nextLevelXP,
        progressPercent: progressPercent
    };
}

// Update badge showcase
function updateBadgeShowcase(userLevel) {
    const prevLevel = Math.max(1, userLevel - 1);
    const nextLevel = Math.min(10, userLevel + 1);
    
    // Update badge images and numbers
    document.querySelector('#prevBadge img').src = `Level ${prevLevel}.png`;
    document.querySelector('#prevBadge .badge-number').textContent = prevLevel;
    
    document.querySelector('#currentBadge img').src = `Level ${userLevel}.png`;
    document.querySelector('#currentBadge .badge-number').textContent = userLevel;
    
    document.querySelector('#nextBadge img').src = `Level ${nextLevel}.png`;
    document.querySelector('#nextBadge .badge-number').textContent = nextLevel;
    
    // Animate transition
    const showcase = document.querySelector('.badge-showcase');
    showcase.style.transform = 'scale(0.9)';
    setTimeout(() => {
        showcase.style.transform = 'scale(1)';
    }, 200);
}

// Load leaderboard data
async function loadLeaderboardData() {
    try {
        // Get all users from Firebase
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        // Get all user stats
        const statsSnapshot = await database.ref('userStats').once('value');
        const stats = statsSnapshot.val() || {};
        
        // Combine user data with stats
        allStudents = [];
        Object.keys(users).forEach(userId => {
            const user = users[userId];
            const userStats = stats[userId] || { xp: 0 };
            
            if (user.role === 'Student' || user.role === 'student') {
                allStudents.push({
                    userId: userId,
                    name: user.name,
                    class: user.class,
                    xp: userStats.xp || 0,
                    level: calculateLevel(userStats.xp || 0)
                });
            }
        });
        
        // Sort by XP (descending)
        allStudents.sort((a, b) => b.xp - a.xp);
        
        // Add ranks
        allStudents.forEach((student, index) => {
            student.rank = index + 1;
        });
        
        // Display leaderboard
        displayLeaderboard();
        updateUserRank();
        generateMotivationalMessage();
        
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    }
}

// Display leaderboard based on current filter
function displayLeaderboard() {
    let filteredStudents = [...allStudents];
    
    if (currentUser) {
        const userLevel = calculateLevel(currentUser.xp || 0).level;
        
        // Filter by user's level first
        filteredStudents = allStudents.filter(student => {
            const studentLevel = calculateLevel(student.xp || 0).level;
            return studentLevel === userLevel;
        });
        
        // Then filter by class if needed
        if (currentFilter === 'class' && currentUser.class) {
            filteredStudents = filteredStudents.filter(student => student.class === currentUser.class);
        }
        
        // Re-rank filtered students
        filteredStudents.forEach((student, index) => {
            student.filteredRank = index + 1;
        });
    }
    
    // Display filtered students in list with top 3 highlighted
    displayLeaderboardList(filteredStudents);
}



// Display leaderboard list
function displayLeaderboardList(students) {
    const container = document.getElementById('leaderboardList');
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-trophy text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">No More Students</h3>
                <p class="text-gray-400">You're viewing the complete leaderboard!</p>
            </div>
        `;
        return;
    }
    
    const listHTML = students.map((student, index) => {
        const actualRank = student.filteredRank || (index + 1);
        const isCurrentUser = student.userId === currentUser.userId;
        const badge = getBadgeForRank(actualRank);
        
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank-number">${actualRank}</div>
                <div class="student-avatar">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="student-info">
                    <div class="student-name">${student.name} ${isCurrentUser ? '(You)' : ''}</div>
                    <div class="student-class">Class ${student.class} • Level ${student.level.level}</div>
                </div>
                <div class="student-xp">${student.xp} XP</div>
                ${badge ? `<div class="student-badge">${badge}</div>` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = listHTML;
}

// Get badge for rank
function getBadgeForRank(rank) {
    if (rank === 1) return 'Champion';
    if (rank <= 3) return 'Top 3';
    if (rank <= 10) return 'Top 10';
    return null;
}

// Update user rank display
function updateUserRank() {
    if (!currentUser) return;
    
    const userInLeaderboard = allStudents.find(student => student.userId === currentUser.userId);
    if (userInLeaderboard) {
        let displayRank = userInLeaderboard.rank;
        
        if (currentFilter === 'class') {
            const classStudents = allStudents.filter(student => student.class === currentUser.class);
            const userInClass = classStudents.find(student => student.userId === currentUser.userId);
            displayRank = userInClass ? userInClass.classRank || userInClass.rank : userInLeaderboard.rank;
        }
        
        document.getElementById('userRank').textContent = `#${displayRank}`;
    } else {
        document.getElementById('userRank').textContent = '#-';
    }
}

// Filter leaderboard
function filterLeaderboard(type) {
    currentFilter = type;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh display
    displayLeaderboard();
    updateUserRank();
    generateMotivationalMessage();
}

// Generate motivational message
function generateMotivationalMessage() {
    if (!currentUser || allStudents.length === 0) return;
    
    const userInLeaderboard = allStudents.find(student => student.userId === currentUser.userId);
    if (!userInLeaderboard) return;
    
    const userRank = currentFilter === 'class' ? 
        allStudents.filter(s => s.class === currentUser.class).findIndex(s => s.userId === currentUser.userId) + 1 :
        userInLeaderboard.rank;
    
    const totalStudents = currentFilter === 'class' ? 
        allStudents.filter(s => s.class === currentUser.class).length :
        allStudents.length;
    
    let message = '';
    let icon = 'fas fa-fire';
    
    if (userRank === 1) {
        message = `🏆 Amazing! You're #1 ${currentFilter === 'class' ? 'in your class' : 'globally'}! Keep up the excellent work!`;
        icon = 'fas fa-crown';
    } else if (userRank <= 3) {
        message = `🥉 Fantastic! You're in the top 3 ${currentFilter === 'class' ? 'of your class' : 'globally'}! You're so close to the top!`;
        icon = 'fas fa-medal';
    } else if (userRank <= 10) {
        message = `⭐ Great job! You're in the top 10! Keep learning to climb higher!`;
        icon = 'fas fa-star';
    } else {
        const nextStudent = allStudents[userRank - 2]; // Student above current user
        if (nextStudent) {
            const xpDiff = nextStudent.xp - userInLeaderboard.xp;
            message = `🚀 You're just ${xpDiff} XP away from overtaking ${nextStudent.name}! Keep going!`;
        } else {
            message = `💪 Keep learning and practicing! Every XP counts towards your success!`;
        }
    }
    
    // Check for level progression
    const levelInfo = calculateLevel(userInLeaderboard.xp);
    if (levelInfo.nextLevelXP <= 50 && levelInfo.level < 10) {
        message = `🎯 You're only ${levelInfo.nextLevelXP} XP away from reaching Level ${levelInfo.level + 1}!`;
        icon = 'fas fa-target';
    }
    
    document.getElementById('motivationText').textContent = message;
    document.querySelector('.motivation-icon i').className = icon;
}

// Update week display
function updateWeekDisplay() {
    document.getElementById('currentWeek').textContent = 'Week 1';
}

// Navigation functions
function goHome() {
    window.location.href = 'home.html';
}

function showInfo() {
    window.location.href = 'leaderboard-info.html';
}

// Auto-refresh leaderboard every 30 seconds
setInterval(() => {
    loadLeaderboardData();
}, 30000);

// Add achievement notifications
function checkForAchievements(oldXP, newXP) {
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    
    if (newLevel.level > oldLevel.level) {
        showAchievementNotification(`Level Up! You've reached ${newLevel.name}!`, 'fas fa-level-up-alt');
    }
    
    // Check for milestone XP achievements
    const milestones = [100, 500, 1000, 2000, 3000, 5000];
    milestones.forEach(milestone => {
        if (oldXP < milestone && newXP >= milestone) {
            showAchievementNotification(`Milestone Reached! ${milestone} XP earned!`, 'fas fa-trophy');
        }
    });
}

// Show achievement notification
function showAchievementNotification(message, iconClass) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <i class="${iconClass}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.5s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 4000);
}

// Listen for XP updates from other pages
window.addEventListener('storage', function(e) {
    if (e.key === 'padhleChamps_user') {
        const oldUser = currentUser;
        loadCurrentUser();
        
        if (oldUser && currentUser && oldUser.xp !== currentUser.xp) {
            checkForAchievements(oldUser.xp || 0, currentUser.xp || 0);
            loadLeaderboardData(); // Refresh leaderboard
        }
    }
});

