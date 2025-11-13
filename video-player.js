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
try {
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
} catch (error) {
    console.warn('Firebase initialization failed:', error);
    var database = null;
}

class VideoPlayer {
    constructor() {
        this.videoId = this.getVideoIdFromURL();
        this.userId = this.generateUserId();
        this.userName = this.getUserName();
        this.currentSpeed = 1;
        this.currentQuality = '720';
        this.youtubePlayer = null;
        this.elements = {};
        this.hasViewed = false;
        this.hasInteracted = false;
        this.userInteractions = {};
        this.progressUpdateInterval = null;
        this.viewTimer = null;
        this.isSubmittingComment = false;

        this.controlsTimer = null;
        this.isControlsVisible = true;
        
        // XP tracking variables
        this.watchStartTime = null;
        this.lastXPTime = 0;
        this.totalWatchTime = 0;
        this.earnedXP = 0;
        this.xpTimer = null;
        this.isTracking = false;
        this.lastPlayTime = 0;
        
        this.initializeElements();
        this.checkUserRestriction();
        this.loadVideoData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateUserGreeting();
        this.startViewTimer();
        this.checkCommentBan();
        this.showRulesModal();

        this.setupControlsVisibility();
        this.initializeAI();
        this.startXPTracking();
        this.setupScreenshotFeature();
        this.setupMultilineInput();
        this.analyzeVideoContent();
        this.setupDoubleTap();
        
        // Render math content after page load
        setTimeout(() => {
            this.renderMathContent();
        }, 1000);
    }

    setupControlsVisibility() {
        const players = [this.elements.youtubePlayer, this.elements.mp4Player];
        
        players.forEach(player => {
            if (player) {
                player.addEventListener('mousemove', () => this.showControls());
                player.addEventListener('mouseleave', () => this.startControlsTimer());
                player.addEventListener('click', () => this.showControls());
            }
        });
        
        // Show controls on any interaction
        document.addEventListener('keydown', () => this.showControls());
        
        // Start initial timer
        this.startControlsTimer();
    }

    showControls() {
        this.isControlsVisible = true;
        const activePlayer = this.elements.youtubePlayer.style.display !== 'none' 
            ? this.elements.youtubePlayer 
            : this.elements.mp4Player;
            
        if (activePlayer) {
            const controls = activePlayer.querySelector('.player-controls');
            const centerControls = activePlayer.querySelector('.center-controls');
            if (controls) {
                controls.style.opacity = '1';
                controls.style.transform = 'translateY(0)';
                controls.style.pointerEvents = 'auto';
            }
            if (centerControls) {
                centerControls.style.opacity = '1';
                centerControls.style.pointerEvents = 'auto';
            }
        }
        
        this.clearControlsTimer();
        this.startControlsTimer();
    }

    hideControls() {
        this.isControlsVisible = false;
        const activePlayer = this.elements.youtubePlayer.style.display !== 'none' 
            ? this.elements.youtubePlayer 
            : this.elements.mp4Player;
            
        if (activePlayer) {
            const controls = activePlayer.querySelector('.player-controls');
            const centerControls = activePlayer.querySelector('.center-controls');
            if (controls) {
                controls.style.opacity = '0';
                controls.style.transform = 'translateY(20px)';
                controls.style.pointerEvents = 'none';
            }
            if (centerControls) {
                centerControls.style.opacity = '0';
                centerControls.style.pointerEvents = 'none';
            }
        }
    }

    startControlsTimer() {
        this.clearControlsTimer();
        this.controlsTimer = setTimeout(() => {
            this.hideControls();
        }, 3000); // Hide after 3 seconds of inactivity
    }

    clearControlsTimer() {
        if (this.controlsTimer) {
            clearTimeout(this.controlsTimer);
            this.controlsTimer = null;
        }
    }

    getVideoIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || 'default-video';
    }

    generateUserId() {
        // First try to get user ID from localStorage (logged in user)
        const userData = localStorage.getItem('padhleChamps_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.userId) {
                    return user.userId;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        // Fallback to session-based ID if not logged in
        let userId = sessionStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('userId', userId);
        }
        return userId;
    }

    getUserName() {
        const userData = localStorage.getItem('padhleChamps_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.name || 'Student';
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return 'Student';
    }

    initializeElements() {
        const ids = [
            'videoTitle', 'videoSubject', 'videoViews', 'userGreeting', 'banIndicator', 'banTimer',
            'youtubePlayer', 'mp4Player', 'customVideo', 'videoSource', 'restrictionOverlay',
            'playBtn', 'ytPlayBtn', 'rewindBtn', 'ytRewindBtn', 'forwardBtn', 'ytForwardBtn',
            'progress', 'ytProgress', 'timeDisplay', 'ytTimeDisplay',
            'speedBtn', 'ytSpeedBtn', 'speedDropdown', 'ytSpeedDropdown',
            'ytQualityBtn', 'ytQualityDropdown', 'volumeBtn', 'ytVolumeBtn',
            'fullscreenBtn', 'ytFullscreenBtn', 'ytProgressTrack',
            'likeBtn', 'dislikeBtn', 'shareBtn', 'bookmarkBtn',
            'likeCount', 'dislikeCount', 'commentText', 'submitComment',
            'commentsList', 'commentCount', 'toastContainer', 'rulesModal', 'closeRules', 'acceptRules',
            'aiChatMessages', 'aiChatInput', 'aiSendButton', 'aiMicButton', 'aiScreenshotButton',
            'screenshotPreview', 'screenshotImage', 'removeScreenshot'
        ];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    async loadVideoData() {
        try {
            const params = new URLSearchParams(window.location.search);
            const urlVideoData = {
                title: params.get('title') || 'Video Title',
                subject: params.get('subject') || 'General',
                type: params.get('type') || 'mp4',
                url: params.get('url') || ''
            };

            if (urlVideoData.url) {
                let existingData = { views: 0, likes: 0, dislikes: 0 };
                
                if (database) {
                    try {
                        const snapshot = await database.ref(`videos/${this.videoId}`).once('value');
                        const fbData = snapshot.val();
                        if (fbData) {
                            existingData = { views: fbData.views || 0, likes: fbData.likes || 0, dislikes: fbData.dislikes || 0 };
                        }
                    } catch (error) {
                        console.warn('Firebase read failed:', error);
                    }
                }
                
                const videoData = { ...existingData, ...urlVideoData };
                
                if (database) {
                    try {
                        await database.ref(`videos/${this.videoId}`).update({
                            title: videoData.title,
                            subject: videoData.subject,
                            type: videoData.type,
                            url: videoData.url,
                            lastUpdated: Date.now()
                        });
                    } catch (error) {
                        console.warn('Firebase write failed:', error);
                    }
                }
                
                this.updateVideoInfo(videoData);
                this.setupVideoPlayer(videoData);
                await this.loadInteractionData();
                await this.loadComments();
            }
        } catch (error) {
            console.error('Error loading video data:', error);
        }
    }

    updateVideoInfo(videoData) {
        if (this.elements.videoTitle) this.elements.videoTitle.textContent = videoData.title;
        if (this.elements.videoSubject) this.elements.videoSubject.textContent = videoData.subject;
        if (this.elements.videoViews) this.elements.videoViews.textContent = videoData.views || 0;
        if (this.elements.likeCount) this.elements.likeCount.textContent = videoData.likes || 0;
        if (this.elements.dislikeCount) this.elements.dislikeCount.textContent = videoData.dislikes || 0;
    }

    setupVideoPlayer(videoData) {
        if (videoData.type === 'youtube') {
            this.setupYouTubePlayer(videoData.url);
        } else {
            this.setupMP4Player(videoData.url);
        }
    }

    setupYouTubePlayer(url) {
        this.elements.youtubePlayer.style.display = 'block';
        this.elements.mp4Player.style.display = 'none';

        const videoId = this.extractYouTubeId(url);
        if (videoId) {
            this.initYouTubePlayer(videoId);
        }
    }

    setupMP4Player(url) {
        this.elements.youtubePlayer.style.display = 'none';
        this.elements.mp4Player.style.display = 'block';

        if (this.elements.videoSource && this.elements.customVideo) {
            this.elements.videoSource.src = url;
            this.elements.customVideo.load();
        }
    }

    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    initYouTubePlayer(videoId) {
        if (typeof YT === 'undefined' || !YT.Player) {
            setTimeout(() => this.initYouTubePlayer(videoId), 100);
            return;
        }

        this.youtubePlayer = new YT.Player('youtubeIframe', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'controls': 0,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'fs': 0,
                'cc_load_policy': 0,
                'iv_load_policy': 3,
                'autohide': 1,
                'disablekb': 1
            },
            events: {
                'onReady': () => this.setupYouTubeControls(),
                'onStateChange': (event) => this.onYouTubeStateChange(event)
            }
        });
    }

    setupYouTubeControls() {
        this.elements.ytPlayBtn?.addEventListener('click', () => {
            this.showControls();
            if (this.youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                this.youtubePlayer.pauseVideo();
            } else {
                this.youtubePlayer.playVideo();
            }
        });
        
        this.elements.ytRewindBtn?.addEventListener('click', () => {
            this.showControls();
            const currentTime = this.youtubePlayer.getCurrentTime();
            this.youtubePlayer.seekTo(Math.max(0, currentTime - 10), true);
        });
        
        this.elements.ytForwardBtn?.addEventListener('click', () => {
            this.showControls();
            const currentTime = this.youtubePlayer.getCurrentTime();
            this.youtubePlayer.seekTo(currentTime + 10, true);
        });

        this.elements.ytProgressTrack?.addEventListener('click', (e) => {
            this.showControls();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const duration = this.youtubePlayer.getDuration();
            const newTime = (clickX / width) * duration;
            this.youtubePlayer.seekTo(newTime, true);
        });
        
        // Touch support for progress track
        this.elements.ytProgressTrack?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.showControls();
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const touchX = touch.clientX - rect.left;
            const width = rect.width;
            const duration = this.youtubePlayer.getDuration();
            const newTime = (touchX / width) * duration;
            this.youtubePlayer.seekTo(newTime, true);
        });

        this.elements.ytVolumeBtn?.addEventListener('click', () => {
            this.showControls();
            if (this.youtubePlayer.isMuted()) {
                this.youtubePlayer.unMute();
                this.elements.ytVolumeBtn.querySelector('i').className = 'fas fa-volume-up';
            } else {
                this.youtubePlayer.mute();
                this.elements.ytVolumeBtn.querySelector('i').className = 'fas fa-volume-mute';
            }
        });

        this.elements.ytFullscreenBtn?.addEventListener('click', () => {
            this.showControls();
            this.toggleFullscreen();
        });
        
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenIcon();
            if (document.fullscreenElement) {
                this.showControls();
                this.clearControlsTimer(); // Keep controls visible in fullscreen initially
                setTimeout(() => this.startControlsTimer(), 1000); // Start timer after 1 second
            } else {
                this.showControls();
                this.startControlsTimer();
            }
        });
        
        // Rules modal events
        this.elements.closeRules?.addEventListener('click', () => this.hideRulesModal());
        this.elements.acceptRules?.addEventListener('click', () => this.hideRulesModal());
        


        this.startYouTubeProgressUpdate();
    }

    onYouTubeStateChange(event) {
        const icon = this.elements.ytPlayBtn?.querySelector('i');
        if (icon) {
            if (event.data === YT.PlayerState.PLAYING) {
                icon.className = 'fas fa-pause';
            } else {
                icon.className = 'fas fa-play';
            }
        }
    }

    startYouTubeProgressUpdate() {
        setInterval(() => {
            if (this.youtubePlayer && this.youtubePlayer.getCurrentTime) {
                const currentTime = this.youtubePlayer.getCurrentTime();
                const duration = this.youtubePlayer.getDuration();
                
                if (duration > 0) {
                    const progress = (currentTime / duration) * 100;
                    if (this.elements.ytProgress) {
                        this.elements.ytProgress.style.width = progress + '%';
                    }
                    
                    if (this.elements.ytTimeDisplay) {
                        const currentFormatted = this.formatTime(currentTime);
                        const durationFormatted = this.formatTime(duration);
                        this.elements.ytTimeDisplay.textContent = `${currentFormatted} / ${durationFormatted}`;
                    }
                }
            }
        }, 1000);
    }

    setupEventListeners() {
        // MP4 Player Controls
        this.elements.playBtn?.addEventListener('click', () => {
            this.showControls();
            const video = this.elements.customVideo;
            const icon = this.elements.playBtn.querySelector('i');
            
            if (video.paused) {
                video.play();
                icon.className = 'fas fa-pause';
            } else {
                video.pause();
                icon.className = 'fas fa-play';
            }
        });
        
        this.elements.rewindBtn?.addEventListener('click', () => {
            this.showControls();
            const video = this.elements.customVideo;
            video.currentTime = Math.max(0, video.currentTime - 10);
        });
        
        this.elements.forwardBtn?.addEventListener('click', () => {
            this.showControls();
            const video = this.elements.customVideo;
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
        });

        this.elements.customVideo?.addEventListener('timeupdate', () => {
            const video = this.elements.customVideo;
            const progress = (video.currentTime / video.duration) * 100;
            if (this.elements.progress) {
                this.elements.progress.style.width = progress + '%';
            }
            if (this.elements.timeDisplay) {
                this.elements.timeDisplay.textContent = this.formatTime(video.currentTime);
            }
        });
        
        // Add touch support for MP4 progress track
        const mp4ProgressTrack = document.querySelector('#mp4Player .progress-track');
        mp4ProgressTrack?.addEventListener('click', (e) => {
            this.showControls();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const video = this.elements.customVideo;
            if (video && video.duration) {
                const newTime = (clickX / width) * video.duration;
                video.currentTime = newTime;
            }
        });
        
        mp4ProgressTrack?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.showControls();
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const touchX = touch.clientX - rect.left;
            const width = rect.width;
            const video = this.elements.customVideo;
            if (video && video.duration) {
                const newTime = (touchX / width) * video.duration;
                video.currentTime = newTime;
            }
        });



        this.elements.volumeBtn?.addEventListener('click', () => {
            this.showControls();
            const video = this.elements.customVideo;
            video.muted = !video.muted;
            this.updateVolumeIcon();
        });

        this.elements.fullscreenBtn?.addEventListener('click', () => {
            this.showControls();
            this.toggleFullscreen();
        });

        // Speed Controls
        this.elements.speedBtn?.addEventListener('click', () => {
            this.showControls();
            this.toggleDropdown('speedDropdown');
        });

        this.elements.ytSpeedBtn?.addEventListener('click', () => {
            this.showControls();
            this.toggleDropdown('ytSpeedDropdown');
        });

        this.elements.ytQualityBtn?.addEventListener('click', () => {
            this.showControls();
            this.toggleDropdown('ytQualityDropdown');
        });

        // Dropdown Options
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const speed = e.target.dataset.speed;
                const quality = e.target.dataset.quality;
                
                if (speed) {
                    this.setPlaybackSpeed(parseFloat(speed));
                }
                if (quality) {
                    this.setVideoQuality(quality);
                }
                
                this.hideAllDropdowns();
            }
        });

        // Action Buttons
        this.elements.likeBtn?.addEventListener('click', () => this.toggleLike());
        this.elements.dislikeBtn?.addEventListener('click', () => this.toggleDislike());
        this.elements.shareBtn?.addEventListener('click', () => this.shareVideo());
        this.elements.bookmarkBtn?.addEventListener('click', () => this.bookmarkVideo());

        // Comments
        this.elements.submitComment?.addEventListener('click', () => this.submitComment());
        this.elements.commentText?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitComment();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.control-btn')) {
                this.hideAllDropdowns();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case '.':
                    e.preventDefault();
                    this.cycleSpeed(1);
                    break;
                case ',':
                    e.preventDefault();
                    this.cycleSpeed(-1);
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    this.rewind();
                    break;
                case 'arrowright':
                    e.preventDefault();
                    this.forward();
                    break;
            }
        });
    }

    togglePlayPause() {
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            if (this.youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                this.youtubePlayer.pauseVideo();
            } else {
                this.youtubePlayer.playVideo();
            }
        } else if (this.elements.customVideo) {
            if (this.elements.customVideo.paused) {
                this.elements.customVideo.play();
            } else {
                this.elements.customVideo.pause();
            }
        }
    }

    rewind() {
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            const currentTime = this.youtubePlayer.getCurrentTime();
            this.youtubePlayer.seekTo(Math.max(0, currentTime - 10), true);
        } else if (this.elements.customVideo) {
            this.elements.customVideo.currentTime = Math.max(0, this.elements.customVideo.currentTime - 10);
        }
    }
    
    forward() {
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            const currentTime = this.youtubePlayer.getCurrentTime();
            this.youtubePlayer.seekTo(currentTime + 10, true);
        } else if (this.elements.customVideo) {
            this.elements.customVideo.currentTime = Math.min(this.elements.customVideo.duration, this.elements.customVideo.currentTime + 10);
        }
    }
    
    setupDoubleTap() {
        let lastTap = 0;
        let tapSide = null;
        
        [this.elements.youtubePlayer, this.elements.mp4Player].forEach(player => {
            if (!player) return;
            
            player.addEventListener('click', (e) => {
                const now = Date.now();
                const rect = player.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const side = x < width / 3 ? 'left' : x > (width * 2 / 3) ? 'right' : 'center';
                
                if (now - lastTap < 300 && tapSide === side && side !== 'center') {
                    if (side === 'left') {
                        this.rewind();
                    } else if (side === 'right') {
                        this.forward();
                    }
                    lastTap = 0;
                } else {
                    lastTap = now;
                    tapSide = side;
                }
            });
        });
    }
    
    toggleMute() {
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            if (this.youtubePlayer.isMuted()) {
                this.youtubePlayer.unMute();
            } else {
                this.youtubePlayer.mute();
            }
        } else if (this.elements.customVideo) {
            this.elements.customVideo.muted = !this.elements.customVideo.muted;
            this.updateVolumeIcon();
        }
    }

    toggleFullscreen() {
        const player = this.elements.youtubePlayer.style.display !== 'none' 
            ? this.elements.youtubePlayer 
            : this.elements.mp4Player;
            
        if (!document.fullscreenElement) {
            player.requestFullscreen().then(() => {
                this.showControls();
            }).catch(err => {
                console.warn('Fullscreen request failed:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.showControls();
            }).catch(err => {
                console.warn('Exit fullscreen failed:', err);
            });
        }
        
        this.updateFullscreenIcon();
    }
    
    updateFullscreenIcon() {
        const isFullscreen = !!document.fullscreenElement;
        const fullscreenBtns = [this.elements.fullscreenBtn, this.elements.ytFullscreenBtn];
        
        fullscreenBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
                }
            }
        });
    }

    cycleSpeed(direction) {
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(this.currentSpeed);
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = speeds.length - 1;
        if (newIndex >= speeds.length) newIndex = 0;
        
        this.setPlaybackSpeed(speeds[newIndex]);
    }

    setPlaybackSpeed(speed) {
        this.currentSpeed = speed;
        
        // Update active dropdown item
        document.querySelectorAll('.dropdown-item[data-speed]').forEach(item => {
            item.classList.remove('active');
            if (parseFloat(item.dataset.speed) === speed) {
                item.classList.add('active');
            }
        });
        
        // Update button labels and icons
        const speedButtons = [this.elements.speedBtn, this.elements.ytSpeedBtn];
        speedButtons.forEach(btn => {
            if (btn) {
                const label = btn.querySelector('.btn-label');
                const icon = btn.querySelector('i');
                
                if (label) label.textContent = `${speed}x`;
                btn.setAttribute('data-speed', `${speed}x`);
                
                if (icon) {
                    if (speed < 1) {
                        icon.className = 'fas fa-backward';
                    } else if (speed > 1) {
                        icon.className = 'fas fa-forward';
                    } else {
                        icon.className = 'fas fa-tachometer-alt';
                    }
                }
            }
        });
        
        // Apply speed
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            this.youtubePlayer.setPlaybackRate(speed);
        } else if (this.elements.customVideo) {
            this.elements.customVideo.playbackRate = speed;
        }
        
        this.showToast('success', 'Speed Changed', `Playback speed set to ${speed}x`);
    }

    setVideoQuality(quality) {
        this.currentQuality = quality;
        
        // Update active dropdown item
        document.querySelectorAll('.dropdown-item[data-quality]').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.quality === quality) {
                item.classList.add('active');
            }
        });
        
        // Update button label and icon
        if (this.elements.ytQualityBtn) {
            const label = this.elements.ytQualityBtn.querySelector('.btn-label');
            const icon = this.elements.ytQualityBtn.querySelector('i');
            
            if (label) label.textContent = `${quality}p`;
            
            if (icon) {
                if (parseInt(quality) >= 720) {
                    icon.className = 'fas fa-hdd';
                } else if (parseInt(quality) >= 480) {
                    icon.className = 'fas fa-tv';
                } else {
                    icon.className = 'fas fa-mobile-alt';
                }
            }
        }
        
        // Apply quality (YouTube only)
        if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
            const qualityMap = {
                '144': 'tiny', '240': 'small', '360': 'medium',
                '480': 'large', '720': 'hd720', '1080': 'hd1080'
            };
            const ytQuality = qualityMap[quality];
            if (ytQuality) {
                this.youtubePlayer.setPlaybackQuality(ytQuality);
            }
        }
        
        this.showToast('success', 'Quality Changed', `Video quality set to ${quality}p`);
    }

    toggleDropdown(dropdownId) {
        this.hideAllDropdowns();
        const dropdown = this.elements[dropdownId];
        if (dropdown) {
            dropdown.classList.add('show');
        }
    }

    hideAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    updateVolumeIcon() {
        const video = this.elements.customVideo;
        const icon = this.elements.volumeBtn?.querySelector('i');
        
        if (icon) {
            if (video.muted || video.volume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (video.volume < 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }

    updateUserGreeting() {
        if (this.elements.userGreeting) {
            this.elements.userGreeting.textContent = `Hi ${this.userName}`;
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async toggleLike() {
        if (this.hasInteracted) {
            this.showToast('warning', 'Already Voted', 'You can only like or dislike once per video.');
            return;
        }

        try {
            this.userInteractions = { liked: true, timestamp: Date.now() };
            this.hasInteracted = true;

            if (database) {
                await database.ref(`userInteractions/${this.userId}/${this.videoId}`).set(this.userInteractions);
                const likesRef = database.ref(`videos/${this.videoId}/likes`);
                await likesRef.transaction((currentLikes) => (currentLikes || 0) + 1);
            }

            this.elements.likeBtn.classList.add('liked');
            this.elements.dislikeBtn.classList.add('inactive');
            
            await this.refreshCounts();
            this.showToast('success', 'Liked!', 'Thanks for your feedback!');
        } catch (error) {
            this.showToast('error', 'Error', 'Failed to like video.');
        }
    }

    async toggleDislike() {
        if (this.hasInteracted) {
            this.showToast('warning', 'Already Voted', 'You can only like or dislike once per video.');
            return;
        }

        try {
            this.userInteractions = { disliked: true, timestamp: Date.now() };
            this.hasInteracted = true;

            if (database) {
                await database.ref(`userInteractions/${this.userId}/${this.videoId}`).set(this.userInteractions);
                const dislikesRef = database.ref(`videos/${this.videoId}/dislikes`);
                await dislikesRef.transaction((currentDislikes) => (currentDislikes || 0) + 1);
            }

            this.elements.dislikeBtn.classList.add('disliked');
            this.elements.likeBtn.classList.add('inactive');
            
            await this.refreshCounts();
            this.showToast('success', 'Disliked!', 'Thanks for your feedback!');
        } catch (error) {
            this.showToast('error', 'Error', 'Failed to dislike video.');
        }
    }

    shareVideo() {
        if (navigator.share) {
            navigator.share({
                title: this.elements.videoTitle?.textContent || 'Video',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('success', 'Link Copied!', 'Video link copied to clipboard');
        }
    }

    bookmarkVideo() {
        this.showToast('success', 'Bookmarked!', 'Video saved to your bookmarks');
    }

    async submitComment() {
        const commentText = this.elements.commentText?.value.trim();
        if (!commentText) {
            this.showToast('warning', 'Empty Comment', 'Please write something before posting.');
            return;
        }

        if (this.isSubmittingComment) return;
        this.isSubmittingComment = true;
        this.elements.submitComment.disabled = true;

        try {
            const isBanned = await this.checkCommentBan();
            if (isBanned) return;

            const moderationResult = this.moderateComment(commentText);
            if (!moderationResult.allowed) {
                await this.banUser(moderationResult.reason);
                return;
            }

            const comment = {
                text: commentText,
                author: this.userName,
                timestamp: Date.now(),
                userId: this.userId
            };

            if (database) {
                await database.ref(`comments/${this.videoId}`).push(comment);
            }
            
            this.elements.commentText.value = '';
            await this.loadComments();
            this.showToast('success', 'Comment Posted', 'Your comment has been posted!');
        } catch (error) {
            this.showToast('error', 'Error', 'Failed to post comment.');
        } finally {
            this.elements.submitComment.disabled = false;
            this.isSubmittingComment = false;
        }
    }

    async loadComments() {
        if (!this.elements.commentsList || !database) return;
        
        try {
            const snapshot = await database.ref(`comments/${this.videoId}`).orderByChild('timestamp').once('value');
            const comments = snapshot.val();
            
            this.elements.commentsList.innerHTML = '';
            
            if (comments) {
                const commentArray = Object.entries(comments).map(([id, comment]) => ({
                    ...comment,
                    id
                })).reverse();
                
                if (this.elements.commentCount) {
                    this.elements.commentCount.textContent = `${commentArray.length} comment${commentArray.length !== 1 ? 's' : ''}`;
                }
                commentArray.forEach(comment => this.renderComment(comment));
            } else {
                this.elements.commentsList.innerHTML = `
                    <div class="no-comments">
                        <i class="fas fa-comment-dots"></i>
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                `;
            }
        } catch (error) {
            console.warn('Comment loading failed:', error);
        }
    }

    renderComment(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        
        const timeAgo = this.getTimeAgo(comment.timestamp);
        const commentId = comment.id || `comment_${comment.timestamp}_${comment.userId}`;
        const likeCount = comment.likes || 0;
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <div class="comment-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <span class="comment-author">${this.escapeHtml(comment.author)}</span>
            </div>
            <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            <div class="comment-footer">
                <div class="comment-time">${timeAgo}</div>
                <button class="comment-like-btn" data-comment-id="${commentId}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${likeCount}</span>
                </button>
            </div>
        `;
        
        const likeBtn = commentDiv.querySelector('.comment-like-btn');
        this.checkCommentLikeStatus(commentId, likeBtn);
        
        likeBtn.addEventListener('click', () => this.toggleCommentLike(commentId, likeBtn));
        
        this.elements.commentsList.appendChild(commentDiv);
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadInteractionData() {
        if (!database) return;
        
        try {
            const snapshot = await database.ref(`userInteractions/${this.userId}/${this.videoId}`).once('value');
            const interactions = snapshot.val();

            if (interactions) {
                this.userInteractions = interactions;
                this.hasInteracted = true;
                
                if (interactions.liked && this.elements.likeBtn) {
                    this.elements.likeBtn.classList.add('liked');
                    this.elements.dislikeBtn.classList.add('inactive');
                }
                
                if (interactions.disliked && this.elements.dislikeBtn) {
                    this.elements.dislikeBtn.classList.add('disliked');
                    this.elements.likeBtn.classList.add('inactive');
                }
            }
        } catch (error) {
            console.warn('Interaction data load failed:', error);
        }
    }

    async refreshCounts() {
        if (!database) return;
        
        try {
            const snapshot = await database.ref(`videos/${this.videoId}`).once('value');
            const data = snapshot.val();
            
            if (data) {
                if (this.elements.likeCount) this.elements.likeCount.textContent = data.likes || 0;
                if (this.elements.dislikeCount) this.elements.dislikeCount.textContent = data.dislikes || 0;
                if (this.elements.videoViews) this.elements.videoViews.textContent = data.views || 0;
            }
        } catch (error) {
            console.warn('Count refresh failed:', error);
        }
    }

    startViewTimer() {
        if (this.viewTimer) clearTimeout(this.viewTimer);
        
        this.viewTimer = setTimeout(() => {
            if (!this.hasViewed) {
                this.incrementViews();
                this.hasViewed = true;
            }
        }, 10000);
    }

    async incrementViews() {
        if (!database) return;
        
        try {
            const viewKey = `${this.videoId}_${this.userId}`;
            const viewSnapshot = await database.ref(`userViews/${viewKey}`).once('value');

            if (!viewSnapshot.exists()) {
                await database.ref(`userViews/${viewKey}`).set({
                    timestamp: Date.now(),
                    videoId: this.videoId,
                    userId: this.userId
                });
                
                const viewsRef = database.ref(`videos/${this.videoId}/views`);
                await viewsRef.transaction((currentViews) => (currentViews || 0) + 1);

                const updatedSnapshot = await database.ref(`videos/${this.videoId}/views`).once('value');
                const newViewCount = updatedSnapshot.val() || 0;
                
                if (this.elements.videoViews) {
                    this.elements.videoViews.textContent = newViewCount;
                }
            }
        } catch (error) {
            console.warn('View increment failed:', error);
        }
    }

    async checkCommentBan() {
        if (!database) return false;
        
        try {
            const banSnapshot = await database.ref(`commentBans/${this.userId}`).once('value');
            const banData = banSnapshot.val();

            if (banData && banData.banUntil > Date.now()) {
                const timeLeft = banData.banUntil - Date.now();
                this.showBanIndicator(timeLeft);
                if (this.elements.commentText) this.elements.commentText.disabled = true;
                if (this.elements.submitComment) this.elements.submitComment.disabled = true;
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Ban check failed:', error);
            return false;
        }
    }

    showBanIndicator(timeLeft) {
        if (this.elements.banIndicator) {
            this.elements.banIndicator.style.display = 'flex';
            this.updateBanTimer(timeLeft);
        }
    }

    updateBanTimer(timeLeft) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        if (this.elements.banTimer) {
            this.elements.banTimer.textContent = `Restricted ${hours}h ${minutes}m`;
        }
    }
    
    showRulesModal() {
        setTimeout(() => {
            if (this.elements.rulesModal) {
                this.elements.rulesModal.classList.add('show');
            }
        }, 3000);
    }
    
    hideRulesModal() {
        if (this.elements.rulesModal) {
            this.elements.rulesModal.classList.remove('show');
        }
    }
    

    
    setupScreenshotFeature() {
        this.currentScreenshot = null;
        this.screenshotInput = document.createElement('input');
        this.screenshotInput.type = 'file';
        this.screenshotInput.accept = 'image/*';
        this.screenshotInput.style.display = 'none';
        document.body.appendChild(this.screenshotInput);
        
        this.elements.aiScreenshotButton?.addEventListener('click', () => {
            this.showToast('info', 'Take Screenshot', 'Use your device screenshot tool, then click here to upload');
            this.screenshotInput.click();
        });
        
        this.screenshotInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.currentScreenshot = event.target.result;
                    this.showScreenshotPreview();
                    this.showToast('success', 'Screenshot Added', 'Screenshot added to your message');
                };
                reader.readAsDataURL(file);
            }
        });
        
        this.elements.removeScreenshot?.addEventListener('click', () => {
            this.removeScreenshot();
        });
    }
    
    showScreenshotPreview() {
        if (this.elements.screenshotPreview && this.elements.screenshotImage) {
            this.elements.screenshotImage.src = this.currentScreenshot;
            this.elements.screenshotPreview.style.display = 'flex';
        }
    }
    
    removeScreenshot() {
        this.currentScreenshot = null;
        this.screenshotInput.value = '';
        if (this.elements.screenshotPreview) {
            this.elements.screenshotPreview.style.display = 'none';
        }
        this.showToast('info', 'Screenshot Removed', 'Screenshot removed from message');
    }
    
    setupMultilineInput() {
        const input = this.elements.aiChatInput;
        if (!input) return;
        
        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
            
            // Enable/disable send button
            if (this.elements.aiSendButton) {
                this.elements.aiSendButton.disabled = !input.value.trim();
            }
        });
        
        // Handle Enter key (Shift+Enter for new line)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.value.trim()) {
                    this.sendAIMessage();
                }
            }
        });
    }
    
    async checkCommentLikeStatus(commentId, likeBtn) {
        if (!database) return;
        
        try {
            const likeKey = `${this.userId}_${commentId}`;
            const snapshot = await database.ref(`commentLikes/${this.videoId}/${commentId}/${likeKey}`).once('value');
            
            if (snapshot.exists()) {
                likeBtn.classList.add('liked');
            }
        } catch (error) {
            console.warn('Comment like check failed:', error);
        }
    }
    
    async toggleCommentLike(commentId, likeBtn) {
        if (!database) return;
        
        try {
            const likeKey = `${this.userId}_${commentId}`;
            const likeRef = database.ref(`commentLikes/${this.videoId}/${commentId}/${likeKey}`);
            const snapshot = await likeRef.once('value');
            
            if (snapshot.exists()) {
                await likeRef.remove();
                likeBtn.classList.remove('liked');
                
                const commentRef = database.ref(`comments/${this.videoId}/${commentId}/likes`);
                await commentRef.transaction((currentLikes) => Math.max(0, (currentLikes || 0) - 1));
            } else {
                await likeRef.set({
                    userId: this.userId,
                    userName: this.userName,
                    timestamp: Date.now()
                });
                likeBtn.classList.add('liked');
                
                const commentRef = database.ref(`comments/${this.videoId}/${commentId}/likes`);
                await commentRef.transaction((currentLikes) => (currentLikes || 0) + 1);
            }
            
            const updatedSnapshot = await database.ref(`comments/${this.videoId}/${commentId}/likes`).once('value');
            const newCount = updatedSnapshot.val() || 0;
            likeBtn.querySelector('.like-count').textContent = newCount;
            
        } catch (error) {
            console.warn('Comment like toggle failed:', error);
        }
    }

    moderateComment(text) {
        const slangWords = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'stupid', 'idiot'];
        const hindiSlangWords = ['bc', 'mc', 'bhenchod', 'madarchod', 'chutiya', 'gandu', 'randi'];
        const promotionalWords = ['subscribe', 'like this', 'follow me', 'check out', 'visit my'];
        
        const lowerText = text.toLowerCase();

        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;
        if (urlPattern.test(text)) {
            return { allowed: false, reason: 'links not allowed' };
        }

        for (const word of [...slangWords, ...hindiSlangWords, ...promotionalWords]) {
            if (lowerText.includes(word)) {
                return { allowed: false, reason: 'inappropriate content' };
            }
        }

        return { allowed: true };
    }

    async banUser(reason) {
        try {
            const banUntil = Date.now() + (24 * 60 * 60 * 1000);
            await database.ref(`commentBans/${this.userId}`).set({
                bannedAt: Date.now(),
                banUntil: banUntil,
                reason: reason,
                userName: this.userName
            });

            this.showToast('error', 'Comment Blocked', `Your comment was blocked for ${reason}. You are banned for 24 hours.`);
            this.elements.commentText.disabled = true;
            this.elements.submitComment.disabled = true;
        } catch (error) {
            console.error('Error banning user:', error);
        }
    }

    async checkUserRestriction() {
        const userData = localStorage.getItem('padhleChamps_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.isBlocked) {
                    this.showRestrictionPopup();
                    this.disableAllInteractions();
                }
            } catch (error) {
                console.error('Error checking user restriction:', error);
            }
        }
    }

    showRestrictionPopup() {
        if (this.elements.restrictionOverlay) {
            this.elements.restrictionOverlay.style.display = 'flex';
        }
    }

    disableAllInteractions() {
        const interactiveElements = [
            this.elements.likeBtn, this.elements.dislikeBtn, 
            this.elements.shareBtn, this.elements.bookmarkBtn,
            this.elements.commentText, this.elements.submitComment
        ];
        
        interactiveElements.forEach(element => {
            if (element) {
                element.disabled = true;
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.5';
            }
        });
        
        if (this.elements.banIndicator) {
            this.elements.banIndicator.style.display = 'flex';
            this.elements.banTimer.textContent = 'Account Restricted';
        }
    }

    showToast(type, title, message) {
        if (!this.elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async analyzeVideoContent() {
        const videoTitle = this.elements.videoTitle?.textContent || '';
        const videoSubject = this.elements.videoSubject?.textContent || '';
        
        if (!videoTitle || videoTitle === 'Loading Video...') {
            setTimeout(() => this.analyzeVideoContent(), 2000);
            return;
        }
        
        const analysisPrompt = `Analyze this educational video: "${videoTitle}" (Subject: ${videoSubject}). Provide:
1. Brief summary (2-3 sentences)
2. 3 suggested questions students might ask

Format:
<strong>Summary:</strong>
<p>[summary]</p>
<strong>Suggested Questions:</strong>
<ul>
<li>[question 1]</li>
<li>[question 2]</li>
<li>[question 3]</li>
</ul>`;
        
        try {
            const response = await this.callGeminiAPI(analysisPrompt);
            this.addAIMessage(response, 'ai');
        } catch (error) {
            console.error('Video analysis failed:', error);
        }
    }
    
    // AI Chat Functionality
    initializeAI() {
        this.aiApiKey = 'AIzaSyDez5ARuZXyhUssEskk44EY-i-boEXx9r4';
        this.aiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.aiApiKey}`;
        this.isAIListening = false;
        this.aiRecognition = null;
        
        // Initialize speech recognition if available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.aiRecognition = new SpeechRecognition();
            this.aiRecognition.continuous = false;
            this.aiRecognition.interimResults = false;
            this.aiRecognition.lang = 'en-US';
        }
        
        this.setupAIEventListeners();
        this.renderMathContent();
    }
    
    renderMathContent() {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise().catch((err) => {
                console.warn('MathJax rendering failed:', err);
            });
        }
    }

    setupAIEventListeners() {
        // AI Chat Input
        if (this.elements.aiChatInput) {
            this.elements.aiChatInput.addEventListener('input', () => {
                this.elements.aiSendButton.disabled = !this.elements.aiChatInput.value.trim();
            });
            
            this.elements.aiChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAIMessage();
                }
            });
        }

        // AI Send Button
        if (this.elements.aiSendButton) {
            this.elements.aiSendButton.addEventListener('click', () => {
                this.sendAIMessage();
            });
        }

        // AI Mic Button
        if (this.elements.aiMicButton && this.aiRecognition) {
            this.elements.aiMicButton.addEventListener('click', () => {
                this.toggleAIVoiceRecognition();
            });
            
            this.aiRecognition.onstart = () => {
                this.isAIListening = true;
                this.elements.aiMicButton.classList.add('listening');
                this.elements.aiChatInput.placeholder = 'Listening... Speak now!';
            };
            
            this.aiRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.aiChatInput.value = transcript;
                this.elements.aiSendButton.disabled = false;
            };
            
            this.aiRecognition.onend = () => {
                this.isAIListening = false;
                this.elements.aiMicButton.classList.remove('listening');
                this.elements.aiChatInput.placeholder = 'Ask me anything about this video or your studies...';
            };
            
            this.aiRecognition.onerror = (event) => {
                console.error('AI Speech recognition error:', event.error);
                this.isAIListening = false;
                this.elements.aiMicButton.classList.remove('listening');
                this.elements.aiChatInput.placeholder = 'Voice recognition failed. Try typing instead.';
            };
        } else if (this.elements.aiMicButton) {
            this.elements.aiMicButton.style.display = 'none';
        }
    }

    toggleAIVoiceRecognition() {
        if (this.isAIListening) {
            this.aiRecognition.stop();
        } else {
            this.aiRecognition.start();
        }
    }

    async sendAIMessage() {
        const message = this.elements.aiChatInput?.value.trim();
        if (!message) return;

        // Add user message to chat (with screenshot if available)
        if (this.currentScreenshot) {
            this.addAIMessage(message, 'user', this.currentScreenshot);
        } else {
            this.addAIMessage(message, 'user');
        }
        
        this.elements.aiChatInput.value = '';
        this.elements.aiChatInput.style.height = 'auto';
        this.elements.aiSendButton.disabled = true;

        // Show loading
        this.showAILoading();

        try {
            const response = await this.callGeminiAPI(message, this.currentScreenshot);
            this.hideAILoading();
            this.addAIMessage(response, 'ai');
            
            // Clear screenshot after sending
            if (this.currentScreenshot) {
                this.removeScreenshot();
            }
        } catch (error) {
            console.error('AI API Error:', error);
            this.hideAILoading();
            this.addAIMessage('Sorry, I encountered an error. Please try again! 😅', 'ai');
        }
    }

    async callGeminiAPI(message, screenshot = null) {
        const videoTitle = this.elements.videoTitle?.textContent || 'Current Video';
        const videoSubject = this.elements.videoSubject?.textContent || 'General';
        const currentTime = this.getCurrentVideoTime();
        const videoDuration = this.getVideoDuration();
        
        const systemPrompt = `You are Eduvia AI, an intelligent learning companion integrated into a video player.

CURRENT VIDEO: ${videoTitle} (${videoSubject}) - Time: ${currentTime}/${videoDuration}

FORMATTING RULES (CRITICAL):
- NEVER use asterisks (*) for any formatting
- Use <strong> for bold text instead of asterisks
- Use <em> for italic text instead of asterisks
- Use <u> for underline when needed
- Use HTML entities: &#39; for apostrophes, &quot; for quotes
- Use punctuation: . , : ; for natural breaks
- For math: use LaTeX with $ for inline, $$ for display
- Use <br> for line breaks, <p> for paragraphs
- Use <ul><li> for bullet points

EXAMPLE GOOD FORMATTING:
<p><strong>Quadratic Formula:</strong></p>
<p>For equation $ax^2 + bx + c = 0$, solutions are:</p>
<p>$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</p>
<ul>
<li><strong>Discriminant:</strong> $b^2 - 4ac$</li>
<li>If positive: two real solutions</li>
</ul>

Provide educational explanations with proper HTML formatting and LaTeX math.`;

        const userParts = [{ text: message }];
        
        // Add screenshot if available
        if (screenshot) {
            const base64Data = screenshot.split(',')[1];
            userParts.push({
                inline_data: {
                    mime_type: 'image/png',
                    data: base64Data
                }
            });
        }
        
        const payload = {
            contents: [{
                role: 'user',
                parts: userParts
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(this.aiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that. Please try again!';
    }

    addAIMessage(message, sender, screenshot = null) {
        if (!this.elements.aiChatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';

        const avatar = sender === 'user' ? 
            '<div class="user-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="ai-avatar"><i class="fas fa-robot"></i></div>';

        const contentClass = sender === 'user' ? 'user-message-content' : 'ai-message-content';
        
        const screenshotHTML = screenshot ? `<img src="${screenshot}" class="message-screenshot" alt="Screenshot">` : '';

        messageDiv.innerHTML = `
            ${avatar}
            <div class="${contentClass}">
                ${screenshotHTML}
                <div>${message}</div>
            </div>
        `;

        this.elements.aiChatMessages.appendChild(messageDiv);
        this.scrollAIChatToBottom();
        
        // Render math content in the new message
        if (sender === 'ai') {
            setTimeout(() => {
                this.renderMathContent();
            }, 100);
        }
    }

    showAILoading() {
        if (!this.elements.aiChatMessages) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-loading';
        loadingDiv.id = 'aiLoadingMessage';

        loadingDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-loading-content">
                <span>Eduvia AI is thinking</span>
                <div class="ai-loading-dots">
                    <div class="ai-loading-dot"></div>
                    <div class="ai-loading-dot"></div>
                    <div class="ai-loading-dot"></div>
                </div>
            </div>
        `;

        this.elements.aiChatMessages.appendChild(loadingDiv);
        this.scrollAIChatToBottom();
    }

    hideAILoading() {
        const loadingMessage = document.getElementById('aiLoadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    scrollAIChatToBottom() {
        if (this.elements.aiChatMessages) {
            this.elements.aiChatMessages.scrollTop = this.elements.aiChatMessages.scrollHeight;
        }
    }

    getCurrentVideoTime() {
        try {
            if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
                const currentTime = this.youtubePlayer.getCurrentTime();
                return currentTime ? this.formatTime(currentTime) : '0:00';
            } else if (this.elements.customVideo) {
                return this.formatTime(this.elements.customVideo.currentTime);
            }
        } catch (error) {
            console.warn('Could not get current video time:', error);
        }
        return '0:00';
    }

    getVideoDuration() {
        try {
            if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
                const duration = this.youtubePlayer.getDuration();
                return duration ? this.formatTime(duration) : '0:00';
            } else if (this.elements.customVideo) {
                return this.formatTime(this.elements.customVideo.duration);
            }
        } catch (error) {
            console.warn('Could not get video duration:', error);
        }
        return '0:00';
    }

    // Start XP tracking for video watching
    startXPTracking() {
        console.log('Starting XP tracking...');
        this.watchStartTime = Date.now();
        this.lastPlayTime = Date.now();
        this.isTracking = true;
        
        // Track XP every 60 seconds (1 minute)
        this.xpTimer = setInterval(() => {
            this.trackWatchTime();
        }, 60000); // Check every minute
        
        // Also track on video events
        this.setupVideoEventTracking();
    }

    // Track watch time and award XP
    trackWatchTime() {
        if (!this.isVideoPlaying() || !this.isTracking) return;
        
        const currentTime = Date.now();
        const totalMinutesWatched = Math.floor((currentTime - this.watchStartTime) / 60000);
        
        if (totalMinutesWatched > this.lastXPTime) {
            const newMinutes = totalMinutesWatched - this.lastXPTime;
            const newXP = newMinutes * 5; // 5 XP per minute
            
            this.earnedXP += newXP;
            this.lastXPTime = totalMinutesWatched;
            
            console.log(`Awarding ${newXP} XP for ${newMinutes} minutes watched`);
            
            this.awardVideoXP(newXP);
            this.showXPNotification(newXP, newMinutes);
        }
    }

    // Check if video is currently playing
    isVideoPlaying() {
        try {
            if (this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none') {
                return this.youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING;
            } else if (this.elements.customVideo) {
                return !this.elements.customVideo.paused && !this.elements.customVideo.ended;
            }
        } catch (error) {
            console.warn('Could not check video playing state:', error);
        }
        return false;
    }

    // Award XP for video watching
    async awardVideoXP(xpAmount) {
        if (!database || xpAmount <= 0) return;
        
        try {
            console.log(`Awarding ${xpAmount} XP to user ${this.userId}`);
            
            // Update user stats - ADD to existing XP
            const userStatsRef = database.ref(`userStats/${this.userId}`);
            await userStatsRef.transaction((currentStats) => {
                if (!currentStats) {
                    currentStats = { xp: 0, videoXP: 0 };
                }
                
                // Add video XP to both videoXP and total xp
                currentStats.videoXP = (currentStats.videoXP || 0) + xpAmount;
                currentStats.xp = (currentStats.xp || 0) + xpAmount;
                
                return currentStats;
            });
            
            // Save detailed video progress
            const progressRef = database.ref(`videoProgress/${this.userId}/${this.videoId}`);
            const currentProgress = await progressRef.child('earnedXP').once('value');
            await progressRef.update({
                earnedXP: (currentProgress.val() || 0) + xpAmount,
                lastWatched: Date.now(),
                totalMinutesWatched: this.lastXPTime
            });
            

            
            console.log(`Successfully awarded ${xpAmount} video XP`);
        } catch (error) {
            console.error('Error awarding video XP:', error);
        }
    }

    // Show XP notification popup
    showXPNotification(xpAmount, minutes) {
        console.log(`Showing XP notification: +${xpAmount} XP for ${minutes} minutes`);
        
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.xp-notification');
        existingNotifications.forEach(notif => notif.remove());
        
        // Create XP notification popup
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-notification-content">
                <div class="xp-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="xp-text">
                    <h3>XP Earned!</h3>
                    <p>+${xpAmount} XP for ${minutes} minute${minutes !== 1 ? 's' : ''} of video watching</p>
                    <div class="xp-progress">
                        <div class="xp-progress-bar" style="width: 100%"></div>
                    </div>
                </div>
                <button class="xp-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
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


}

// Global Functions
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPlayer();
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (window.videoPlayer) {
        if (window.videoPlayer.viewTimer) {
            clearTimeout(window.videoPlayer.viewTimer);
        }
        if (window.videoPlayer.xpTimer) {
            clearInterval(window.videoPlayer.xpTimer);
        }
        
        // Save final watch time and XP
        if (window.videoPlayer.earnedXP > 0) {
            window.videoPlayer.saveVideoProgress();
        }
    }
});

// Add method to setup video event tracking
VideoPlayer.prototype.setupVideoEventTracking = function() {
    // YouTube player events
    if (this.youtubePlayer) {
        this.youtubePlayer.addEventListener('onStateChange', (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
                this.onVideoPlay();
            } else if (event.data === YT.PlayerState.PAUSED) {
                this.onVideoPause();
            }
        });
    }
    
    // MP4 player events
    if (this.elements.customVideo) {
        this.elements.customVideo.addEventListener('play', () => this.onVideoPlay());
        this.elements.customVideo.addEventListener('pause', () => this.onVideoPause());
        this.elements.customVideo.addEventListener('ended', () => this.onVideoPause());
    }
};

// Handle video play event
VideoPlayer.prototype.onVideoPlay = function() {
    console.log('Video started playing');
    if (!this.watchStartTime) {
        this.watchStartTime = Date.now();
    }
    this.lastPlayTime = Date.now();
};

// Handle video pause event
VideoPlayer.prototype.onVideoPause = function() {
    console.log('Video paused/stopped');
    if (this.lastPlayTime) {
        const sessionTime = Date.now() - this.lastPlayTime;
        this.totalWatchTime += sessionTime;
        console.log(`Session watch time: ${Math.floor(sessionTime / 1000)} seconds`);
    }
};

// Add method to save video progress
VideoPlayer.prototype.saveVideoProgress = async function() {
    if (!database) return;
    
    try {
        const currentTime = this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none' 
            ? this.youtubePlayer.getCurrentTime() 
            : this.elements.customVideo?.currentTime || 0;
            
        const duration = this.youtubePlayer && this.elements.youtubePlayer.style.display !== 'none'
            ? this.youtubePlayer.getDuration()
            : this.elements.customVideo?.duration || 0;
        
        const progressData = {
            videoId: this.videoId,
            userId: this.userId,
            currentTime: currentTime,
            duration: duration,
            watchTime: this.totalWatchTime,
            earnedXP: this.earnedXP,
            lastWatched: Date.now(),
            totalMinutesWatched: this.lastXPTime,
            completed: duration > 0 && currentTime >= duration * 0.9
        };
        
        await database.ref(`videoProgress/${this.userId}/${this.videoId}`).set(progressData);
        console.log('Video progress saved:', progressData);
        
    } catch (error) {
        console.error('Error saving video progress:', error);
    }
};