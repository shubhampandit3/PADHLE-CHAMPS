// Student Doubts JavaScript

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
    loadStudentDoubts();
    
    // Form submission
    document.getElementById('doubtForm').addEventListener('submit', submitDoubt);
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
        
        // Redirect teachers to teacher doubts page
        if (currentUser.role === 'Teacher' || currentUser.role === 'teacher') {
            window.location.href = 'teacher-doubts.html';
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
        document.getElementById('studentName').textContent = currentUser.name.split(' ')[0];
    }
}

// Submit doubt
async function submitDoubt(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const priority = document.getElementById('priority').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    
    if (!subject || !title || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const doubtData = {
            studentId: currentUser.userId,
            studentName: currentUser.name,
            subject: subject,
            priority: priority,
            title: title,
            description: description,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        // Save to Firebase
        const doubtsRef = database.ref('doubts');
        await doubtsRef.push(doubtData);
        
        // Reset form
        document.getElementById('doubtForm').reset();
        
        // Show success message
        showNotification('Doubt submitted successfully! Our teachers will respond soon.', 'success');
        
        // Reload doubts
        loadStudentDoubts();
        
    } catch (error) {
        console.error('Error submitting doubt:', error);
        showNotification('Error submitting doubt. Please try again.', 'error');
    }
}

// Load student doubts
async function loadStudentDoubts() {
    try {
        const doubtsRef = database.ref('doubts');
        const snapshot = await doubtsRef.once('value');
        const doubtsData = snapshot.val();
        
        allDoubts = [];
        
        if (doubtsData) {
            Object.keys(doubtsData).forEach(key => {
                const doubt = doubtsData[key];
                if (doubt.studentId === currentUser.userId) {
                    allDoubts.push({
                        id: key,
                        ...doubt
                    });
                }
            });
        }
        
        // Sort by creation date (newest first)
        allDoubts.sort((a, b) => b.createdAt - a.createdAt);
        
        displayDoubts();
        
    } catch (error) {
        console.error('Error loading doubts:', error);
        showNotification('Error loading doubts. Please refresh the page.', 'error');
    }
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
                </div>
                <div class="doubt-meta">
                    <i class="fas fa-clock"></i> ${formatDate(doubt.createdAt)}
                    ${doubt.updatedAt !== doubt.createdAt ? `<br>Updated: ${formatDate(doubt.updatedAt)}` : ''}
                </div>
            </div>
            
            <div class="doubt-content">
                <p>${doubt.description}</p>
            </div>
            
            ${doubt.answer ? `
                <div class="answer-box">
                    <div class="answer-header">
                        <i class="fas fa-user-tie"></i>
                        <span>Teacher's Answer</span>
                        ${doubt.teacherName ? `<span style="font-weight: normal; color: #6b7280;">by ${doubt.teacherName}</span>` : ''}
                    </div>
                    <p>${doubt.answer}</p>
                    ${doubt.answeredAt ? `<div style="font-size: 0.875rem; color: #6b7280; margin-top: 8px;">Answered on ${formatDate(doubt.answeredAt)}</div>` : ''}
                </div>
            ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                    <span style="color: #6b7280; font-size: 0.875rem;">
                        <i class="fas fa-hourglass-half" style="margin-right: 4px;"></i>
                        Waiting for teacher response...
                    </span>
                    <button onclick="deleteDoubt('${doubt.id}')" class="delete-btn">
                        <i class="fas fa-trash" style="margin-right: 4px;"></i>Delete
                    </button>
                </div>
            `}
        </div>
    `).join('');
    
    container.innerHTML = doubtsHTML;
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

// Delete doubt
async function deleteDoubt(doubtId) {
    if (!confirm('Are you sure you want to delete this doubt?')) {
        return;
    }
    
    try {
        await database.ref(`doubts/${doubtId}`).remove();
        showNotification('Doubt deleted successfully', 'success');
        loadStudentDoubts();
    } catch (error) {
        console.error('Error deleting doubt:', error);
        showNotification('Error deleting doubt. Please try again.', 'error');
    }
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

// Scroll to form
function scrollToForm() {
    document.querySelector('.ask-doubt-form').scrollIntoView({
        behavior: 'smooth'
    });
}