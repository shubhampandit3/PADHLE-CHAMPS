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

// Global variable for double tap state
let isDoubleTapping = false;

// Chapter video data
const chapterVideos = {
    'Light': [
        { id: 'Ej0ANS9YGxg', title: 'What is Light?', duration: '0:00' },
        { id: '0V401J7QlOE', title: 'The Properties of Light', duration: '0:00' },
        { id: 'RdQc1qNJxAg', title: 'How Do Shadows Form?', duration: '0:00' }
    ],
    'Food We Eat': [
        { id: 'rmVGrhSZth0', title: 'What is Nutrition?', duration: '0:00' },
        { id: 'oDpIVIeFDGI', title: 'How to Eat a Balanced Diet: The Role of Fats and Proteins in Growth', duration: '0:00' }
    ],
    'Friction As A Force': [
        { id: 'jnli56xbbPA', title: 'Complete Chapter on Friction Force in One Video', duration: '0:00' }
    ],
    'Digestive and Excretory System': [
        { id: 'X35Cy4H638Y', title: 'How Your Body Digests Food and Removes Waste', duration: '0:00' }
    ],
    'Teeth': [
        { id: 'u9chVsR4dCM', title: 'Milk Teeth vs. Permanent Teeth: Sets of Teeth and Their Roles', duration: '0:00' },
        { id: '0iVoq_RNYZo', title: 'Anatomy of a Tooth: Crown, Enamel, and Pulp Explained', duration: '0:00' }
    ],
    'Push and Pull': [
        { id: 'igDGTlB3_oE', title: 'The Effects of Force: How Push and Pull Change an Object', duration: '0:00' }
    ],
    'The Warmth of a Candle': [
        { id: 'vsURGvzFMVw', title: 'The Warmth of a Candle: A Story About Wisdom, Wit, and Perception', duration: '0:00' }
    ],
    'My Shadow': [
        { id: 'ZIfGgklOH28', title: 'Why is My Shadow Lazy?', duration: '0:00' }
    ],
    'Evolution of Human Beings': [
        { id: 'FeDrz9iO4K4', title: 'Who Were the First Humans?', duration: '0:00' },
        { id: '3d1_ci7AaPA', title: 'The Discovery of Fire and Stone Tools', duration: '0:00' },
        { id: 'ilLJqtsTpQw', title: 'From Hunting to Domestication: The Transition of the Mesolithic Era', duration: '0:00' }
    ],
    'Circulatory System': [
        { id: 'A5UjnefArVc', title: 'The Circulatory System Part 1: Introduction and The Structure of the Heart', duration: '0:00' },
        { id: 'jRmbmpOgGzA', title: 'The Journey of Blood: Deoxygenated vs. Oxygenated Blood Flow', duration: '0:00' },
        { id: '7ZR5QTvIltw', title: 'Healthy Heart Habits: Foods to Avoid and Best Exercises for Circulation', duration: '0:00' }
    ],
    'The Rise of Nationalism in Europe': [
        { id: 'hjYOLaSej7I', title: 'Rise of Nationalism in Europe: Complete Chapter Summary', duration: '0:00' }
    ],
    'A Letter to God': [
        { id: 'Bth5DTmj5pU', title: 'Lencho\'s Unwavering Faith: A Letter to God and the Irony of Kindness', duration: '0:00' }
    ]
};

let player;
let currentChapter = '';
let currentVideoIndex = 0;
let userLikes = {};
let viewTimer = null;
let hasViewedCurrentVideo = false;

// Navbar scroll functionality
let lastScrollTop = 0;

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

// Touch gesture functionality
function initializeTouchGestures() {
    const videoPlayer = document.querySelector('.video-player');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');
    
    let touchStartTime = 0;
    let touchStartX = 0;
    let isHolding = false;
    let holdTimeout;
    let originalSpeed = 1;
    
    // Double tap detection
    let lastTap = 0;
    
    videoPlayer.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        
        // Hold detection
        holdTimeout = setTimeout(() => {
            if (player && player.setPlaybackRate) {
                originalSpeed = player.getPlaybackRate();
                player.setPlaybackRate(2);
                isHolding = true;
            }
        }, 500);
    }, { passive: true });
    
    videoPlayer.addEventListener('touchend', (e) => {
        clearTimeout(holdTimeout);
        
        if (isHolding) {
            player.setPlaybackRate(originalSpeed);
            isHolding = false;
            return;
        }
        
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        if (touchDuration < 300) {
            const currentTime = touchEndTime;
            const timeSinceLastTap = currentTime - lastTap;
            
            if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
                // Double tap detected
                isDoubleTapping = true;
                e.preventDefault();
                e.stopPropagation();
                
                const rect = videoPlayer.getBoundingClientRect();
                const tapX = touchStartX - rect.left;
                const playerWidth = rect.width;
                
                if (tapX < playerWidth / 2) {
                    // Left side - rewind
                    rewindVideo(10);
                    showTapFeedback('left');
                } else {
                    // Right side - forward
                    forwardVideo(10);
                    showTapFeedback('right');
                }
                
                setTimeout(() => {
                    isDoubleTapping = false;
                }, 600);
            }
            lastTap = currentTime;
        }
    });
    
    // Desktop double click
    videoPlayer.addEventListener('dblclick', (e) => {
        const rect = videoPlayer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const playerWidth = rect.width;
        
        if (clickX < playerWidth / 2) {
            rewindVideo(10);
            showTapFeedback('left');
        } else {
            forwardVideo(10);
            showTapFeedback('right');
        }
    });
    
    // Desktop hold (mousedown/mouseup)
    let mouseHoldTimeout;
    videoPlayer.addEventListener('mousedown', () => {
        mouseHoldTimeout = setTimeout(() => {
            if (player && player.setPlaybackRate) {
                originalSpeed = player.getPlaybackRate();
                player.setPlaybackRate(2);
                isHolding = true;
            }
        }, 500);
    });
    
    videoPlayer.addEventListener('mouseup', () => {
        clearTimeout(mouseHoldTimeout);
        if (isHolding) {
            player.setPlaybackRate(originalSpeed);
            isHolding = false;
        }
    });
}

function rewindVideo(seconds) {
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        player.seekTo(Math.max(0, currentTime - seconds));
    }
}

function forwardVideo(seconds) {
    if (player && player.getCurrentTime && player.getDuration) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        player.seekTo(Math.min(duration, currentTime + seconds));
    }
}

function showTapFeedback(side) {
    const element = side === 'left' ? document.getElementById('tapLeft') : document.getElementById('tapRight');
    element.classList.add('active');
    setTimeout(() => {
        element.classList.remove('active');
    }, 500);
}

// View tracking functions
function startViewTimer() {
    console.log('Starting view timer, hasViewedCurrentVideo:', hasViewedCurrentVideo);
    if (!hasViewedCurrentVideo) {
        viewTimer = setTimeout(() => {
            console.log('View timer triggered after 2 seconds');
            incrementViewCount();
            hasViewedCurrentVideo = true;
        }, 2000); // 2 seconds
    }
}

function clearViewTimer() {
    if (viewTimer) {
        clearTimeout(viewTimer);
        viewTimer = null;
    }
}

async function incrementViewCount() {
    console.log('incrementViewCount called');
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) {
        console.log('No user data found');
        return;
    }
    
    const user = JSON.parse(userData);
    const videos = chapterVideos[currentChapter];
    const currentVideo = videos[currentVideoIndex];
    const videoId = currentVideo.id;
    
    console.log('Video ID:', videoId, 'User:', user.userId);
    
    try {
        // Check if user already viewed this video
        const userViewRef = database.ref(`ott-vid-views/users/${user.userId}/${videoId}`);
        const viewSnapshot = await userViewRef.once('value');
        
        console.log('User already viewed:', viewSnapshot.exists());
        
        if (!viewSnapshot.exists()) {
            // Mark user as viewed with timestamp
            await userViewRef.set({
                viewedAt: Date.now(),
                chapter: currentChapter,
                videoTitle: currentVideo.title,
                videoIndex: currentVideoIndex
            });
            console.log('Marked user as viewed');
            
            // Increment total view count for this video
            const viewsRef = database.ref(`ott-vid-views/stats/${videoId}`);
            await viewsRef.transaction(currentData => {
                const newCount = (currentData?.count || 0) + 1;
                console.log('Incrementing views from', currentData?.count || 0, 'to', newCount);
                return {
                    count: newCount,
                    lastUpdated: Date.now(),
                    videoTitle: currentVideo.title,
                    chapter: currentChapter
                };
            });
            
            updateViewCount();
        }
    } catch (error) {
        console.error('Error updating view count:', error);
    }
}

async function updateViewCount() {
    try {
        const videos = chapterVideos[currentChapter];
        const videoId = videos[currentVideoIndex].id;
        console.log('Loading view count for video ID:', videoId);
        
        const viewsRef = database.ref(`ott-vid-views/stats/${videoId}`);
        const snapshot = await viewsRef.once('value');
        const viewData = snapshot.val();
        const views = viewData?.count || 0;
        
        console.log('Current views:', views);
        document.getElementById('videoViews').textContent = `${views} view${views !== 1 ? 's' : ''}`;
    } catch (error) {
        console.error('Error loading view count:', error);
        document.getElementById('videoViews').textContent = '0 views';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentChapter = urlParams.get('chapter') || 'Light';
    const videoIndex = urlParams.get('video');
    const startTime = urlParams.get('time');
    
    if (videoIndex) {
        currentVideoIndex = parseInt(videoIndex);
    }
    
    loadChapterData();
    loadUserData();
    initializeNavbarScroll();
    initializeTouchGestures();
    
    // Set start time if provided
    if (startTime) {
        window.resumeTime = parseFloat(startTime);
    }
});

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    const videos = chapterVideos[currentChapter];
    if (videos && videos.length > 0) {
        player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: videos[0].id,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'controls': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerReady(event) {
    updateVideoInfo();
    fetchAllDurations();
    loadPlaylist();
    initializeCustomControls();
    updateLikeCounts(); // Load like counts on page load
    updateViewCount(); // Load view count on page load
    
    // Resume from saved time and video if available
    if (window.resumeTime && currentVideoIndex !== 0) {
        setTimeout(() => {
            playVideo(currentVideoIndex);
            setTimeout(() => {
                player.seekTo(window.resumeTime);
                player.pauseVideo();
                window.resumeTime = null;
            }, 1000);
        }, 1000);
    } else if (window.resumeTime) {
        setTimeout(() => {
            player.seekTo(window.resumeTime);
            player.pauseVideo();
            window.resumeTime = null;
        }, 1000);
    }
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        showNextVideoCountdown();
    }
    
    // Update play/pause button based on player state
    if (event.data == YT.PlayerState.PLAYING) {
        document.getElementById('playIcon').style.display = 'none';
        document.getElementById('pauseIcon').style.display = 'block';
        updateProgress();
        updateVideoInfo();
        startViewTimer();
    } else if (event.data == YT.PlayerState.PAUSED) {
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
        clearViewTimer();
    }
}

// Load chapter data
function loadChapterData() {
    document.title = `${currentChapter} - Brainstream Player`;
    document.getElementById('videoTitle').textContent = currentChapter;
}

// Load user data
function loadUserData() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (userData) {
        const user = JSON.parse(userData);
        loadUserLikes(user.userId);
        loadComments();
    }
}

// Load user likes/dislikes
async function loadUserLikes(userId) {
    try {
        const likesRef = database.ref(`userLikes/${userId}/${currentChapter}`);
        const snapshot = await likesRef.once('value');
        userLikes = snapshot.val() || {};
        updateLikeButtons();
    } catch (error) {
        console.error('Error loading likes:', error);
    }
}

// Fetch all video durations using player
function fetchAllDurations() {
    // Skip API call, use player-based duration fetching only
    console.log('Using player-based duration fetching');
}

// Format YouTube duration
function formatYTDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

// Update video info
function updateVideoInfo() {
    const videos = chapterVideos[currentChapter];
    if (videos && videos[currentVideoIndex]) {
        const video = videos[currentVideoIndex];
        document.getElementById('videoTitle').textContent = video.title;
        
        // Get duration from player if not fetched from API
        if (player && player.getDuration) {
            const duration = player.getDuration();
            if (duration > 0) {
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                video.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                document.getElementById('videoDuration').textContent = video.duration;
            }
        } else {
            document.getElementById('videoDuration').textContent = video.duration;
        }
    }
}

// Load playlist
function loadPlaylist() {
    const playlist = document.getElementById('playlist');
    const videos = chapterVideos[currentChapter];
    
    playlist.innerHTML = videos.map((video, index) => `
        <div class="playlist-item ${index === currentVideoIndex ? 'active' : ''}" onclick="playVideo(${index})">
            <div class="playlist-thumbnail" style="background-image: url('https://img.youtube.com/vi/${video.id}/mqdefault.jpg');">
                ${index === currentVideoIndex ? '<div class="playing-bars"><span></span><span></span><span></span></div>' : ''}
            </div>
            <div class="playlist-info">
                <h4>${video.title}</h4>
                <p id="duration-${index}" class="${index === currentVideoIndex ? 'playing-duration' : ''}">
                    ${index === currentVideoIndex ? '<span class="playing-bars-inline"><span></span><span></span><span></span></span> Playing • ' : ''}
                    ${video.duration === '0:00' ? 'Loading...' : video.duration}
                </p>
            </div>
        </div>
    `).join('');
}

// Play specific video
function playVideo(index) {
    currentVideoIndex = index;
    const videos = chapterVideos[currentChapter];
    
    if (player && videos[index]) {
        // Reset view tracking for new video
        clearViewTimer();
        hasViewedCurrentVideo = false;
        
        player.cueVideoById(videos[index].id); // Load video but don't start playing
        updateVideoInfo();
        updatePlaylistActive();
        updateLikeCounts(); // Update like counts for new video
        updateLikeButtons(); // Update like button states
        updateViewCount(); // Update view count for new video
        
        // Update play/pause button to show play icon
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
        
        // Update duration for this video when it loads
        setTimeout(() => {
            if (player.getDuration && player.getDuration() > 0) {
                const duration = player.getDuration();
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                videos[index].duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                const durationElement = document.getElementById(`duration-${index}`);
                if (durationElement) {
                    durationElement.textContent = videos[index].duration;
                }
            }
        }, 2000);
    }
}

// Play next video
function playNextVideo() {
    const videos = chapterVideos[currentChapter];
    if (currentVideoIndex < videos.length - 1) {
        playVideo(currentVideoIndex + 1);
    }
}

// Update playlist active state
function updatePlaylistActive() {
    // Reload entire playlist to update playing indicators
    loadPlaylist();
}

// Like/Dislike functionality
document.getElementById('likeBtn').addEventListener('click', function() {
    toggleLike('like');
});

document.getElementById('dislikeBtn').addEventListener('click', function() {
    toggleLike('dislike');
});

async function toggleLike(type) {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const videoKey = `${currentChapter}_${currentVideoIndex}`;
    
    try {
        const userLikesRef = database.ref(`userLikes/${user.userId}/${currentChapter}/${videoKey}`);
        const videoStatsRef = database.ref(`videoStats/${currentChapter}/${videoKey}`);
        const currentLike = userLikes[videoKey];
        
        // Update counts in database
        if (currentLike === type) {
            // Remove like/dislike
            await userLikesRef.remove();
            delete userLikes[videoKey];
            
            // Decrease count
            const countRef = videoStatsRef.child(type === 'like' ? 'likes' : 'dislikes');
            await countRef.transaction(count => Math.max(0, (count || 0) - 1));
        } else {
            // Remove previous like/dislike if exists
            if (currentLike) {
                const prevCountRef = videoStatsRef.child(currentLike === 'like' ? 'likes' : 'dislikes');
                await prevCountRef.transaction(count => Math.max(0, (count || 0) - 1));
            }
            
            // Set new like/dislike
            await userLikesRef.set(type);
            userLikes[videoKey] = type;
            
            // Increase count
            const countRef = videoStatsRef.child(type === 'like' ? 'likes' : 'dislikes');
            await countRef.transaction(count => (count || 0) + 1);
        }
        
        updateLikeButtons();
        updateLikeCounts();
    } catch (error) {
        console.error('Error updating like:', error);
    }
}

// Update like buttons
function updateLikeButtons() {
    const videoKey = `${currentChapter}_${currentVideoIndex}`;
    const currentLike = userLikes[videoKey];
    
    document.getElementById('likeBtn').classList.toggle('liked', currentLike === 'like');
    document.getElementById('dislikeBtn').classList.toggle('disliked', currentLike === 'dislike');
}

// Update like counts
async function updateLikeCounts() {
    try {
        const videoKey = `${currentChapter}_${currentVideoIndex}`;
        const likesRef = database.ref(`videoStats/${currentChapter}/${videoKey}/likes`);
        const dislikesRef = database.ref(`videoStats/${currentChapter}/${videoKey}/dislikes`);
        
        const [likesSnapshot, dislikesSnapshot] = await Promise.all([
            likesRef.once('value'),
            dislikesRef.once('value')
        ]);
        
        document.getElementById('likeCount').textContent = likesSnapshot.val() || 0;
        document.getElementById('dislikeCount').textContent = dislikesSnapshot.val() || 0;
    } catch (error) {
        console.error('Error loading like counts:', error);
    }
}

// Comments functionality
async function addComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;
    
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    try {
        const commentsRef = database.ref(`comments/${currentChapter}`);
        await commentsRef.push({
            text: commentText,
            author: user.name,
            userId: user.userId,
            timestamp: Date.now()
        });
        
        commentInput.value = '';
        loadComments();
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

// Load comments
async function loadComments() {
    try {
        const commentsRef = database.ref(`comments/${currentChapter}`);
        const snapshot = await commentsRef.orderByChild('timestamp').once('value');
        const comments = [];
        
        snapshot.forEach(child => {
            comments.unshift({
                id: child.key,
                ...child.val()
            });
        });
        
        displayComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Display comments
function displayComments(comments) {
    const commentsContainer = document.getElementById('comments');
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="text-center text-gray-500">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${formatTimeAgo(comment.timestamp)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-actions">
                <button class="heart-btn" onclick="toggleHeart('${comment.id}')" id="heart-${comment.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span id="hearts-${comment.id}">${comment.hearts || 0}</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Update progress
async function updateProgress() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const videoKey = `${currentChapter}_${currentVideoIndex}`;
    
    try {
        if (player && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const percentage = (currentTime / duration) * 100;
            
            const progressRef = database.ref(`userProgress/${user.userId}/${currentChapter}/${videoKey}`);
            await progressRef.set({
                currentTime: currentTime,
                duration: duration,
                percentage: percentage,
                completed: percentage >= 90,
                timestamp: Date.now(),
                videoTitle: chapterVideos[currentChapter][currentVideoIndex].title,
                chapterName: currentChapter
            });
        }
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

// Format time ago
function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return `${Math.floor(diff / 604800000)}w ago`;
}

// Toggle heart on comment
async function toggleHeart(commentId) {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    try {
        const heartRef = database.ref(`commentHearts/${currentChapter}/${commentId}/${user.userId}`);
        const snapshot = await heartRef.once('value');
        
        if (snapshot.exists()) {
            // Remove heart
            await heartRef.remove();
            document.getElementById(`heart-${commentId}`).classList.remove('hearted');
        } else {
            // Add heart
            await heartRef.set(true);
            document.getElementById(`heart-${commentId}`).classList.add('hearted');
        }
        
        // Update heart count
        updateHeartCount(commentId);
    } catch (error) {
        console.error('Error toggling heart:', error);
    }
}

// Update heart count
async function updateHeartCount(commentId) {
    try {
        const heartsRef = database.ref(`commentHearts/${currentChapter}/${commentId}`);
        const snapshot = await heartsRef.once('value');
        const heartCount = snapshot.numChildren();
        
        document.getElementById(`hearts-${commentId}`).textContent = heartCount;
    } catch (error) {
        console.error('Error updating heart count:', error);
    }
}

function goBack() {
    window.location.href = 'brainstream.html';
}

// Initialize custom controls
function initializeCustomControls() {
    const playPauseBtn = document.getElementById('playPause');
    const rewind10Btn = document.getElementById('rewind10');
    const forward10Btn = document.getElementById('forward10');
    const seekBar = document.getElementById('seekBar');
    const speedControl = document.getElementById('speedControl');
    const qualityControl = document.getElementById('qualityControl');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const videoControls = document.getElementById('videoControls');
    const videoPlayer = document.querySelector('.video-player');
    
    let controlsTimeout;
    
    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            document.getElementById('playIcon').style.display = 'block';
            document.getElementById('pauseIcon').style.display = 'none';
        } else {
            player.playVideo();
            document.getElementById('playIcon').style.display = 'none';
            document.getElementById('pauseIcon').style.display = 'block';
        }
    });
    
    // Rewind 10 seconds
    rewind10Btn.addEventListener('click', () => {
        const currentTime = player.getCurrentTime();
        player.seekTo(Math.max(0, currentTime - 10));
    });
    
    // Forward 10 seconds
    forward10Btn.addEventListener('click', () => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        player.seekTo(Math.min(duration, currentTime + 10));
    });
    
    // Seek bar
    seekBar.addEventListener('input', () => {
        const duration = player.getDuration();
        const seekTime = (seekBar.value / 100) * duration;
        player.seekTo(seekTime);
    });
    
    // Speed control
    speedControl.addEventListener('change', () => {
        player.setPlaybackRate(parseFloat(speedControl.value));
    });
    
    // Quality control
    qualityControl.addEventListener('change', () => {
        const quality = qualityControl.value;
        if (quality === 'auto') {
            player.setPlaybackQuality('default');
        } else {
            player.setPlaybackQuality(quality);
        }
    });
    
    // Load available qualities
    function loadQualities() {
        if (player && player.getAvailableQualityLevels) {
            const qualities = player.getAvailableQualityLevels();
            const qualityLabels = {
                'hd2160': '2160p',
                'hd1440': '1440p', 
                'hd1080': '1080p',
                'hd720': '720p',
                'large': '480p',
                'medium': '360p',
                'small': '240p',
                'tiny': '144p'
            };
            
            qualityControl.innerHTML = '<option value="auto">Auto</option>';
            qualities.forEach(quality => {
                const option = document.createElement('option');
                option.value = quality;
                option.textContent = qualityLabels[quality] || quality;
                qualityControl.appendChild(option);
            });
        }
    }
    
    // Load qualities when video is ready
    setTimeout(loadQualities, 2000);
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoPlayer.requestFullscreen();
        }
    });
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
        const expandIcon = document.getElementById('expandIcon');
        const minimizeIcon = document.getElementById('minimizeIcon');
        
        if (document.fullscreenElement) {
            expandIcon.style.display = 'none';
            minimizeIcon.style.display = 'block';
        } else {
            expandIcon.style.display = 'block';
            minimizeIcon.style.display = 'none';
        }
    });
    
    // Auto-hide controls
    function showControls() {
        if (!isDoubleTapping) {
            videoControls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                    videoControls.style.opacity = '0';
                }
            }, 3000);
        }
    }
    
    videoPlayer.addEventListener('mousemove', showControls);
    videoPlayer.addEventListener('click', showControls);
    videoPlayer.addEventListener('touchstart', showControls);
    videoPlayer.addEventListener('touchmove', showControls);
    
    // Update progress
    setInterval(() => {
        if (player && player.getCurrentTime) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const progress = (currentTime / duration) * 100;
                seekBar.value = progress;
                document.getElementById('seekProgress').style.width = progress + '%';
                document.getElementById('seekHandle').style.left = progress + '%';
                document.getElementById('currentTime').textContent = formatTime(currentTime);
                document.getElementById('totalTime').textContent = formatTime(duration);
                
                // Save progress every 5 seconds
                if (Math.floor(currentTime) % 5 === 0) {
                    updateProgress();
                }
            }
        }
    }, 1000);
}

// Format time helper
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Show next video countdown
function showNextVideoCountdown() {
    const videos = chapterVideos[currentChapter];
    if (currentVideoIndex < videos.length - 1) {
        const notification = document.getElementById('nextVideoNotification');
        const countdown = document.getElementById('countdown');
        const cancelBtn = document.getElementById('cancelNext');
        
        notification.style.display = 'block';
        
        let timeLeft = 5;
        countdown.textContent = timeLeft;
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            countdown.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                notification.style.display = 'none';
                playNextVideo();
            }
        }, 1000);
        
        // Cancel button
        cancelBtn.onclick = () => {
            clearInterval(countdownInterval);
            notification.style.display = 'none';
        };
    }
}

// Handle Enter key in comment input
document.getElementById('commentInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addComment();
    }
});

// Mobile optimizations
if ('ontouchstart' in window) {
    // Add touch-friendly classes
    document.body.classList.add('touch-device');
    
    // Improve touch scrolling for playlists and comments
    const scrollElements = document.querySelectorAll('.playlist, .comments');
    scrollElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
    });
}