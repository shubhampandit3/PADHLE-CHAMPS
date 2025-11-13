// Login JavaScript for Padhle Champs

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

// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
});

// DOM Elements
const roleSelect = document.getElementById('role');
const studentFields = document.getElementById('studentFields');
const teacherFields = document.getElementById('teacherFields');
const loginForm = document.getElementById('loginForm');

// Role-based field toggling
roleSelect.addEventListener('change', function() {
    const selectedRole = this.value;
    
    if (selectedRole === 'Student') {
        studentFields.classList.remove('hidden');
        studentFields.classList.add('fade-in');
        teacherFields.classList.add('hidden');
        
        // Make student fields required
        document.getElementById('class').required = true;
        
        // Remove teacher field requirements
        document.getElementById('age').required = false;
        document.getElementById('dob').required = false;
        document.getElementById('teacherId').required = false;
        
    } else if (selectedRole === 'Teacher') {
        teacherFields.classList.remove('hidden');
        teacherFields.classList.add('fade-in');
        studentFields.classList.add('hidden');
        
        // Make teacher fields required
        document.getElementById('age').required = true;
        document.getElementById('dob').required = true;
        document.getElementById('teacherId').required = true;
        
        // Remove student field requirements
        document.getElementById('class').required = false;
        
    } else {
        studentFields.classList.add('hidden');
        teacherFields.classList.add('hidden');
    }
});

// Form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Verify user credentials
        const user = await verifyUser(formData);
        
        if (user) {
            showMessage('Login successful! Redirecting...', 'success');
            
            // Store user session
            storeUserSession(user);
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                redirectToDashboard(user.role);
            }, 2000);
            
        } else {
            showMessage('Invalid credentials. Please check your information.', 'error');
            showLoading(false);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error during login. Please try again.', 'error');
        showLoading(false);
    }
});

// Get form data
function getFormData() {
    const role = document.getElementById('role').value;
    const data = {
        name: document.getElementById('name').value.trim(),
        role: role
    };
    
    if (role === 'Student') {
        data.class = document.getElementById('class').value;
    } else if (role === 'Teacher') {
        data.age = parseInt(document.getElementById('age').value);
        data.dob = document.getElementById('dob').value;
        data.teacherId = document.getElementById('teacherId').value.trim();
    }
    
    return data;
}

// Validate form
function validateForm(data) {
    if (!data.name || !data.role) {
        showMessage('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (data.role === 'Student') {
        if (!data.class) {
            showMessage('Please select your class.', 'error');
            return false;
        }
    } else if (data.role === 'Teacher') {
        if (!data.age || !data.dob || !data.teacherId) {
            showMessage('Please fill in age, date of birth, and teacher ID.', 'error');
            return false;
        }
        
        if (data.age < 14 || data.age > 100) {
            showMessage('Teacher age must be between 14 and 100.', 'error');
            return false;
        }
        
        // Validate teacher ID for login
        if (data.teacherId && data.teacherId !== 'PC450') {
            handleInvalidTeacherId();
            return false;
        }
    }
    
    return true;
}

// Verify user credentials
async function verifyUser(loginData) {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();
        
        if (!users) {
            return null;
        }
        
        // Search for matching user
        for (let userId in users) {
            const user = users[userId];
            
            if (user.role === loginData.role && 
                user.name.toLowerCase() === loginData.name.toLowerCase()) {
                
                if (loginData.role === 'Student') {
                    if (user.class === loginData.class) {
                        return user;
                    }
                } else if (loginData.role === 'Teacher') {
                    if (user.age === loginData.age && user.dob === loginData.dob && user.teacherId === loginData.teacherId) {
                        return user;
                    }
                }
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
}

// Store user session
function storeUserSession(user) {
    const sessionData = {
        userId: user.userId,
        name: user.name,
        role: user.role,
        loginTime: Date.now(),
        assignedBot: user.assignedBot || null,
        // Include all user details for profile display
        age: user.age,
        class: user.class,
        schoolName: user.schoolName,
        dob: user.dob,
        teacherId: user.teacherId
    };
    
    // Store in localStorage
    localStorage.setItem('padhleChamps_user', JSON.stringify(sessionData));
    
    // Store in sessionStorage as backup
    sessionStorage.setItem('padhleChamps_session', JSON.stringify(sessionData));
    
    console.log('User session stored:', sessionData);
}

// Redirect to appropriate dashboard
function redirectToDashboard(role) {
    // Both students and teachers go to profile page
    window.location.href = 'profile.html?role=' + role.toLowerCase();
}

// Show loading state
function showLoading(isLoading) {
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('.submit-btn');
    
    if (isLoading) {
        form.classList.add('loading');
        submitBtn.innerHTML = '<span class="material-icons-outlined btn-icon">hourglass_empty</span><span>Logging in...</span>';
    } else {
        form.classList.remove('loading');
        submitBtn.innerHTML = '<span class="material-icons-outlined btn-icon">login</span><span>Login</span><span class="material-icons-outlined btn-arrow">arrow_forward</span>';
    }
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
    messageDiv.textContent = message;
    
    // Insert before form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Check if user is already logged in
function checkExistingSession() {
    const userData = localStorage.getItem('padhleChamps_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const loginTime = user.loginTime;
            const currentTime = Date.now();
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
            
            // Check if session is still valid
            if (currentTime - loginTime < sessionDuration) {
                showMessage('You are already logged in. Redirecting...', 'success');
                setTimeout(() => {
                    redirectToDashboard(user.role);
                }, 1500);
                return true;
            } else {
                // Session expired, clear storage
                localStorage.removeItem('padhleChamps_user');
                sessionStorage.removeItem('padhleChamps_session');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('padhleChamps_user');
        }
    }
    
    return false;
}

// Bot integration placeholder functions
function assignBotToUser(userId) {
    // Placeholder for bot assignment logic
    console.log('Bot assignment for user:', userId);
    // This will be implemented when bot system is ready
}

function updateUserBotStatus(userId, status) {
    // Placeholder for updating bot status
    console.log('Updating bot status for user:', userId, 'Status:', status);
    // This will be implemented when bot system is ready
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session
    checkExistingSession();
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function sanitizeInput(input) {
    return input.replace(/[<>\"']/g, '');
}

// Handle invalid teacher ID attempts
function handleInvalidTeacherId() {
    let attempts = parseInt(localStorage.getItem('teacherIdAttempts') || '0');
    attempts++;
    localStorage.setItem('teacherIdAttempts', attempts.toString());
    
    if (attempts >= 3) {
        showMessage('Too many invalid attempts. Redirecting to profile...', 'error');
        setTimeout(() => {
            window.location.href = 'profile.html?reason=invalid_teacher_id&attempts=' + attempts;
        }, 2000);
    } else {
        showMessage(`Invalid Teacher ID. You have ${3 - attempts} attempts remaining.`, 'error');
    }
}