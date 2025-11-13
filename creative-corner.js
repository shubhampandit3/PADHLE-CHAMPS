// Creative Corner JavaScript
const firebaseConfig = {
    apiKey: "AIzaSyCDZJeZeJPkuDUZ5Vf_-rsy0PQsx8tQw4k",
    authDomain: "quiz-app-10f81.firebaseapp.com",
    databaseURL: "https://quiz-app-10f81-default-rtdb.firebaseio.com",
    projectId: "quiz-app-10f81",
    storageBucket: "quiz-app-10f81.firebasestorage.app",
    messagingSenderId: "351578019731",
    appId: "1:351578019731:web:2055fe24498ca17908fa66"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let userData = null;
let allPosts = [];
let currentFilter = 'all';
let factsData = [];
let dailyFactsShown = 0;
let lastFactDate = null;

document.addEventListener('DOMContentLoaded', function() {
    userData = JSON.parse(localStorage.getItem('padhleChamps_user'));
    if (userData) {
        document.getElementById('username').textContent = userData.name.split(' ')[0];
        loadFacts();
        loadPosts();
        startFactBot();
    } else {
        alert('Please login first');
        window.location.href = 'login.html';
    }
});

// Load posts from Firebase
async function loadPosts() {
    try {
        const postsSnapshot = await database.ref('creativePosts').once('value');
        allPosts = [];
        
        postsSnapshot.forEach(childSnapshot => {
            const post = childSnapshot.val();
            post.id = childSnapshot.key;
            allPosts.push(post);
        });
        
        allPosts.sort((a, b) => b.createdAt - a.createdAt);
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Render posts based on current filter
function renderPosts() {
    const container = document.getElementById('postsContainer');
    const noPosts = document.getElementById('noPosts');
    
    const filteredPosts = currentFilter === 'all' ? 
        allPosts : 
        allPosts.filter(post => post.category === currentFilter);
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '';
        noPosts.classList.remove('hidden');
        return;
    }
    
    noPosts.classList.add('hidden');
    container.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
}

// Create post card HTML
function createPostCard(post) {
    const timeAgo = getTimeAgo(post.createdAt);
    const categoryClass = `category-${post.category}`;
    
    return `
        <div class="post-card rounded-2xl p-6 cursor-pointer" onclick="showPostDetail('${post.id}')">
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
            
            <div class="flex items-center justify-between mb-3">
                <span class="category-badge ${categoryClass}">
                    <i class="fas fa-${getCategoryIcon(post.category)} mr-1"></i>
                    ${post.category}
                </span>
                <span class="text-sm text-gray-500">${timeAgo}</span>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mb-2 gradient-text">${post.title}</h3>
            <p class="text-gray-600 post-content mb-4">${post.content}</p>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button onclick="toggleLike(event, '${post.id}')" class="like-btn flex items-center space-x-1 text-gray-500 hover:text-red-500">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <div class="flex items-center space-x-1 text-gray-500">
                        <i class="fas fa-comment"></i>
                        <span>${getTotalFeedbackCount(post)}</span>
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    <i class="fas fa-user mr-1"></i>
                    ${post.authorName}
                </div>
            </div>
        </div>
    `;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        poem: 'feather-alt',
        art: 'palette',
        essay: 'file-alt',
        project: 'lightbulb',
        joke: 'laugh',
        fact: 'brain'
    };
    return icons[category] || 'star';
}

// Get total feedback count (AI + Student)
function getTotalFeedbackCount(post) {
    const aiFeedbacks = post.feedbacks ? Object.keys(post.feedbacks).length : 0;
    const studentFeedbacks = post.studentFeedbacks ? Object.keys(post.studentFeedbacks).length : 0;
    return aiFeedbacks + studentFeedbacks;
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Filter posts
function filterPosts(category) {
    currentFilter = category;
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('bg-white', 'text-gray-700', 'border');
    });
    
    event.target.classList.add('active');
    event.target.classList.remove('bg-white', 'text-gray-700', 'border');
    
    renderPosts();
}

// Show create modal
function showCreateModal() {
    document.getElementById('createModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Hide create modal
function hideCreateModal() {
    document.getElementById('createModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('createForm').reset();
}

// Handle form submission
document.getElementById('createForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    
    if (!title || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sharing...';
        submitBtn.disabled = true;
        
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }
        
        const post = {
            title,
            content,
            category,
            imageUrl,
            authorId: userData.userId,
            authorName: userData.name,
            createdAt: Date.now(),
            likes: 0,
            likedBy: {},
            feedbacks: {},
            studentFeedbacks: {}
        };
        
        await database.ref('creativePosts').push(post);
        
        // Award 3 XP for posting creative content
        await awardCreativeXP(userData.userId, 3);
        
        hideCreateModal();
        loadPosts();
        
        // Show success message with XP notification
        showNotification('Your creation has been shared successfully! +3 XP earned!', 'success');
        showXPNotification(3);
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error sharing your creation. Please try again.');
    }
});

// Upload image (simplified - in real app would use Firebase Storage)
async function uploadImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// Toggle like
async function toggleLike(event, postId) {
    event.stopPropagation();
    
    try {
        const postRef = database.ref(`creativePosts/${postId}`);
        const snapshot = await postRef.once('value');
        const post = snapshot.val();
        
        const likedBy = post.likedBy || {};
        const isLiked = likedBy[userData.userId];
        
        if (isLiked) {
            delete likedBy[userData.userId];
            post.likes = Math.max(0, (post.likes || 0) - 1);
        } else {
            likedBy[userData.userId] = true;
            post.likes = (post.likes || 0) + 1;
        }
        
        await postRef.update({
            likes: post.likes,
            likedBy: likedBy
        });
        
        loadPosts();
        
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

// Show post detail
async function showPostDetail(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const modal = document.getElementById('postModal');
    const content = document.getElementById('postModalContent');
    
    content.innerHTML = `
        <div class="flex justify-between items-center mb-4 sm:mb-6">
            <h2 class="text-xl sm:text-2xl font-bold gradient-text pr-4">${post.title}</h2>
            <button onclick="hidePostModal()" class="text-gray-500 hover:text-gray-700 flex-shrink-0">
                <i class="fas fa-times text-lg sm:text-xl"></i>
            </button>
        </div>
        
        <div class="mb-4 sm:mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                <span class="category-badge category-${post.category}">
                    <i class="fas fa-${getCategoryIcon(post.category)} mr-1"></i>
                    ${post.category}
                </span>
                <div class="text-xs sm:text-sm text-gray-500">
                    By ${post.authorName} • ${getTimeAgo(post.createdAt)}
                </div>
            </div>
            
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 sm:h-64 object-cover rounded-lg mb-3 sm:mb-4">` : ''}
            
            <div class="prose max-w-none">
                <p class="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">${post.content}</p>
            </div>
        </div>
        
        <div class="border-t pt-4 sm:pt-6">
            <div class="mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3">Feedback & Comments</h3>
                
                <!-- Student Feedback Form -->
                <div class="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                    <textarea id="studentFeedback-${postId}" rows="3" class="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base resize-none" placeholder="Share your thoughts and feedback..."></textarea>
                    <div class="flex justify-between items-center mt-3">
                        <button onclick="generateFeedback('${postId}')" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            <i class="fas fa-robot mr-1"></i>AI Feedback
                        </button>
                        <button onclick="submitStudentFeedback('${postId}')" class="bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base">
                            <i class="fas fa-comment mr-1"></i>Post Feedback
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="feedbackContainer-${postId}">
                ${renderAllFeedbacks(post.feedbacks, post.studentFeedbacks)}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Hide post modal
function hidePostModal() {
    document.getElementById('postModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Render all feedbacks (AI + Student)
function renderAllFeedbacks(aiFeedbacks, studentFeedbacks) {
    const allFeedbacks = [];
    
    // Add AI feedbacks
    if (aiFeedbacks) {
        Object.values(aiFeedbacks).forEach(feedback => {
            allFeedbacks.push({
                ...feedback,
                type: 'ai',
                sortTime: feedback.createdAt
            });
        });
    }
    
    // Add student feedbacks
    if (studentFeedbacks) {
        Object.values(studentFeedbacks).forEach(feedback => {
            allFeedbacks.push({
                ...feedback,
                type: 'student',
                sortTime: feedback.createdAt
            });
        });
    }
    
    if (allFeedbacks.length === 0) {
        return '<p class="text-gray-500 italic text-sm sm:text-base">No feedback yet. Be the first to share your thoughts!</p>';
    }
    
    // Sort by time (newest first)
    allFeedbacks.sort((a, b) => b.sortTime - a.sortTime);
    
    return allFeedbacks.map(feedback => {
        if (feedback.type === 'ai') {
            return `
                <div class="ai-feedback mb-4">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-robot text-blue-600 mr-2"></i>
                        <span class="font-semibold text-blue-800 text-sm sm:text-base">AI Assistant</span>
                        <span class="text-xs sm:text-sm text-gray-500 ml-auto">${getTimeAgo(feedback.createdAt)}</span>
                    </div>
                    <p class="text-gray-700 text-sm sm:text-base">${feedback.content}</p>
                </div>
            `;
        } else {
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-user-circle text-purple-600 mr-2"></i>
                        <span class="font-semibold text-purple-800 text-sm sm:text-base">${feedback.authorName}</span>
                        <span class="text-xs sm:text-sm text-gray-500 ml-auto">${getTimeAgo(feedback.createdAt)}</span>
                    </div>
                    <p class="text-gray-700 text-sm sm:text-base">${feedback.content}</p>
                </div>
            `;
        }
    }).join('');
}

// Generate AI feedback
async function generateFeedback(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const container = document.getElementById(`feedbackContainer-${postId}`);
    
    // Show loading
    container.innerHTML = `
        <div class="ai-feedback">
            <div class="feedback-loading">
                <i class="fas fa-robot text-blue-600 mr-2"></i>
                AI is analyzing your work...
            </div>
        </div>
    `;
    
    try {
        // Simulate AI feedback generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const feedback = generateAIFeedback(post);
        
        const feedbackData = {
            content: feedback,
            createdAt: Date.now(),
            postId: postId
        };
        
        // Save feedback to Firebase
        await database.ref(`creativePosts/${postId}/feedbacks`).push(feedbackData);
        
        // Reload post data
        loadPosts();
        
        // Reload the entire feedback section
        const updatedPost = allPosts.find(p => p.id === postId);
        if (updatedPost) {
            container.innerHTML = renderAllFeedbacks(updatedPost.feedbacks, updatedPost.studentFeedbacks);
        }
        
    } catch (error) {
        console.error('Error generating feedback:', error);
        container.innerHTML = '<p class="text-red-500">Error generating feedback. Please try again.</p>';
    }
}

// Generate AI feedback based on category and content
function generateAIFeedback(post) {
    const feedbacks = {
        poem: [
            "Beautiful imagery and emotional depth! Your use of metaphors creates vivid pictures. Consider experimenting with different rhyme schemes to add variety.",
            "Lovely rhythm and flow! The emotions come through clearly. Try incorporating more sensory details to make the reader feel present in your poem.",
            "Great word choice and structure! Your poem has a strong voice. Consider adding more concrete imagery to balance the abstract concepts."
        ],
        art: [
            "Wonderful creativity and artistic vision! Your composition shows great understanding of visual elements. Consider exploring different color palettes to enhance the mood.",
            "Impressive technique and style! The details show careful attention. Try experimenting with different perspectives or lighting to add depth.",
            "Beautiful artistic expression! Your work shows strong creative instincts. Consider adding more contrast to make certain elements stand out."
        ],
        essay: [
            "Well-structured argument with clear points! Your writing flows logically. Consider adding more specific examples to strengthen your arguments.",
            "Thoughtful analysis and good organization! Your ideas are well-presented. Try incorporating more varied sentence structures for better rhythm.",
            "Strong thesis and supporting evidence! Your reasoning is sound. Consider addressing potential counterarguments to make your essay more comprehensive."
        ],
        project: [
            "Innovative approach and creative problem-solving! Your project shows great planning. Consider documenting your process more thoroughly for others to learn from.",
            "Excellent execution and attention to detail! Your project demonstrates strong skills. Try exploring additional features or improvements for future iterations.",
            "Impressive scope and implementation! Your work shows dedication. Consider creating a presentation or tutorial to share your knowledge with others."
        ]
    };
    
    const categoryFeedbacks = feedbacks[post.category] || feedbacks.essay;
    return categoryFeedbacks[Math.floor(Math.random() * categoryFeedbacks.length)];
}

// Submit student feedback
async function submitStudentFeedback(postId) {
    const textarea = document.getElementById(`studentFeedback-${postId}`);
    const content = textarea.value.trim();
    
    if (!content) {
        alert('Please write some feedback before posting.');
        return;
    }
    
    if (content.length < 10) {
        alert('Please write at least 10 characters for meaningful feedback.');
        return;
    }
    
    try {
        const feedbackData = {
            content: content,
            authorId: userData.userId,
            authorName: userData.name,
            createdAt: Date.now()
        };
        
        // Save to Firebase
        await database.ref(`creativePosts/${postId}/studentFeedbacks`).push(feedbackData);
        
        // Clear textarea
        textarea.value = '';
        
        // Reload posts and update modal
        await loadPosts();
        const updatedPost = allPosts.find(p => p.id === postId);
        if (updatedPost) {
            const container = document.getElementById(`feedbackContainer-${postId}`);
            container.innerHTML = renderAllFeedbacks(updatedPost.feedbacks, updatedPost.studentFeedbacks);
        }
        
        showNotification('Your feedback has been posted!', 'success');
        
    } catch (error) {
        console.error('Error posting feedback:', error);
        alert('Error posting feedback. Please try again.');
    }
}

// Load facts from facts.txt
async function loadFacts() {
    try {
        const response = await fetch('facts.txt');
        const text = await response.text();
        factsData = text.split('\n').filter(fact => fact.trim().length > 0);
    } catch (error) {
        console.error('Error loading facts:', error);
        factsData = ['Did you know? Learning new things every day keeps your brain healthy!'];
    }
}

// Start fact bot (shares 5 facts per day)
function startFactBot() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastFactDate');
    const storedCount = parseInt(localStorage.getItem('dailyFactsShown') || '0');
    
    if (storedDate !== today) {
        // New day, reset counter
        dailyFactsShown = 0;
        lastFactDate = today;
        localStorage.setItem('lastFactDate', today);
        localStorage.setItem('dailyFactsShown', '0');
    } else {
        dailyFactsShown = storedCount;
        lastFactDate = storedDate;
    }
    
    // Start sharing facts after 1 minute, then every 1 minute
    if (dailyFactsShown < 5) {
        setTimeout(() => {
            shareRandomFact();
            
            // Continue sharing facts every 1 minute until 5 facts are shared
            const factInterval = setInterval(() => {
                if (dailyFactsShown >= 5) {
                    clearInterval(factInterval);
                    return;
                }
                shareRandomFact();
            }, 60000); // 1 minute
        }, 60000); // 1 minute initial delay
    }
}

// Share a random fact as bot post
async function shareRandomFact() {
    if (dailyFactsShown >= 5 || factsData.length === 0) return;
    
    try {
        const randomFact = factsData[Math.floor(Math.random() * factsData.length)];
        
        const factPost = {
            title: `Daily Fact #${dailyFactsShown + 1}`,
            content: randomFact,
            category: 'fact',
            imageUrl: null,
            authorId: 'fact-bot',
            authorName: 'Fact Bot 🤖',
            createdAt: Date.now(),
            likes: 0,
            likedBy: {},
            feedbacks: {},
            studentFeedbacks: {}
        };
        
        await database.ref('creativePosts').push(factPost);
        
        dailyFactsShown++;
        localStorage.setItem('dailyFactsShown', dailyFactsShown.toString());
        
        // Reload posts to show new fact
        loadPosts();
        
        // Show notification
        showNotification(`🧠 New fact shared by Fact Bot!`, 'info');
        
    } catch (error) {
        console.error('Error sharing fact:', error);
    }
}

// Award XP for creative posts
async function awardCreativeXP(userId, xpAmount) {
    try {
        const statsRef = database.ref(`userStats/${userId}`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || { xp: 0 };
        
        const newXP = (stats.xp || 0) + xpAmount;
        await statsRef.update({ xp: newXP });
        
        // Update localStorage user data
        const userData = JSON.parse(localStorage.getItem('padhleChamps_user') || '{}');
        userData.xp = newXP;
        localStorage.setItem('padhleChamps_user', JSON.stringify(userData));
        
        console.log(`Awarded ${xpAmount} XP for creative post. Total: ${newXP}`);
        
    } catch (error) {
        console.error('Error awarding creative XP:', error);
    }
}

// Show XP notification
function showXPNotification(xpAmount) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg transform transition-all duration-300';
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-star text-yellow-300"></i>
            </div>
            <div>
                <div class="font-bold">+${xpAmount} XP Earned!</div>
                <div class="text-sm opacity-90">Creative post reward</div>
            </div>
        </div>
    `;
    
    // Add entrance animation
    notification.style.transform = 'translateX(100%)';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove with exit animation
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : type === 'info' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'info' ? 'info' : 'robot'} mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}