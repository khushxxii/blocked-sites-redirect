// API Base URL
const API_URL = 'http://localhost:3000/api';

// Timer state
let timerDuration = 25 * 60; // 25 minutes in seconds
let timeRemaining = timerDuration;
let timerInterval = null;
let isRunning = false;
let isStudySession = true; // Track if current timer is a study session or break

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();
    loadStats();
    updateTimerDisplay();
    startMotivationCarousel();
});

// Timer functions
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'inline-block';
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        updateProgress();
        
        if (timeRemaining <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('startBtn').textContent = '▶️ Resume';
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timeRemaining = timerDuration;
    updateTimerDisplay();
    updateProgress();
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('startBtn').textContent = '▶️ Start Focus Session';
}

function setTimer(minutes, isStudy = true) {
    if (isRunning) {
        if (!confirm('Timer is running. Are you sure you want to change?')) {
            return;
        }
        resetTimer();
    }
    
    timerDuration = minutes * 60;
    timeRemaining = timerDuration;
    isStudySession = isStudy;
    updateTimerDisplay();
    updateProgress();
    
    // Update label
    const labels = {
        25: 'Focus Time',
        5: 'Short Break',
        15: 'Long Break',
        50: 'Deep Work'
    };
    document.getElementById('timerLabel').textContent = labels[minutes] || (isStudy ? 'Study Session' : 'Break Time');
}

function setCustomTimer() {
    const minutes = parseInt(document.getElementById('customMinutes').value);
    const sessionType = document.querySelector('input[name="sessionType"]:checked').value;
    
    if (!minutes || minutes < 1 || minutes > 120) {
        alert('Please enter a valid time between 1 and 120 minutes');
        return;
    }
    
    const isStudy = sessionType === 'study';
    setTimer(minutes, isStudy);
    
    // Clear the input
    document.getElementById('customMinutes').value = '';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
    
    // Update page title
    if (isRunning) {
        document.title = `${display} - Study Session`;
    } else {
        document.title = '⏱️ Study Tracker';
    }
}

function updateProgress() {
    const progress = document.getElementById('timerProgress');
    const percentage = (timeRemaining / timerDuration);
    const circumference = 2 * Math.PI * 140;
    const offset = circumference * (1 - percentage);
    progress.style.strokeDashoffset = offset;
}

async function completeSession() {
    isRunning = false;
    clearInterval(timerInterval);
    
    const durationMinutes = Math.floor(timerDuration / 60);
    
    // Play completion sound for study sessions
    if (isStudySession) {
        try {
            playAlarmSound();
        } catch (e) {
            console.log('Could not play sound');
        }
    }
    
    // Show different messages for study vs break sessions
    if (isStudySession) {
        alert('Great job! Session completed!\n\nTake a break and come back stronger!');
    } else {
        alert('⏰ Break time is over!\n\nTime to get back to work! 💪');
    }
    
    // Save session ONLY if it's a study session
    // Don't save break sessions
    if (isStudySession) {
        const duration = durationMinutes;
        const taskName = document.getElementById('sessionTask').value || 'Study Session';
        const notes = document.getElementById('sessionNotes').value;
        
        try {
            await fetch(`${API_URL}/study-sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration,
                    task_name: taskName,
                    notes
                })
            });
            
            // Clear form
            document.getElementById('sessionTask').value = '';
            document.getElementById('sessionNotes').value = '';
            
            // Reload data
            loadSessions();
            loadStats();
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }
    
    // Reset timer
    resetTimer();
}

// Load sessions
async function loadSessions() {
    try {
        const response = await fetch(`${API_URL}/study-sessions`);
        const sessions = await response.json();
        
        const container = document.getElementById('sessionsList');
        
        if (sessions.length === 0) {
            container.innerHTML = '<p class="loading">No study sessions yet. Start your first session! </p>';
            return;
        }
        
        container.innerHTML = sessions.slice(0, 10).map(session => {
            // SQLite stores timestamps in UTC format (YYYY-MM-DD HH:MM:SS)
            // We need to parse it as UTC to avoid timezone conversion issues
            let date;
            if (session.started_at.includes('T') || session.started_at.endsWith('Z')) {
                // Already in ISO format or has timezone indicator
                date = new Date(session.started_at);
            } else {
                // SQLite format: replace space with 'T' and append 'Z' for UTC
                date = new Date(session.started_at.replace(' ', 'T') + 'Z');
            }
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="session-item">
                    <div class="session-info-text">
                        <div class="session-task">${escapeHtml(session.task_name || 'Study Session')}</div>
                        ${session.notes ? `<div class="session-notes">${escapeHtml(session.notes)}</div>` : ''}
                        <div class="session-notes">${dateStr}</div>
                    </div>
                    <div class="session-duration">${session.duration}m</div>
                </div>
            `;
        }).join('');
        
        document.getElementById('totalSessions').textContent = sessions.length;
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('totalTime').textContent = formatTime(stats.totalStudyTime || 0);
        document.getElementById('todayTime').textContent = formatTime(stats.todayStudyTime || 0);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Motivation carousel
function startMotivationCarousel() {
    const reminders = [
        "You're investing so much - make every minute count! 💰",
        "Think of all the freedom AFTER you succeed! ✨",
        "The plate won't fill itself - keep going! 🔥",
        "You chose this path - now OWN it! 🎓",
        "Every study minute is building your future! ",
        "Your future self is cheering you on! 💪",
        "Make your investment worth it - FOCUS! 💸",
        "Success isn't a Netflix series - it's study sessions! 📚",
        "You NEED to learn this - and you're doing it! 🧠"
    ];
    
    let index = 0;
    const element = document.getElementById('reminderText');
    
    setInterval(() => {
        element.style.opacity = '0';
        setTimeout(() => {
            index = (index + 1) % reminders.length;
            element.textContent = reminders[index];
            element.style.opacity = '1';
        }, 300);
    }, 8000);
    
    element.style.transition = 'opacity 0.3s';
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

// Prevent page unload during active session
window.addEventListener('beforeunload', (e) => {
    if (isRunning) {
        e.preventDefault();
        e.returnValue = 'You have an active study session. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Generate alarm sound using Web Audio API
function playAlarmSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create three beeps for alarm effect
        const beepTimes = [0, 0.3, 0.6];
        
        beepTimes.forEach(time => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Alarm-like frequency (around 880 Hz - A5 note)
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            // Envelope for the beep
            const now = audioContext.currentTime + time;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        });
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

