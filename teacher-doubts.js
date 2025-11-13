// Teacher Doubts JavaScript

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

let currentUser = null;
let allDoubts = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    checkUserLogin();
    loadUserData();
    loadAllDoubts();
});

// Check if user is logged in
function checkUserLogin() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
        
        // Redirect students to student doubts page
        if (currentUser.role === 'Student' || currentUser.role === 'student') {
            window.location.href = 'student-doubts.html';
            return;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
    }
}

// Load user data
function loadUserData() {
    if (currentUser) {
        document.getElementById('teacherName').textContent = currentUser.name.split(' ')[0];
    }
}

// Load all doubts
async function loadAllDoubts() {
    try {
        const doubtsRef = database.ref('doubts');
        const snapshot = await doubtsRef.once('value');
        const doubtsData = snapshot.val();
        
        allDoubts = [];
        
        if (doubtsData) {
            Object.keys(doubtsData).forEach(key => {
                const doubt = doubtsData[key];
                allDoubts.push({
                    id: key,
                    ...doubt
                });
            });
        }
        
        // Sort by priority and creation date
        allDoubts.sort((a, b) => {
            // First sort by priority (High > Medium > Low)
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by status (pending first)
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            
            // Finally by creation date (newest first)
            return b.createdAt - a.createdAt;
        });
        
        updateStats();
        displayDoubts();
        
    } catch (error) {
        console.error('Error loading doubts:', error);
        showNotification('Error loading doubts. Please refresh the page.', 'error');
    }
}

// Update statistics
function updateStats() {
    const total = allDoubts.length;
    const pending = allDoubts.filter(doubt => doubt.status === 'pending').length;
    const answered = allDoubts.filter(doubt => doubt.status === 'answered').length;
    const highPriority = allDoubts.filter(doubt => doubt.priority === 'High').length;
    
    document.getElementById('totalDoubts').textContent = total;
    document.getElementById('pendingDoubts').textContent = pending;
    document.getElementById('answeredDoubts').textContent = answered;
    document.getElementById('highPriorityDoubts').textContent = highPriority;
}

// Display doubts
function displayDoubts() {
    const container = document.getElementById('doubtsList');
    const emptyState = document.getElementById('emptyState');
    
    // Filter doubts based on current filter
    let filteredDoubts = allDoubts;
    
    if (currentFilter === 'pending') {
        filteredDoubts = allDoubts.filter(doubt => doubt.status === 'pending');
    } else if (currentFilter === 'answered') {
        filteredDoubts = allDoubts.filter(doubt => doubt.status === 'answered');
    } else if (currentFilter === 'high') {
        filteredDoubts = allDoubts.filter(doubt => doubt.priority === 'High');
    } else if (currentFilter === 'recent') {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        filteredDoubts = allDoubts.filter(doubt => doubt.createdAt > oneDayAgo);
    }
    
    if (filteredDoubts.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    const doubtsHTML = filteredDoubts.map(doubt => `
        <div class="doubt-item" data-aos="fade-up">
            <div class="doubt-header">
                <div>
                    <div class="doubt-badges">
                        <span class="badge ${doubt.status === 'pending' ? 'badge-pending' : 'badge-answered'}">
                            ${doubt.status}
                        </span>
                        <span class="badge badge-${doubt.priority.toLowerCase()}">
                            ${doubt.priority}
                        </span>
                        <span class="badge" style="background: #f3f4f6; color: #6b7280;">
                            ${doubt.subject}
                        </span>
                    </div>
                    <h3 class="doubt-title">${doubt.title}</h3>
                    <div class="doubt-student">
                        <i class="fas fa-user"></i> ${doubt.studentName}
                    </div>
                </div>
                <div class="doubt-meta">
                    <i class="fas fa-clock"></i> ${formatDate(doubt.createdAt)}
                </div>
            </div>
            
            <div class="doubt-content">
                <p>${doubt.description}</p>
            </div>
            
            ${doubt.status === 'answered' ? `
                <div class="answered-box">
                    <div class="answered-header">
                        <i class="fas fa-check-circle"></i>
                        <span>Your Answer</span>
                        ${doubt.answeredAt ? `<span style="font-weight: normal; color: #6b7280;">• Answered on ${formatDate(doubt.answeredAt)}</span>` : ''}
                    </div>
                    <p>${doubt.answer}</p>
                </div>
            ` : `
                <div class="answer-form">
                    <h4 class="form-title">
                        <i class="fas fa-reply"></i>Provide Answer
                    </h4>
                    <textarea 
                        class="form-input" 
                        rows="4" 
                        placeholder="Type your detailed answer here..."
                        id="answer-${doubt.id}"
                    ></textarea>
                    <div style="text-align: right;">
                        <button 
                            onclick="submitAnswer('${doubt.id}')" 
                            class="answer-btn"
                        >
                            <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                            Submit Answer
                        </button>
                    </div>
                </div>
            `}
        </div>
    `).join('');
    
    container.innerHTML = doubtsHTML;
}

// Submit answer
async function submitAnswer(doubtId) {
    const answerTextarea = document.getElementById(`answer-${doubtId}`);
    const answer = answerTextarea.value.trim();
    
    if (!answer) {
        showNotification('Please provide an answer before submitting.', 'error');
        return;
    }
    
    try {
        const updateData = {
            answer: answer,
            status: 'answered',
            teacherName: currentUser.name,
            teacherId: currentUser.userId,
            answeredAt: Date.now(),
            updatedAt: Date.now()
        };
        
        await database.ref(`doubts/${doubtId}`).update(updateData);
        
        showNotification('Answer submitted successfully!', 'success');
        
        // Reload doubts to reflect changes
        loadAllDoubts();
        
    } catch (error) {
        console.error('Error submitting answer:', error);
        showNotification('Error submitting answer. Please try again.', 'error');
    }
}

// Filter doubts
function filterDoubts(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayDoubts();
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
        notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
        notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Real-time updates
database.ref('doubts').on('value', (snapshot) => {
    // Reload doubts when there are changes
    loadAllDoubts();
});