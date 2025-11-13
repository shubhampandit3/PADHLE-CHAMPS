// Community JavaScript with Bot Moderation

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
let currentUser = null;
let currentTab = 'all';
let userBanStatus = null;
let currentReplyPostId = null;
let banTimerInterval = null;
let streakTimer = null;
let streakCounted = false;
let sessionStartTime = Date.now();
let userStatsCache = {};

// Level system configuration
const LEVEL_SYSTEM = [
    { level: 1, min: 0, max: 99, color: '#6B7280', image: 'Level 1.png' },
    { level: 2, min: 100, max: 499, color: '#10B981', image: 'Level 2.png' },
    { level: 3, min: 500, max: 999, color: '#3B82F6', image: 'Level 3.png' },
    { level: 4, min: 1000, max: 1999, color: '#8B5CF6', image: 'Level 4.png' },
    { level: 5, min: 2000, max: 3999, color: '#F59E0B', image: 'Level 5.png' },
    { level: 6, min: 4000, max: 7999, color: '#EF4444', image: 'Level 6.png' },
    { level: 7, min: 8000, max: 15999, color: '#EC4899', image: 'Level 7.png' },
    { level: 8, min: 16000, max: 31999, color: '#6366F1', image: 'Level 8.png' },
    { level: 9, min: 32000, max: 63999, color: '#14B8A6', image: 'Level 9.png' },
    { level: 10, min: 64000, max: Infinity, color: '#F97316', image: 'Level 10.png' }
];

// Initialize Community
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    checkUserLogin();
    loadCommunityData();
    checkBanStatus();
    startStreakTracking();
    startSessionTracking();
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
        document.getElementById('userName').textContent = currentUser.name.split(' ')[0];
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
    }
}

// Load community data
async function loadCommunityData() {
    await loadPosts();
    await loadCommunityStats();
}

// Check ban status
async function checkBanStatus() {
    if (!currentUser) return;
    
    try {
        const banRef = database.ref(`userBans/${currentUser.userId}`);
        const snapshot = await banRef.once('value');
        const banData = snapshot.val();
        
        if (banData && banData.banUntil > Date.now()) {
            userBanStatus = banData;
            showBanStatus();
            disablePosting();
        }
    } catch (error) {
        console.error('Error checking ban status:', error);
    }
}

// Show ban status
function showBanStatus() {
    const banStatusEl = document.getElementById('banStatus');
    banStatusEl.classList.remove('hidden');
    
    const floatingBtn = document.getElementById('floatingAddBtn');
    floatingBtn.style.display = 'none';
    
    // Start ban timer
    startBanTimer();
}

// Start ban timer
function startBanTimer() {
    if (!userBanStatus || !userBanStatus.banUntil) return;
    
    banTimerInterval = setInterval(() => {
        const timeLeft = userBanStatus.banUntil - Date.now();
        
        if (timeLeft <= 0) {
            clearInterval(banTimerInterval);
            document.getElementById('banTimer').textContent = 'Ban expired';
            location.reload();
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        document.getElementById('banTimer').textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
    }, 1000);
}

// Disable posting
function disablePosting() {
    const floatingBtn = document.getElementById('floatingAddBtn');
    floatingBtn.style.display = 'none';
}

// Open create post modal
function openCreatePost() {
    if (userBanStatus) {
        showMessage('You are currently restricted from posting.', 'error');
        return;
    }
    
    const modal = document.getElementById('createPostModal');
    document.getElementById('modalUserName').textContent = currentUser.name.split(' ')[0];
    modal.classList.remove('hidden');
}

// Close create post modal
function closeCreatePost() {
    const modal = document.getElementById('createPostModal');
    modal.classList.add('hidden');
    document.getElementById('postContent').value = '';
}

// Create post with bot moderation
async function createPost() {
    if (!currentUser || userBanStatus) return;
    
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) {
        showMessage('Please write something before posting.', 'error');
        return;
    }
    
    // Bot content moderation
    const moderationResult = await moderateContent(content);
    
    if (!moderationResult.approved) {
        await handleContentViolation(moderationResult);
        return;
    }
    
    // Show warning for teachers if violations detected
    if (moderationResult.isTeacher && moderationResult.violations.length > 0) {
        showMessage('⚠️ Teacher Warning: Please review your content for community guidelines.', 'info');
    }
    
    try {
        // Create post in Firebase
        const postRef = database.ref('communityPosts').push();
        const postData = {
            id: postRef.key,
            userId: currentUser.userId,
            userName: currentUser.name,
            userRole: currentUser.role,
            content: content,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            replies: 0,
            status: 'approved',
            likedBy: {},
            dislikedBy: {}
        };
        
        await postRef.set(postData);
        
        // Clear input and close modal
        document.getElementById('postContent').value = '';
        closeCreatePost();
        
        // Reload posts
        await loadPosts();
        
        // Show success message
        showMessage('Post created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating post:', error);
        showMessage('Error creating post. Please try again.', 'error');
    }
}

// Bot content moderation
async function moderateContent(content) {
    const violations = [];
    const isTeacher = currentUser.role === 'Teacher';
    
    // Check for spam patterns
    const spamPatterns = [
        /subscribe/gi,
        /click here/gi,
        /visit.*link/gi,
        /buy now/gi,
        /limited offer/gi,
        /act fast/gi,
        /www\./gi,
        /http/gi,
        /\.com/gi,
        /\.org/gi,
        /\.net/gi
    ];
    
    spamPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            violations.push('Promotional/spam content detected');
        }
    });
    
    // Check for inappropriate content
    const inappropriatePatterns = [
        /sex/gi,
        /porn/gi,
        /nude/gi,
        /adult/gi,
        /dating/gi,
        /hookup/gi,
        /xxx/gi
    ];
    
    inappropriatePatterns.forEach(pattern => {
        if (pattern.test(content)) {
            violations.push('Inappropriate/sexual content detected');
        }
    });
    
    // Check for Hindi slang
    const hindiSlangPatterns = [
        /saala/gi,
        /kutta/gi,
        /haramkhor/gi,
        /madarchod/gi,
        /bhenchod/gi,
        /randi/gi,
        /kamina/gi,
        /harami/gi,
        /kutte/gi,
        /gandu/gi
    ];
    
    let hasHindiSlang = false;
    hindiSlangPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            violations.push('Offensive language detected');
            hasHindiSlang = true;
        }
    });
    
    // Check for violent content
    const violentPatterns = [
        /kill/gi,
        /murder/gi,
        /death/gi,
        /violence/gi,
        /fight/gi,
        /beat/gi,
        /attack/gi,
        /harm/gi,
        /hurt/gi,
        /destroy/gi,
        /maar/gi,
        /maut/gi,
        /ladai/gi,
        /hinsa/gi
    ];
    
    violentPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            violations.push('Violent content detected');
        }
    });
    
    // Check for excessive caps (spam indicator)
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const totalChars = content.length;
    if (capsCount / totalChars > 0.7 && content.length > 10) {
        violations.push('Excessive capital letters (spam indicator)');
    }
    
    // Check for repeated characters (spam indicator)
    if (/(.)\\1{4,}/.test(content)) {
        violations.push('Repeated characters (spam indicator)');
    }
    
    // If Hindi slang detected and user is student, scan post history
    if (hasHindiSlang && !isTeacher) {
        await scanUserPostsForViolence(currentUser.userId);
    }
    
    return {
        approved: isTeacher ? true : violations.length === 0,
        violations: violations,
        content: content,
        isTeacher: isTeacher
    };
}

// Scan user's previous posts for violent content
async function scanUserPostsForViolence(userId) {
    try {
        const postsRef = database.ref('communityPosts');
        const snapshot = await postsRef.once('value');
        
        if (snapshot.exists()) {
            const violentPatterns = [
                /kill/gi, /murder/gi, /death/gi, /violence/gi, /fight/gi,
                /beat/gi, /attack/gi, /harm/gi, /hurt/gi, /destroy/gi,
                /maar/gi, /maut/gi, /ladai/gi, /hinsa/gi
            ];
            
            snapshot.forEach(childSnapshot => {
                const post = childSnapshot.val();
                if (post.userId === userId && post.status === 'approved') {
                    const hasViolent = violentPatterns.some(pattern => pattern.test(post.content));
                    
                    if (hasViolent) {
                        // Ban user for 2 days and remove violent post
                        const banUntil = Date.now() + (2 * 24 * 60 * 60 * 1000);
                        database.ref(`userBans/${userId}`).set({
                            userId: userId,
                            banUntil: banUntil,
                            reason: 'Violent content detected in post history',
                            bannedAt: Date.now(),
                            violations: ['Violent content in previous posts']
                        });
                        
                        // Update post status to banned
                        database.ref(`communityPosts/${post.id}`).update({
                            status: 'banned',
                            violations: ['Violent content detected']
                        });
                        
                        return true; // Exit loop after first violation
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error scanning user posts:', error);
    }
}

// Handle content violation
async function handleContentViolation(moderationResult) {
    try {
        // Apply 2-day ban
        const banUntil = Date.now() + (2 * 24 * 60 * 60 * 1000); // 2 days
        const banData = {
            userId: currentUser.userId,
            banUntil: banUntil,
            reason: moderationResult.violations.join(', '),
            bannedAt: Date.now(),
            violations: moderationResult.violations
        };
        
        // Save ban to Firebase
        await database.ref(`userBans/${currentUser.userId}`).set(banData);
        
        // Create hidden post for user to see in their banned posts
        const postRef = database.ref('communityPosts').push();
        const postData = {
            id: postRef.key,
            userId: currentUser.userId,
            userName: currentUser.name,
            content: moderationResult.content,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            replies: 0,
            status: 'banned',
            violations: moderationResult.violations,
            banUntil: banUntil,
            likedBy: {},
            dislikedBy: {}
        };
        
        await postRef.set(postData);
        
        // Update local ban status
        userBanStatus = banData;
        showBanStatus();
        
        // Show warning modal
        showWarningModal(moderationResult.violations);
        
        // Clear input
        document.getElementById('postContent').value = '';
        
        // Close modal if open
        closeCreatePost();
        
    } catch (error) {
        console.error('Error handling content violation:', error);
    }
}

// Show warning modal
function showWarningModal(violations) {
    const modal = document.getElementById('warningModal');
    const violationReasons = document.getElementById('violationReasons');
    
    violationReasons.innerHTML = violations.map(violation => `
        <div class="violation-reason">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${violation}</span>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
}

// Close warning modal
function closeWarning() {
    const modal = document.getElementById('warningModal');
    modal.classList.add('hidden');
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (tab === 'ban-status') {
        document.getElementById('banStatusTab').classList.add('active');
    } else {
        document.getElementById(`${tab}Tab`).classList.add('active');
    }
    
    // Load posts for selected tab
    loadPosts();
}

// Load posts based on current tab
async function loadPosts() {
    try {
        const postsRef = database.ref('communityPosts');
        const snapshot = await postsRef.orderByChild('timestamp').once('value');
        const posts = [];
        
        snapshot.forEach(childSnapshot => {
            const post = childSnapshot.val();
            posts.unshift(post); // Reverse order (newest first)
        });
        
        let filteredPosts = [];
        
        switch (currentTab) {
            case 'all':
                filteredPosts = posts.filter(post => post.status === 'approved');
                break;
            case 'my':
                filteredPosts = posts.filter(post => post.userId === currentUser.userId);
                break;
            case 'ban-status':
                filteredPosts = posts.filter(post => 
                    post.userId === currentUser.userId && post.status === 'banned'
                );
                break;
        }
        
        displayPosts(filteredPosts);
        
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    
    if (posts.length === 0) {
        let message = 'No posts yet';
        let description = 'Be the first to start a discussion!';
        
        if (currentTab === 'my') {
            message = 'No posts from you yet';
            description = 'Create your first post to get started!';
        } else if (currentTab === 'ban-status') {
            message = 'No restricted posts';
            description = 'Great! You haven\'t violated any community guidelines.';
        }
        
        postsFeed.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">${message}</h3>
                <p class="text-gray-500">${description}</p>
            </div>
        `;
        return;
    }
    
    postsFeed.innerHTML = posts.map(post => createPostHTML(post)).join('');
    
    // Load user stats for each post with unique identifiers
    posts.forEach(post => {
        if (post.userRole !== 'Teacher') {
            loadUserStatsForPost(post.userId, post.id);
        }
    });
}

// Create post HTML
function createPostHTML(post) {
    const isBanned = post.status === 'banned';
    const timeAgo = formatTimeAgo(new Date(post.timestamp));
    const isLiked = post.likedBy && post.likedBy[currentUser.userId];
    const isDisliked = post.dislikedBy && post.dislikedBy[currentUser.userId];
    const isTeacher = post.userRole === 'Teacher';
    
    return `
        <div class="post-card ${isBanned ? 'banned' : ''} ${isTeacher ? 'teacher-post' : ''}" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author-avatar">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="post-author-info" ${!isTeacher ? `onclick="showUserProfile('${post.userId}', '${post.userName}')"`  : ''}>
                    <div class="post-author-name">
                        ${post.userName}
                        ${isTeacher ? '<span class="teacher-badge">Teacher</span>' : ''}
                        ${!isTeacher ? `<span class="author-level-badge" id="levelBadge-${post.id}"></span>` : ''}
                        ${!isTeacher ? `<span class="author-streak" id="streak-${post.id}">
                            <i class="fas fa-fire"></i>
                            <span id="streakValue-${post.id}">0</span>
                        </span>` : ''}
                    </div>
                    <div class="post-time">${timeAgo}</div>
                </div>
                ${isBanned ? `
                    <div class="post-status banned">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                        </svg>
                        Restricted
                    </div>
                ` : ''}
            </div>
            
            <div class="post-content">
                <p>${post.content}</p>
                ${isBanned && post.violations ? `
                    <div class="violation-info mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div class="text-sm text-red-600 font-semibold mb-1">
                            <svg class="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            Violations:
                        </div>
                        <div class="text-sm text-red-600">
                            ${post.violations.join(', ')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${!isBanned ? `
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                        </svg>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="action-btn ${isDisliked ? 'disliked' : ''}" onclick="toggleDislike('${post.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                        </svg>
                        <span>${post.dislikes || 0}</span>
                    </button>
                    <button class="action-btn" onclick="replyToPost('${post.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                        </svg>
                        <span>Reply</span>
                    </button>
                    <button class="action-btn" onclick="toggleReplies('${post.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <span>${post.replies || 0}</span>
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Toggle like
async function toggleLike(postId) {
    if (!currentUser || userBanStatus) return;
    
    try {
        const postRef = database.ref(`communityPosts/${postId}`);
        const snapshot = await postRef.once('value');
        const post = snapshot.val();
        
        if (!post) return;
        
        const likedBy = post.likedBy || {};
        const dislikedBy = post.dislikedBy || {};
        const isLiked = likedBy[currentUser.userId];
        
        // Remove from dislikes if disliked
        if (dislikedBy[currentUser.userId]) {
            delete dislikedBy[currentUser.userId];
            post.dislikes = Math.max(0, (post.dislikes || 0) - 1);
        }
        
        // Toggle like
        if (isLiked) {
            delete likedBy[currentUser.userId];
            post.likes = Math.max(0, (post.likes || 0) - 1);
        } else {
            likedBy[currentUser.userId] = true;
            post.likes = (post.likes || 0) + 1;
        }
        
        post.likedBy = likedBy;
        post.dislikedBy = dislikedBy;
        
        await postRef.update(post);
        await loadPosts();
        
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

// Toggle dislike
async function toggleDislike(postId) {
    if (!currentUser || userBanStatus) return;
    
    try {
        const postRef = database.ref(`communityPosts/${postId}`);
        const snapshot = await postRef.once('value');
        const post = snapshot.val();
        
        if (!post) return;
        
        const likedBy = post.likedBy || {};
        const dislikedBy = post.dislikedBy || {};
        const isDisliked = dislikedBy[currentUser.userId];
        
        // Remove from likes if liked
        if (likedBy[currentUser.userId]) {
            delete likedBy[currentUser.userId];
            post.likes = Math.max(0, (post.likes || 0) - 1);
        }
        
        // Toggle dislike
        if (isDisliked) {
            delete dislikedBy[currentUser.userId];
            post.dislikes = Math.max(0, (post.dislikes || 0) - 1);
        } else {
            dislikedBy[currentUser.userId] = true;
            post.dislikes = (post.dislikes || 0) + 1;
        }
        
        post.likedBy = likedBy;
        post.dislikedBy = dislikedBy;
        
        await postRef.update(post);
        await loadPosts();
        
    } catch (error) {
        console.error('Error toggling dislike:', error);
    }
}

// Reply to post
function replyToPost(postId) {
    if (!currentUser || userBanStatus) {
        showMessage('You are restricted from replying.', 'error');
        return;
    }
    
    currentReplyPostId = postId;
    
    // Get original post data
    database.ref(`communityPosts/${postId}`).once('value').then(snapshot => {
        const post = snapshot.val();
        if (post) {
            document.getElementById('originalPost').innerHTML = `
                <div class="text-sm text-gray-600 mb-1">Replying to ${post.userName}:</div>
                <div class="text-gray-800">${post.content}</div>
            `;
            document.getElementById('replyUserName').textContent = currentUser.name.split(' ')[0];
            document.getElementById('replyModal').classList.remove('hidden');
        }
    });
}

// Close reply modal
function closeReply() {
    document.getElementById('replyModal').classList.add('hidden');
    document.getElementById('replyContent').value = '';
    currentReplyPostId = null;
}

// Submit reply
async function submitReply() {
    if (!currentUser || userBanStatus || !currentReplyPostId) return;
    
    const content = document.getElementById('replyContent').value.trim();
    
    if (!content) {
        showMessage('Please write something before replying.', 'error');
        return;
    }
    
    // Bot moderation for reply
    const moderationResult = await moderateContent(content);
    
    if (!moderationResult.approved) {
        await handleContentViolation(moderationResult);
        return;
    }
    
    try {
        // Create reply in Firebase
        const replyRef = database.ref(`communityReplies/${currentReplyPostId}`).push();
        const replyData = {
            id: replyRef.key,
            postId: currentReplyPostId,
            userId: currentUser.userId,
            userName: currentUser.name,
            userRole: currentUser.role,
            content: content,
            timestamp: Date.now(),
            status: 'approved'
        };
        
        await replyRef.set(replyData);
        
        // Update reply count in original post
        const postRef = database.ref(`communityPosts/${currentReplyPostId}`);
        const postSnapshot = await postRef.once('value');
        const post = postSnapshot.val();
        
        await postRef.update({
            replies: (post.replies || 0) + 1
        });
        
        closeReply();
        await loadPosts();
        showMessage('Reply posted successfully!', 'success');
        
    } catch (error) {
        console.error('Error posting reply:', error);
        showMessage('Error posting reply. Please try again.', 'error');
    }
}

// Toggle replies visibility
function toggleReplies(postId) {
    const repliesContainer = document.getElementById(`replies-${postId}`);
    
    if (repliesContainer) {
        repliesContainer.classList.toggle('hidden');
        return;
    }
    
    // Load and show replies
    loadReplies(postId);
}

// Load replies for a post
async function loadReplies(postId) {
    try {
        const repliesRef = database.ref(`communityReplies/${postId}`);
        const snapshot = await repliesRef.orderByChild('timestamp').once('value');
        const replies = [];
        
        snapshot.forEach(childSnapshot => {
            const reply = childSnapshot.val();
            if (reply.status === 'approved') {
                replies.push(reply);
            }
        });
        
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const repliesHtml = replies.map(reply => `
                <div class="reply-item bg-gray-50 p-3 rounded-lg mb-2">
                    <div class="reply-author flex items-center mb-1">
                        <i class="fas fa-user text-gray-500 mr-2"></i>
                        <span class="font-semibold text-sm">${reply.userName}</span>
                        <span class="text-xs text-gray-500 ml-2">${formatTimeAgo(new Date(reply.timestamp))}</span>
                    </div>
                    <div class="reply-content text-sm text-gray-700">${reply.content}</div>
                </div>
            `).join('');
            
            const repliesContainer = document.createElement('div');
            repliesContainer.id = `replies-${postId}`;
            repliesContainer.className = 'replies-container mt-4 pl-4 border-l-2 border-gray-200';
            repliesContainer.innerHTML = repliesHtml || '<div class="text-gray-500 text-sm">No replies yet</div>';
            
            postElement.appendChild(repliesContainer);
        }
        
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

// Load community stats
async function loadCommunityStats() {
    try {
        const postsRef = database.ref('communityPosts');
        const snapshot = await postsRef.once('value');
        
        let totalPosts = 0;
        const activeUsers = new Set();
        
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const post = childSnapshot.val();
                if (post && post.status === 'approved') {
                    totalPosts++;
                    if (post.userId) {
                        activeUsers.add(post.userId);
                    }
                }
            });
        }
        
        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('activeUsers').textContent = activeUsers.size;
        
    } catch (error) {
        console.error('Error loading community stats:', error);
        document.getElementById('totalPosts').textContent = '0';
        document.getElementById('activeUsers').textContent = '0';
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 
                   type === 'info' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                   'bg-red-100 text-red-800 border-red-200';
    
    messageDiv.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg border ${bgColor}`;
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-triangle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Start streak tracking
function startStreakTracking() {
    streakTimer = setTimeout(async () => {
        if (!streakCounted && currentUser) {
            await updateDayStreak();
            streakCounted = true;
        }
    }, 20000);
}

// Update day streak
async function updateDayStreak() {
    try {
        const today = new Date().toDateString();
        const statsRef = database.ref(`userStats/${currentUser.userId}`);
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
            lastStreakDate: today,
            lastActivity: Date.now()
        });
        
    } catch (error) {
        console.error('Error updating streak:', error);
    }
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

// Start session tracking
function startSessionTracking() {
    if (currentUser) {
        trackPageSession(currentUser.userId, 'community');
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

// Get user level from XP
function getUserLevel(xp) {
    for (const levelData of LEVEL_SYSTEM) {
        if (xp >= levelData.min && xp <= levelData.max) {
            return { name: `Level ${levelData.level}`, ...levelData };
        }
    }
    return { name: 'Level 1', ...LEVEL_SYSTEM[0] };
}

// Load user stats for specific post
async function loadUserStatsForPost(userId, postId) {
    try {
        const statsRef = database.ref(`userStats/${userId}`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        
        const totalXP = stats.xp || 0;
        const level = getUserLevel(totalXP);
        const streak = stats.streak || 0;
        
        const userStats = {
            totalXP,
            level,
            streak
        };
        
        updateUserDisplayForPost(postId, userStats);
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Load user stats (for profile modal)
async function loadUserStats(userId) {
    try {
        const statsRef = database.ref(`userStats/${userId}`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        
        const totalXP = stats.xp || 0;
        const level = getUserLevel(totalXP);
        const streak = stats.streak || 0;
        
        const userStats = {
            totalXP,
            level,
            streak
        };
        
        userStatsCache[userId] = userStats;
        return userStats;
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        return {
            totalXP: 0,
            level: getUserLevel(0),
            streak: 0
        };
    }
}

// Update user display for specific post
function updateUserDisplayForPost(postId, stats) {
    const levelBadge = document.getElementById(`levelBadge-${postId}`);
    const streakValue = document.getElementById(`streakValue-${postId}`);
    
    if (levelBadge) {
        levelBadge.style.backgroundImage = `url('${stats.level.image}')`;
        levelBadge.style.backgroundSize = 'cover';
        levelBadge.style.backgroundColor = 'transparent';
        levelBadge.textContent = '';
        levelBadge.title = `${stats.level.name} (${stats.totalXP} XP)`;
    }
    
    if (streakValue) {
        streakValue.textContent = stats.streak;
    }
}

// Show user profile modal
async function showUserProfile(userId, userName) {
    const stats = await loadUserStats(userId);
    
    document.getElementById('profileUserName').textContent = userName;
    document.getElementById('profileTotalXP').textContent = stats.totalXP.toLocaleString();
    document.getElementById('profileLevelName').textContent = stats.level.name;
    document.getElementById('profileDailyStreak').textContent = stats.streak;
    
    const levelBadge = document.getElementById('profileLevelBadge');
    levelBadge.style.backgroundImage = `url('${stats.level.image}')`;
    levelBadge.style.backgroundSize = 'cover';
    levelBadge.style.backgroundColor = 'transparent';
    levelBadge.textContent = '';
    
    document.getElementById('userProfileModal').classList.remove('hidden');
}

// Close user profile modal
function closeUserProfile() {
    document.getElementById('userProfileModal').classList.add('hidden');
}

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (streakTimer) clearTimeout(streakTimer);
    
    // Record session time
    if (currentUser) {
        const sessionTime = Date.now() - sessionStartTime;
        try {
            const totalSessionRef = database.ref(`userStats/${currentUser.userId}/totalSessionTime`);
            const snapshot = await totalSessionRef.once('value');
            const currentTotal = snapshot.val() || 0;
            await totalSessionRef.set(currentTotal + sessionTime);
        } catch (error) {
            console.error('Error saving session time:', error);
        }
    }
});