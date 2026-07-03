/* ============================================
   TaskFlow — Interactive Logic & State Management
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let tasks = [];
    let currentFilter = 'all';
    let searchQuery = '';

    // --- DOM ELEMENTS ---
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoPriority = document.getElementById('todo-priority');
    const todoCategory = document.getElementById('todo-category');
    const todoList = document.getElementById('todo-list');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const emptyState = document.getElementById('empty-state');
    
    // Stats elements
    const statsSubtitle = document.getElementById('stats-subtitle-text');
    const statsPercentage = document.getElementById('stats-percentage-text');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const itemsLeftText = document.getElementById('items-left-text');
    
    // Theme Toggle Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    // --- CORE INITIALIZATION ---
    function init() {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('taskflow-theme') || 'dark';
        htmlElement.setAttribute('data-theme', savedTheme);

        // Load tasks from localStorage
        const savedTasks = localStorage.getItem('taskflow-tasks');
        if (savedTasks) {
            try {
                tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error("Could not parse saved tasks, initializing empty list", e);
                tasks = [];
            }
        }
        
        setupEventListeners();
        render();
    }

    // --- STATE PERSISTENCE ---
    function saveTasksToLocalStorage() {
        localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    }

    // --- STATS CALCULATION ---
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;

        // Subtitle text
        statsSubtitle.textContent = `${completed} of ${total} tasks completed`;
        
        // Items Left text
        itemsLeftText.textContent = `${active} active task${active !== 1 ? 's' : ''}`;

        // Percentage & Progress Bar Fill
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        statsPercentage.textContent = `${percentage}%`;
        progressBarFill.style.width = `${percentage}%`;
        
        // Show/Hide Clear Completed button
        if (completed > 0) {
            clearCompletedBtn.style.display = 'block';
        } else {
            clearCompletedBtn.style.display = 'none';
        }
    }

    // --- DYNAMIC RENDERING (DOM MANIPULATION) ---
    function render() {
        // Clear current elements
        todoList.innerHTML = '';

        // Filter and Search tasks
        const filteredTasks = tasks.filter(task => {
            // Filter match
            const matchesFilter = 
                currentFilter === 'all' || 
                (currentFilter === 'active' && !task.completed) || 
                (currentFilter === 'completed' && task.completed);
            
            // Search match
            const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });

        // Toggle Empty State
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
            todoList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todoList.style.display = 'flex';
        }

        // Generate DOM elements
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            // HTML content with checkboxes, tags, edit, delete, etc.
            li.innerHTML = `
                <button class="custom-checkbox" aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}" title="Toggle Task">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                
                <div class="todo-content">
                    <div class="todo-text-wrapper">
                        <span class="todo-text">${escapeHtml(task.text)}</span>
                    </div>
                    <div class="todo-meta">
                        <span class="tag tag-priority-${task.priority}">${task.priority}</span>
                        <span class="category-dot category-${task.category}">${capitalize(task.category)}</span>
                    </div>
                </div>
                
                <div class="todo-actions">
                    <button class="action-btn edit-btn" aria-label="Edit task" title="Edit Task">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete-btn" aria-label="Delete task" title="Delete Task">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;

            todoList.appendChild(li);
        });

        // Update statistics
        updateStats();
    }

    // --- EVENT LISTENERS SETUP ---
    function setupEventListeners() {
        // 1. Submit New Todo
        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = todoInput.value.trim();
            if (!text) return;

            const priority = todoPriority.value;
            const category = todoCategory.value;

            addTask(text, priority, category);

            // Reset inputs
            todoInput.value = '';
            todoInput.focus();
        });

        // 2. Delegated Event Listeners (List Actions)
        todoList.addEventListener('click', (e) => {
            // Find target close to todo-item
            const item = e.target.closest('.todo-item');
            if (!item) return;
            const id = parseInt(item.dataset.id);

            // Toggle Checkbox
            if (e.target.closest('.custom-checkbox')) {
                toggleTask(id);
                return;
            }

            // Delete task
            if (e.target.closest('.delete-btn')) {
                deleteTask(id, item);
                return;
            }

            // Edit button clicked
            if (e.target.closest('.edit-btn')) {
                enterEditMode(item, id);
                return;
            }
        });

        // 3. Filtering Controls
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                render();
            });
        });

        // 4. Searching Task Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            render();
        });

        // 5. Clear Completed Tasks
        clearCompletedBtn.addEventListener('click', () => {
            clearCompleted();
        });

        // 6. Theme Switching
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('taskflow-theme', newTheme);
        });
    }

    // --- CRUD OPERATIONS & CORE LOGIC ---

    // CREATE
    function addTask(text, priority, category) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority,
            category: category,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask); // Add to beginning of array
        saveTasksToLocalStorage();
        render();
    }

    // UPDATE - Completion toggle
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        saveTasksToLocalStorage();
        render();
    }

    // UPDATE - Inline edit text
    function enterEditMode(item, id) {
        const todoTextNode = item.querySelector('.todo-text');
        const originalText = todoTextNode.textContent;
        const todoContentNode = item.querySelector('.todo-content');
        
        // Hide standard actions, disable checkboxes
        item.querySelector('.todo-actions').style.display = 'none';
        item.querySelector('.custom-checkbox').setAttribute('disabled', 'true');

        // Create edit input element
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'todo-edit-input';
        editInput.value = originalText;
        
        // Replace text with input inside DOM
        todoContentNode.insertBefore(editInput, todoContentNode.firstChild);
        todoTextNode.style.display = 'none';
        editInput.focus();

        // Save on Enter key or Blur
        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== originalText) {
                updateTaskText(id, newText);
            }
            render(); // Refresh DOM
        };

        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                render(); // Revert back
            }
        });

        editInput.addEventListener('blur', () => {
            saveEdit();
        });
    }

    function updateTaskText(id, newText) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText };
            }
            return task;
        });
        saveTasksToLocalStorage();
    }

    // DELETE
    function deleteTask(id, element) {
        // Trigger deletion animation in CSS
        element.classList.add('deleting');
        
        // Wait for CSS animation to finish before updating state/re-rendering
        element.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasksToLocalStorage();
            render();
        }, { once: true });
    }

    // CLEAR ALL COMPLETED
    function clearCompleted() {
        // Find completed elements for animation
        const completedElements = todoList.querySelectorAll('.todo-item.completed');
        
        if (completedElements.length === 0) return;

        let animatedCount = 0;
        completedElements.forEach(el => {
            el.classList.add('deleting');
            el.addEventListener('animationend', () => {
                animatedCount++;
                if (animatedCount === completedElements.length) {
                    tasks = tasks.filter(task => !task.completed);
                    saveTasksToLocalStorage();
                    render();
                }
            }, { once: true });
        });
    }

    // --- UTILITIES ---
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initialize application
    init();
});
