// API Base URL
const API_URL = 'http://localhost:3000/api';

// Global state
let allTasks = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// Load tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        allTasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksList').innerHTML = 
            '<p class="loading">Error loading tasks</p>';
    }
}

// Add task
async function addTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, priority })
        });
        
        if (response.ok) {
            // Clear form
            document.getElementById('addTaskForm').reset();
            
            // Reload tasks
            await loadTasks();
            
            // Show success message
            showNotification('Task added successfully!');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Error adding task', 'error');
    }
}

// Toggle task completion
async function toggleTask(id, completed) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });
        
        await loadTasks();
        
        if (!completed) {
            showNotification('Task completed! Great job!');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        await loadTasks();
        showNotification('🗑️ Task deleted');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

// Edit task
function editTask(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function updateTask(event) {
    event.preventDefault();
    
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const priority = document.getElementById('editTaskPriority').value;
    
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, priority })
        });
        
        closeEditModal();
        await loadTasks();
        showNotification('Task updated successfully!');
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
    }
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksList');
    
    let filteredTasks = allTasks;
    
    // Apply filter
    switch (currentFilter) {
        case 'active':
            filteredTasks = allTasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = allTasks.filter(t => t.completed);
            break;
        case 'high':
            filteredTasks = allTasks.filter(t => t.priority === 'high');
            break;
    }
    
    if (filteredTasks.length === 0) {
        container.innerHTML = '<p class="loading">No tasks found. Add your first task above!</p>';
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id}, ${task.completed})"
            >
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            </div>
            <span class="task-priority priority-${task.priority}">
                ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                ${task.priority}
            </span>
            <div class="task-actions">
                <button class="task-btn" onclick="editTask(${task.id})" title="Edit">✏️</button>
                <button class="task-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

