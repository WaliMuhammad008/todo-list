class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('pro-todos')) || [];
        this.filter = 'all'; // 'all', 'active', 'completed'

        // DOM Elements
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.pendingCount = document.getElementById('pending-count');
        this.clearBtn = document.getElementById('clear-completed');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.dateElement = document.getElementById('current-date');

        this.init();
    }

    init() {
        // Set Date
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        this.dateElement.textContent = new Date().toLocaleDateString('en-US', options);

        // Event Listeners
        this.form.addEventListener('submit', (e) => this.addTodo(e));
        this.todoList.addEventListener('click', (e) => this.handleListClick(e));
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        this.render();
    }

    addTodo(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now().toString(),
            text,
            completed: false
        };

        this.todos.push(newTodo);
        this.input.value = '';
        this.saveAndRender();
    }

    handleListClick(e) {
        const item = e.target.closest('.todo-item');
        if (!item) return;

        const id = item.dataset.id;

        if (e.target.closest('.delete-btn')) {
            this.deleteTodo(id);
        } else if (e.target.closest('.todo-content')) {
            this.toggleTodo(id);
        }
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveAndRender();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveAndRender();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveAndRender();
    }

    setFilter(filterType) {
        this.filter = filterType;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });
        this.render();
    }

    getFilteredTodos() {
        switch(this.filter) {
            case 'active': return this.todos.filter(t => !t.completed);
            case 'completed': return this.todos.filter(t => t.completed);
            default: return this.todos;
        }
    }

    saveAndRender() {
        localStorage.setItem('pro-todos', JSON.stringify(this.todos));
        this.render();
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Update list
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `<div class="empty-state">No tasks found</div>`;
        } else {
            this.todoList.innerHTML = filteredTodos.map(todo => `
                <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <div class="todo-content">
                        <div class="checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="todo-text">${this.escapeHTML(todo.text)}</span>
                    </div>
                    <button class="delete-btn" aria-label="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </li>
            `).join('');
        }

        // Update stats
        const pendingCount = this.todos.filter(t => !t.completed).length;
        this.pendingCount.textContent = `${pendingCount} task${pendingCount !== 1 ? 's' : ''} left`;
        
        // Show/hide clear button
        const hasCompleted = this.todos.some(t => t.completed);
        this.clearBtn.style.display = hasCompleted ? 'block' : 'none';
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});