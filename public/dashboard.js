// API Base URL
const API_URL = 'http://localhost:3000/api';

// Global state
let settings = {};
let userConfig = {};
let countdownInterval;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadUserConfig();
    loadSettings();
    loadStats();
    loadRecentTasks();
});

// Load user configuration
async function loadUserConfig() {
    try {
        const response = await fetch(`${API_URL}/user-config`);
        userConfig = await response.json();
        
        if (userConfig.setup_completed) {
            updateDashboardContent();
        }
    } catch (error) {
        console.error('Error loading user config:', error);
    }
}

// Update dashboard with personalized content
function updateDashboardContent() {
    // Update greeting with time of day and user name
    updateGreeting();
    
    // Update header subtitle if field of study exists
    if (userConfig.study_field) {
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = userConfig.study_field;
        }
    }
    
    // Update motivation cards
    if (userConfig.motivations && userConfig.motivations.length > 0) {
        const motivationCards = document.querySelector('.motivation-cards');
        if (motivationCards) {
            motivationCards.innerHTML = userConfig.motivations.map(m => `
                <div class="motivation-card">
                    <div class="motivation-emoji">${m.emoji}</div>
                    <h3>${escapeHtml(m.title)}</h3>
                    <p>${escapeHtml(m.description)}</p>
                </div>
            `).join('');
        }
    }
}

// Update greeting based on time of day
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let timeOfDay;
    
    // Determine time of day (no "good night" since this is for studying)
    if (hour >= 5 && hour < 12) {
        timeOfDay = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'Good afternoon';
    } else {
        timeOfDay = 'Good evening';
    }
    
    // Add user's name if available
    const userName = userConfig.user_name || '';
    const greeting = userName ? `${timeOfDay}, ${userName}` : timeOfDay;
    
    greetingElement.textContent = greeting;
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        settings = await response.json();
        startCountdown();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        // Update stats display
        document.getElementById('totalStudyTime').textContent = formatTime(stats.totalStudyTime || 0);
        document.getElementById('completedTasks').textContent = stats.completedTasks || 0;
        document.getElementById('todayStudyTime').textContent = formatTime(stats.todayStudyTime || 0);
        
        // Calculate task progress
        const progress = stats.totalTasks > 0 
            ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
            : 0;
        document.getElementById('taskProgress').textContent = `${progress}%`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent tasks
async function loadRecentTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        
        const container = document.getElementById('recentTasks');
        
        if (tasks.length === 0) {
            container.innerHTML = '<p class="loading">No tasks yet. <a href="/tasks">Add your first task!</a></p>';
            return;
        }
        
        // Show only active tasks (limit 5)
        const activeTasks = tasks.filter(t => !t.completed).slice(0, 5);
        
        if (activeTasks.length === 0) {
            container.innerHTML = '<p class="loading">All tasks completed! Great job!</p>';
            return;
        }
        
        container.innerHTML = activeTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
                <span class="task-priority priority-${task.priority}">
                    ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                    ${task.priority}
                </span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Countdown timer
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!settings.exam_date) return;
    
    const examDate = new Date(settings.exam_date);
    const now = new Date();
    const diff = examDate - now;
    
    if (diff <= 0) {
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        clearInterval(countdownInterval);
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Settings modal
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';
    
    // Load current settings
    if (settings.exam_name) {
        document.getElementById('examName').value = settings.exam_name;
    }
    if (settings.exam_date) {
        // Convert to local datetime format
        const date = new Date(settings.exam_date);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('examDate').value = localDate;
    }
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

async function saveSettings(event) {
    event.preventDefault();
    
    const examName = document.getElementById('examName').value;
    const examDate = document.getElementById('examDate').value;
    
    try {
        await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exam_name: examName,
                exam_date: new Date(examDate).toISOString()
            })
        });
        
        closeSettingsModal();
        loadSettings();
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target === modal) {
        closeSettingsModal();
    }
}

// Utility functions
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

