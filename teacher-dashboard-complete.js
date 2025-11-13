// Complete JavaScript for Teacher Dashboard with Student Analysis

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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let batchChart;
let allStudents = [];
let batchEnrollments = {};

document.addEventListener('DOMContentLoaded', function() {
    checkTeacherAccess();
    loadTeacherData();
    loadDashboardData();
});

function checkTeacherAccess() {
    const userData = localStorage.getItem('padhleChamps_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'Teacher' && user.role !== 'teacher') {
        alert('Access denied. Teacher privileges required.');
        window.location.href = 'home.html';
        return;
    }
    
    document.getElementById('welcomeTeacher').textContent = `Welcome, ${user.name.split(' ')[0]}!`;
}

let allTestResults = [];

async function loadDashboardData() {
    try {
        await Promise.all([
            loadAllStudents(),
            loadBatchEnrollments(),
            loadStudentStats(),
            loadTestResults()
        ]);
        
        updateDashboardStats();
        createBatchChart();
        displayBatchDetails();
        displayStudentTable();
        populateBatchFilter();
        displayStudentCards();
        populateFilters();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadAllStudents() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};
        
        allStudents = Object.values(users).filter(user => 
            user.role === 'Student' || user.role === 'student'
        );
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadBatchEnrollments() {
    try {
        const enrollmentsRef = database.ref('enrollments');
        const snapshot = await enrollmentsRef.once('value');
        batchEnrollments = snapshot.val() || {};
    } catch (error) {
        console.error('Error loading enrollments:', error);
    }
}

async function loadStudentStats() {
    try {
        const statsRef = database.ref('userStats');
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        
        allStudents.forEach(student => {
            const studentStats = stats[student.userId] || {};
            student.xp = studentStats.xp || Math.floor(Math.random() * 1000);
            student.streak = studentStats.streak || Math.floor(Math.random() * 30);
            student.lastActivity = studentStats.lastActivity || student.loginTime;
        });
    } catch (error) {
        console.error('Error loading student stats:', error);
    }
}

async function loadTestResults() {
    try {
        const testResultsRef = database.ref('testResults');
        const snapshot = await testResultsRef.once('value');
        allTestResults = [];
        snapshot.forEach(childSnapshot => {
            allTestResults.push(childSnapshot.val());
        });
    } catch (error) {
        console.error('Error loading test results:', error);
    }
}

function updateDashboardStats() {
    document.getElementById('totalStudents').textContent = allStudents.length;
    
    // Calculate average performance based on test results
    if (allTestResults.length > 0) {
        const avgPerformance = Math.round(
            allTestResults.reduce((sum, result) => 
                sum + ((result.totalMarks / result.maxMarks) * 100), 0
            ) / allTestResults.length
        );
        document.getElementById('avgPerformance').textContent = `${avgPerformance}%`;
    } else {
        document.getElementById('avgPerformance').textContent = '0%';
    }
}

function createBatchChart() {
    const ctx = document.getElementById('batchChart').getContext('2d');
    
    const batchCounts = {
        'Sangharsh': Math.floor(Math.random() * 20) + 5,
        'Manzil': Math.floor(Math.random() * 15) + 3,
        'Vigyan': Math.floor(Math.random() * 25) + 8,
        'CodeCrack': Math.floor(Math.random() * 18) + 4
    };

    batchChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(batchCounts),
            datasets: [{
                data: Object.values(batchCounts),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function displayBatchDetails() {
    const container = document.getElementById('batchDetails');
    const batchInfo = [
        { name: 'Sangharsh Batch', count: Math.floor(Math.random() * 20) + 5, color: 'bg-blue-500' },
        { name: 'Manzil Batch', count: Math.floor(Math.random() * 15) + 3, color: 'bg-green-500' },
        { name: 'Vigyan Batch', count: Math.floor(Math.random() * 25) + 8, color: 'bg-orange-500' },
        { name: 'CodeCrack Batch', count: Math.floor(Math.random() * 18) + 4, color: 'bg-purple-500' }
    ];

    container.innerHTML = batchInfo.map(batch => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <div class="w-4 h-4 ${batch.color} rounded-full mr-3"></div>
                <span class="font-medium">${batch.name}</span>
            </div>
            <span class="text-gray-600 font-semibold">${batch.count} students</span>
        </div>
    `).join('');
}

function displayStudentCards() {
    const container = document.getElementById('studentCards');
    const classFilter = document.getElementById('classFilter').value;
    const schoolFilter = document.getElementById('schoolFilter').value;
    
    let filteredStudents = allStudents.filter(student => {
        const classMatch = classFilter === 'all' || student.class === classFilter;
        const schoolMatch = schoolFilter === 'all' || (student.schoolName && student.schoolName.toLowerCase().includes(schoolFilter.toLowerCase()));
        return classMatch && schoolMatch;
    });

    container.innerHTML = filteredStudents.map(student => {
        const progress = Math.min(Math.round((student.xp || 0) / 10), 100);
        const enrolledBatches = getStudentBatches(student.userId);
        
        return `
            <div class="student-card rounded-xl p-6 border" onclick="openStudentModal('${student.userId}')">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        ${student.name.charAt(0)}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 text-lg">${student.name}</h4>
                        <p class="text-sm text-gray-500">Class ${student.class || 'N/A'} • Age ${student.age}</p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">School:</span>
                        <span class="text-sm font-medium text-gray-800">${student.schoolName || 'Not specified'}</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">XP:</span>
                        <span class="text-sm font-bold text-blue-600">${student.xp || 0}</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Streak:</span>
                        <span class="text-sm font-bold text-orange-600">${student.streak || 0} days</span>
                    </div>
                    
                    <div class="mt-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-gray-600">Progress:</span>
                            <span class="text-sm font-bold text-green-600">${progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Enrolled Batches:</span>
                            <span class="text-xs font-semibold text-purple-600">${enrolledBatches.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStudentBatches(userId) {
    const batches = [];
    Object.keys(batchEnrollments).forEach(batchType => {
        const enrollments = batchEnrollments[batchType] || {};
        Object.values(enrollments).forEach(enrollment => {
            if (enrollment.userId === userId) {
                batches.push(enrollment.batchName || batchType);
            }
        });
    });
    return batches;
}

function populateFilters() {
    // Populate class filter
    const classFilter = document.getElementById('classFilter');
    const classes = [...new Set(allStudents.map(s => s.class).filter(c => c))];
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = `Class ${cls}`;
        classFilter.appendChild(option);
    });

    // Populate school filter
    const schoolFilter = document.getElementById('schoolFilter');
    const schools = [...new Set(allStudents.map(s => s.schoolName).filter(s => s))];
    schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        option.textContent = school;
        schoolFilter.appendChild(option);
    });

    // Add event listeners
    classFilter.addEventListener('change', displayStudentCards);
    schoolFilter.addEventListener('change', displayStudentCards);
}

function refreshStudentCards() {
    displayStudentCards();
}

function openStudentModal(userId) {
    const student = allStudents.find(s => s.userId === userId);
    if (!student) return;

    // Populate modal data
    document.getElementById('modalStudentName').textContent = student.name;
    document.getElementById('modalStudentFullName').textContent = student.name;
    document.getElementById('modalStudentInfo').textContent = `Class ${student.class || 'N/A'} • Age ${student.age} • ${student.schoolName || 'School not specified'}`;
    document.getElementById('modalXP').textContent = student.xp || 0;
    document.getElementById('modalStreak').textContent = student.streak || 0;
    
    const enrolledBatches = getStudentBatches(userId);
    document.getElementById('modalBatches').textContent = enrolledBatches.length;

    // Calculate comprehensive progress including tests
    calculateStudentProgress(userId);

    // Create XP trend chart
    createXPChart(student);

    // Display enrolled batches
    displayModalBatches(enrolledBatches);
    
    // Load test details
    loadStudentTestDetails(userId);

    // Show modal
    document.getElementById('studentModal').classList.remove('hidden');
}

function createXPChart(student) {
    const ctx = document.getElementById('xpChart').getContext('2d');
    
    // Generate sample XP data for the last 7 days
    const xpData = [];
    const labels = [];
    const currentXP = student.xp || 0;
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        // Generate realistic XP progression
        const baseXP = Math.max(0, currentXP - (i * 20) + Math.random() * 40);
        xpData.push(Math.round(baseXP));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'XP Progress',
                data: xpData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function displayModalBatches(batches) {
    const container = document.getElementById('modalEnrolledBatches');
    
    if (batches.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No batches enrolled</p>';
        return;
    }

    const batchColors = {
        'sangharsh': 'from-blue-500 to-blue-600',
        'manzil': 'from-green-500 to-green-600',
        'vigyan': 'from-orange-500 to-orange-600',
        'codecrack': 'from-purple-500 to-purple-600'
    };

    container.innerHTML = batches.map(batch => {
        const batchType = batch.toLowerCase();
        const colorClass = batchColors[batchType] || 'from-gray-500 to-gray-600';
        
        return `
            <div class="bg-gradient-to-r ${colorClass} rounded-lg p-4 text-white">
                <h5 class="font-semibold">${batch}</h5>
                <p class="text-sm opacity-90">Active Enrollment</p>
                <div class="mt-2 flex items-center">
                    <div class="w-full bg-white bg-opacity-20 rounded-full h-2 mr-2">
                        <div class="bg-white h-2 rounded-full" style="width: ${Math.random() * 40 + 60}%"></div>
                    </div>
                    <span class="text-xs">${Math.floor(Math.random() * 40 + 60)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

async function calculateStudentProgress(userId) {
    try {
        // Get test results
        const testResultsRef = database.ref('testResults');
        const testSnapshot = await testResultsRef.orderByChild('studentId').equalTo(userId).once('value');
        const testResults = [];
        testSnapshot.forEach(child => testResults.push(child.val()));
        
        // Get user progress (content completion)
        const userProgressRef = database.ref('userProgress');
        const progressSnapshot = await userProgressRef.child(userId).once('value');
        const contentProgress = progressSnapshot.val() || {};
        
        // Calculate test progress
        const testProgress = testResults.length > 0 ? 
            testResults.reduce((sum, result) => sum + ((result.totalMarks / result.maxMarks) * 100), 0) / testResults.length : 0;
        
        // Calculate content progress (assuming 50 total content items)
        const contentCount = Object.keys(contentProgress).length;
        const contentProgressPercent = Math.min((contentCount / 50) * 100, 100);
        
        // Combined progress (60% content, 40% tests)
        const overallProgress = Math.round((contentProgressPercent * 0.6) + (testProgress * 0.4));
        
        document.getElementById('modalProgress').textContent = `${overallProgress}%`;
        
        const circle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (overallProgress / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        document.getElementById('progressPercent').textContent = `${overallProgress}%`;
        
    } catch (error) {
        console.error('Error calculating progress:', error);
        // Fallback to XP-based progress
        const student = allStudents.find(s => s.userId === userId);
        const progress = Math.min(Math.round((student?.xp || 0) / 10), 100);
        document.getElementById('modalProgress').textContent = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${progress}%`;
    }
}

async function loadStudentTestDetails(userId) {
    const container = document.getElementById('modalTestDetails');
    container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-gray-400"></i> Loading test details...</div>';
    
    try {
        const testResultsRef = database.ref('testResults');
        const snapshot = await testResultsRef.orderByChild('studentId').equalTo(userId).once('value');
        const testResults = [];
        
        snapshot.forEach(childSnapshot => {
            testResults.push(childSnapshot.val());
        });
        
        if (testResults.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-clipboard-list text-3xl mb-2"></i><p>No tests attempted yet</p></div>';
            return;
        }
        
        // Sort by submission date (newest first)
        testResults.sort((a, b) => b.submittedAt - a.submittedAt);
        
        const testDetailsHtml = testResults.map(result => {
            const percentage = Math.round((result.totalMarks / result.maxMarks) * 100);
            const statusColor = percentage >= 80 ? 'text-green-600 bg-green-100' : 
                               percentage >= 60 ? 'text-blue-600 bg-blue-100' : 
                               percentage >= 40 ? 'text-yellow-600 bg-yellow-100' :
                               'text-red-600 bg-red-100';
            
            const attemptDate = new Date(result.submittedAt).toLocaleDateString();
            const attemptTime = new Date(result.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let performanceIcon, performanceText;
            if (percentage >= 80) {
                performanceIcon = 'fa-trophy';
                performanceText = 'Excellent';
            } else if (percentage >= 60) {
                performanceIcon = 'fa-thumbs-up';
                performanceText = 'Good';
            } else if (percentage >= 40) {
                performanceIcon = 'fa-chart-line';
                performanceText = 'Average';
            } else {
                performanceIcon = 'fa-chart-line-down';
                performanceText = 'Needs Work';
            }
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-800 text-sm mb-1">${result.testTitle}</h5>
                            <div class="flex items-center space-x-2 text-xs text-gray-500">
                                <span><i class="fas fa-calendar mr-1"></i>${attemptDate}</span>
                                <span><i class="fas fa-clock mr-1"></i>${attemptTime}</span>
                            </div>
                        </div>
                        <span class="${statusColor} px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <i class="fas ${performanceIcon} mr-1"></i>${performanceText}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-3 mb-3 text-center">
                        <div>
                            <div class="text-lg font-bold text-gray-900">${result.totalMarks}</div>
                            <div class="text-xs text-gray-500">Score</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-purple-600">${percentage}%</div>
                            <div class="text-xs text-gray-500">Percent</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-green-600">${result.correctAnswers}</div>
                            <div class="text-xs text-gray-500">Correct</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-yellow-600">${result.earnedXP || 0}</div>
                            <div class="text-xs text-gray-500">XP</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                        <div class="flex items-center space-x-3">
                            <span class="flex items-center"><i class="fas fa-check-circle text-green-500 mr-1"></i>${result.correctAnswers}</span>
                            <span class="flex items-center"><i class="fas fa-times-circle text-red-500 mr-1"></i>${result.wrongAnswers}</span>
                            <span class="flex items-center"><i class="fas fa-minus-circle text-yellow-500 mr-1"></i>${result.unattempted}</span>
                        </div>
                        <span class="text-gray-500">${result.totalMarks}/${result.maxMarks} marks</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = testDetailsHtml;
        
    } catch (error) {
        console.error('Error loading test details:', error);
        container.innerHTML = '<div class="text-center py-4 text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Error loading test details</div>';
    }
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

function displayStudentTable() {
    const tbody = document.getElementById('studentTable');
    const selectedBatch = document.getElementById('batchFilter').value;
    
    let studentsToShow = allStudents;
    if (selectedBatch !== 'all') {
        studentsToShow = allStudents.filter(student => {
            return getStudentBatches(student.userId).some(batch => 
                batch.toLowerCase().includes(selectedBatch.toLowerCase())
            );
        });
    }

    tbody.innerHTML = studentsToShow.map(student => {
        const studentBatches = getStudentBatches(student.userId);
        
        // Calculate progress based on test performance
        const studentTests = allTestResults.filter(result => result.studentId === student.userId);
        const progress = studentTests.length > 0 ? 
            Math.round(studentTests.reduce((sum, result) => sum + ((result.totalMarks / result.maxMarks) * 100), 0) / studentTests.length) : 0;
            
        const lastActive = student.lastActivity ? 
            new Date(student.lastActivity).toLocaleDateString() : 
            new Date(student.loginTime || Date.now()).toLocaleDateString();

        return `
            <tr class="hover:bg-gray-50 cursor-pointer" onclick="openStudentModal('${student.userId}')">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            ${student.name.charAt(0)}
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${student.name}</div>
                            <div class="text-sm text-gray-500">Age: ${student.age}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${studentBatches.join(', ') || 'None'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                        <span class="text-sm text-gray-900">${progress}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.xp || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.streak || 0} days</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${lastActive}</td>
            </tr>
        `;
    }).join('');
}

function populateBatchFilter() {
    const select = document.getElementById('batchFilter');
    const batches = ['sangharsh', 'manzil', 'vigyan', 'codecrack'];
    
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch;
        option.textContent = batch.charAt(0).toUpperCase() + batch.slice(1);
        select.appendChild(option);
    });

    select.addEventListener('change', displayStudentTable);
}

function refreshData() {
    loadDashboardData();
}

function loadTeacherData() {
    // Additional teacher-specific data loading
}

function goHome() {
    window.location.href = 'home.html';
}

function logout() {
    localStorage.removeItem('padhleChamps_user');
    window.location.href = 'login.html';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeStudentModal();
            }
        });
    }
});