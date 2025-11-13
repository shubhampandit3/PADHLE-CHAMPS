// Signup JavaScript for Padhle Champs

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
const signupForm = document.getElementById('signupForm');

// Role-based field toggling
roleSelect.addEventListener('change', function() {
    const selectedRole = this.value;
    
    if (selectedRole === 'Student') {
        studentFields.classList.remove('hidden');
        studentFields.classList.add('fade-in');
        teacherFields.classList.add('hidden');
        
        // Make student fields required
        document.getElementById('class').required = true;
        document.getElementById('schoolName').required = true;
        
        // Remove teacher field requirements
        document.getElementById('dob').required = false;
        document.getElementById('teacherId').required = false;
        
    } else if (selectedRole === 'Teacher') {
        teacherFields.classList.remove('hidden');
        teacherFields.classList.add('fade-in');
        studentFields.classList.add('hidden');
        
        // Make teacher fields required
        document.getElementById('dob').required = true;
        document.getElementById('teacherId').required = true;
        
        // Remove student field requirements
        document.getElementById('class').required = false;
        document.getElementById('schoolName').required = false;
        
    } else {
        studentFields.classList.add('hidden');
        teacherFields.classList.add('hidden');
    }
});

// Form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Check if user already exists
        const userExists = await checkUserExists(formData);
        if (userExists) {
            showMessage('User already exists with this information!', 'error');
            showLoading(false);
            return;
        }
        
        // Create user in Firebase
        const newUser = await createUser(formData);
        
        // Store user session immediately after signup
        storeUserSession(newUser);
        
        showMessage('Account created successfully!', 'success');
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
            window.location.href = 'profile.html?role=' + formData.role.toLowerCase();
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Error creating account. Please try again.', 'error');
        showLoading(false);
    }
});

// Get form data
function getFormData() {
    const role = document.getElementById('role').value;
    const data = {
        name: document.getElementById('name').value.trim(),
        role: role,
        age: parseInt(document.getElementById('age').value),
        timestamp: Date.now()
    };
    
    if (role === 'Student') {
        data.class = document.getElementById('class').value;
        data.schoolName = document.getElementById('schoolName').value.trim();
    } else if (role === 'Teacher') {
        data.dob = document.getElementById('dob').value;
        data.teacherId = document.getElementById('teacherId').value.trim();
    }
    
    return data;
}

// Validate form
function validateForm(data) {
    if (!data.name || !data.role || !data.age) {
        showMessage('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (data.role === 'Student') {
        if (!data.class || !data.schoolName) {
            showMessage('Please fill in class and school name.', 'error');
            return false;
        }
    } else if (data.role === 'Teacher') {
        if (!data.dob || !data.teacherId) {
            showMessage('Please fill in date of birth and teacher ID.', 'error');
            return false;
        }
        
        // Validate teacher ID
        if (data.teacherId !== 'PC450') {
            handleInvalidTeacherId();
            return false;
        }
    }
    
    if (data.role === 'Teacher' && (data.age < 14 || data.age > 100)) {
        showMessage('Teacher age must be between 14 and 100.', 'error');
        return false;
    } else if (data.role === 'Student' && (data.age < 5 || data.age > 100)) {
        showMessage('Student age must be between 5 and 100.', 'error');
        return false;
    }
    
    return true;
}

// Check if user already exists
async function checkUserExists(userData) {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();
        
        if (!users) return false;
        
        // Check for duplicate based on role
        for (let userId in users) {
            const user = users[userId];
            
            if (user.role === userData.role && user.name.toLowerCase() === userData.name.toLowerCase()) {
                if (userData.role === 'Student') {
                    if (user.class === userData.class) {
                        return true;
                    }
                } else if (userData.role === 'Teacher') {
                    if (user.teacherId === userData.teacherId) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
}

// Create user in Firebase
async function createUser(userData) {
    try {
        const usersRef = database.ref('users');
        const newUserRef = usersRef.push();
        
        // Add user ID to data
        userData.userId = newUserRef.key;
        
        // Bot assignment placeholder
        userData.assignedBot = {
            botId: generateBotId(),
            status: 'pending',
            assignedAt: Date.now()
        };
        
        await newUserRef.set(userData);
        
        console.log('User created successfully:', userData.userId);
        
        return userData;
        
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Store user session
function storeUserSession(user) {
    const sessionData = {
        userId: user.userId,
        name: user.name,
        role: user.role,
        age: user.age,
        class: user.class || null,
        schoolName: user.schoolName || null,
        dob: user.dob || null,
        teacherId: user.teacherId || null,
        loginTime: Date.now(),
        assignedBot: user.assignedBot || null
    };
    
    localStorage.setItem('padhleChamps_user', JSON.stringify(sessionData));
    sessionStorage.setItem('padhleChamps_session', JSON.stringify(sessionData));
    
    console.log('User session stored:', sessionData);
}

// Generate bot ID (placeholder for future bot integration)
function generateBotId() {
    return 'bot_' + Math.random().toString(36).substr(2, 9);
}

// Show loading state
function showLoading(isLoading) {
    const form = document.getElementById('signupForm');
    const submitBtn = form.querySelector('.submit-btn');
    
    if (isLoading) {
        form.classList.add('loading');
        submitBtn.innerHTML = '<span class="material-icons-outlined btn-icon">hourglass_empty</span><span>Creating Account...</span>';
    } else {
        form.classList.remove('loading');
        submitBtn.innerHTML = '<span class="material-icons-outlined btn-icon">person_add</span><span>Create Account</span><span class="material-icons-outlined btn-arrow">arrow_forward</span>';
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
    const form = document.getElementById('signupForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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