// Interactive Notes JavaScript
class InteractiveNotes {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('interactiveNotes') || '[]');
        this.folders = JSON.parse(localStorage.getItem('noteFolders') || '[]');
        this.currentNote = null;
        this.quill = null;
        this.autoSaveTimer = null;
        this.selectedFolder = 'all';
        this.sortBy = 'updated';
        
        this.loadNotesFromAPI();
        this.init();
    }

    init() {
        this.initializeEditor();
        this.setupEventListeners();
        this.loadFolders();
        this.loadNotes();
        this.showWelcomeScreen();
        
        if (this.folders.length === 0) {
            this.createDefaultFolders();
        }
    }

    initializeEditor() {
        const Font = Quill.import('formats/font');
        Font.whitelist = ['arial', 'georgia', 'times', 'verdana', 'helvetica', 'comic-sans', 'courier', 'inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'nunito', 'source-sans', 'ubuntu', 'raleway', 'merriweather', 'playfair'];
        Quill.register(Font, true);

        const Size = Quill.import('formats/size');
        Size.whitelist = ['8px', '9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px', '64px'];
        Quill.register(Size, true);

        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: { toolbar: '#toolbar' },
            placeholder: 'Start writing your notes...'
        });

        this.quill.on('text-change', () => {
            if (this.currentNote) {
                clearTimeout(this.autoSaveTimer);
                this.autoSaveTimer = setTimeout(() => this.saveCurrentNote(), 1000);
            }
        });
    }

    setupEventListeners() {
        document.getElementById('mobileMenuBtn').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.loadNotes();
        });

        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.createNewNote();
        });

        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentNote());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchNotes(e.target.value));
        document.getElementById('addFolderBtn').addEventListener('click', () => this.showAddFolderModal());

        document.getElementById('noteTitle').addEventListener('input', (e) => {
            if (this.currentNote) {
                this.currentNote.title = e.target.value || 'Untitled Note';
                this.updateNotesList();
            }
        });

        document.getElementById('folderSelect').addEventListener('change', (e) => {
            if (this.currentNote) {
                this.currentNote.folder = e.target.value;
                this.updateNotesList();
            }
        });

        document.getElementById('prioritySelect').addEventListener('change', (e) => {
            if (this.currentNote) {
                this.currentNote.priority = e.target.value;
                this.updateNotesList();
            }
        });

        document.getElementById('tagsInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });

        document.getElementById('pinBtn').addEventListener('click', () => this.togglePin());
        document.getElementById('shareBtn').addEventListener('click', () => this.showShareModal());
        document.getElementById('deleteBtn').addEventListener('click', () => this.showDeleteModal());
        document.getElementById('closeBtn').addEventListener('click', () => this.closeNote());



        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    createDefaultFolders() {
        this.folders = [
            { id: 'math', name: 'Mathematics', color: '#3B82F6', count: 0 },
            { id: 'science', name: 'Science', color: '#10B981', count: 0 },
            { id: 'english', name: 'English', color: '#F59E0B', count: 0 },
            { id: 'history', name: 'History', color: '#EF4444', count: 0 }
        ];
        this.saveFolders();
        this.loadFolders();
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.mobile-overlay') || this.createMobileOverlay();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.addEventListener('click', () => this.toggleMobileMenu());
        document.body.appendChild(overlay);
        return overlay;
    }

    closeNote() {
        this.currentNote = null;
        this.showWelcomeScreen();
        
        // Clear active states
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear form
        document.getElementById('noteTitle').value = '';
        document.getElementById('folderSelect').value = '';
        document.getElementById('prioritySelect').value = 'medium';
        document.getElementById('pinBtn').classList.remove('active');
        document.getElementById('tagsList').innerHTML = '';
        
        // Clear editor
        this.quill.setContents([]);
    }

    createNewNote() {
        const note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            folder: '',
            tags: [],
            priority: 'medium',
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.currentNote = note;
        this.saveNotes();
        this.loadNotes();
        this.loadNote(note);
        this.showWelcomeScreen();
        
        // Close mobile menu when creating new note
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        }

        setTimeout(() => {
            document.getElementById('noteTitle').focus();
            document.getElementById('noteTitle').select();
        }, 100);
    }



    fastLoadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.currentNote = note;
            
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('folderSelect').value = note.folder || '';
            document.getElementById('prioritySelect').value = note.priority || 'medium';
            document.getElementById('pinBtn').classList.toggle('active', note.pinned);
            
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('editorContainer').style.display = 'flex';
            
            // Close mobile menu when note is selected
            if (window.innerWidth <= 768) {
                this.toggleMobileMenu();
            }
            
            requestAnimationFrame(() => {
                this.quill.setContents(note.content ? JSON.parse(note.content) : []);
                this.loadTags();
                document.querySelectorAll('.note-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.noteId === noteId);
                });
            });
        }
    }

    loadNote(note) {
        this.currentNote = note;
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('folderSelect').value = note.folder || '';
        document.getElementById('prioritySelect').value = note.priority || 'medium';
        document.getElementById('pinBtn').classList.toggle('active', note.pinned);
        
        this.quill.setContents(note.content ? JSON.parse(note.content) : []);
        this.loadTags();
        
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.toggle('active', item.dataset.noteId === note.id);
        });
    }

    saveCurrentNote() {
        if (this.currentNote) {
            this.currentNote.content = JSON.stringify(this.quill.getContents());
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.updateNotesList();
            
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved';
            saveBtn.style.background = '#10B981';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }
    }

    loadNotes() {
        const notesList = document.getElementById('notesList');
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note text-gray-300 text-4xl mb-2"></i>
                    <p class="text-gray-500">No notes yet</p>
                    <p class="text-sm text-gray-400">Create your first note!</p>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = filteredNotes.map((note, index) => `
            <div class="note-item fade-in" data-note-id="${note.id}" onclick="notesApp.fastLoadNote('${note.id}')" oncontextmenu="event.preventDefault(); notesApp.deleteNoteFromList('${note.id}')" style="animation-delay: ${index * 0.1}s">
                <div class="note-item-header">
                    <div class="note-item-title text-truncate">${note.title}</div>
                    <div class="priority-badge priority-${note.priority || 'medium'}">${(note.priority || 'medium').toUpperCase()}</div>
                    ${note.pinned ? '<i class="fas fa-thumbtack note-item-pin"></i>' : ''}
                </div>
                <div class="note-item-preview">${this.getPlainText(note.content).substring(0, 80)}${this.getPlainText(note.content).length > 80 ? '...' : ''}</div>
                <div class="note-item-meta">
                    <div class="note-tags">
                        ${note.tags.slice(0, 2).map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                        ${note.tags.length > 2 ? `<span class="note-tag">+${note.tags.length - 2}</span>` : ''}
                    </div>
                    <span title="${new Date(note.updatedAt).toLocaleString()}">${this.formatDate(note.updatedAt)}</span>
                </div>
            </div>
        `).join('');
    }



    getFilteredNotes() {
        let filtered = this.notes;
        
        if (this.selectedFolder !== 'all') {
            filtered = filtered.filter(note => note.folder === this.selectedFolder);
        }
        
        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            switch (this.sortBy) {
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
    }

    searchNotes(query) {
        if (!query.trim()) {
            this.loadNotes();
            return;
        }

        const searchResults = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            this.getPlainText(note.content).toLowerCase().includes(query.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const notesList = document.getElementById('notesList');
        if (searchResults.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search text-gray-300 text-4xl mb-2"></i>
                    <p class="text-gray-500">No results found</p>
                    <p class="text-sm text-gray-400">Try different keywords</p>
                </div>
            `;
            return;
        }

        notesList.innerHTML = searchResults.map(note => `
            <div class="note-item fade-in" data-note-id="${note.id}" onclick="notesApp.fastLoadNote('${note.id}')">
                <div class="note-item-header">
                    <div class="note-item-title">${this.highlightText(note.title, query)}</div>
                    ${note.pinned ? '<i class="fas fa-thumbtack note-item-pin"></i>' : ''}
                </div>
                <div class="note-item-preview">${this.highlightText(this.getPlainText(note.content).substring(0, 100), query)}...</div>
                <div class="note-item-meta">
                    <div class="note-tags">
                        ${note.tags.slice(0, 2).map(tag => `<span class="note-tag">${this.highlightText(tag, query)}</span>`).join('')}
                    </div>
                    <span>${this.formatDate(note.updatedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    loadFolders() {
        const foldersList = document.getElementById('foldersList');
        const folderSelect = document.getElementById('folderSelect');
        
        foldersList.innerHTML = `
            <div class="folder-item ${this.selectedFolder === 'all' ? 'active' : ''}" data-folder="all" onclick="notesApp.selectFolder('all')">
                <i class="fas fa-folder text-blue-500 mr-2"></i>
                <span>All Notes</span>
                <span class="note-count">${this.notes.length}</span>
            </div>
            ${this.folders.map(folder => {
                const count = this.notes.filter(note => note.folder === folder.id).length;
                return `
                    <div class="folder-item ${this.selectedFolder === folder.id ? 'active' : ''}" data-folder="${folder.id}" onclick="notesApp.selectFolder('${folder.id}')">
                        <i class="fas fa-folder mr-2" style="color: ${folder.color}"></i>
                        <span>${folder.name}</span>
                        <span class="note-count">${count}</span>
                    </div>
                `;
            }).join('')}
        `;

        folderSelect.innerHTML = `
            <option value="">Select Subject</option>
            ${this.folders.map(folder => `
                <option value="${folder.id}">${folder.name}</option>
            `).join('')}
        `;
    }

    selectFolder(folderId) {
        this.selectedFolder = folderId;
        this.loadFolders();
        this.loadNotes();
    }

    showAddFolderModal() {
        document.getElementById('addFolderModal').classList.remove('hidden');
        document.getElementById('folderNameInput').focus();
    }

    createFolder() {
        const nameInput = document.getElementById('folderNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a folder name');
            return;
        }

        const selectedColor = document.querySelector('.color-option.active');
        const color = selectedColor ? selectedColor.dataset.color : '#3B82F6';

        const folder = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            color: color,
            count: 0
        };

        this.folders.push(folder);
        this.saveFolders();
        this.loadFolders();
        this.closeModal('addFolderModal');
        
        nameInput.value = '';
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.color-option').classList.add('active');
    }

    addTag(tagName) {
        if (!this.currentNote) return;
        
        if (!this.currentNote.tags.includes(tagName)) {
            this.currentNote.tags.push(tagName);
            this.loadTags();
            this.saveCurrentNote();
        }
    }

    removeTag(tagName) {
        if (!this.currentNote) return;
        
        this.currentNote.tags = this.currentNote.tags.filter(tag => tag !== tagName);
        this.loadTags();
        this.saveCurrentNote();
    }

    loadTags() {
        if (!this.currentNote) return;
        
        const tagsList = document.getElementById('tagsList');
        tagsList.innerHTML = this.currentNote.tags.map(tag => `
            <span class="tag-item">
                ${tag}
                <i class="fas fa-times tag-remove" onclick="notesApp.removeTag('${tag}')"></i>
            </span>
        `).join('');
    }

    togglePin() {
        if (!this.currentNote) return;
        
        this.currentNote.pinned = !this.currentNote.pinned;
        document.getElementById('pinBtn').classList.toggle('active', this.currentNote.pinned);
        this.saveCurrentNote();
        this.loadNotes();
    }

    addTodoItem(text) {
        if (!this.currentTodo) return;
        
        let priority = 'medium';
        let cleanText = text;
        
        if (text.startsWith('!!!') || text.includes('[HIGH]')) {
            priority = 'high';
            cleanText = text.replace(/^!!!\s*|\[HIGH\]\s*/gi, '');
        } else if (text.startsWith('!!') || text.includes('[MEDIUM]')) {
            priority = 'medium';
            cleanText = text.replace(/^!!\s*|\[MEDIUM\]\s*/gi, '');
        } else if (text.startsWith('!') || text.includes('[LOW]')) {
            priority = 'low';
            cleanText = text.replace(/^!\s*|\[LOW\]\s*/gi, '');
        }
        
        const item = {
            id: Date.now().toString(),
            text: cleanText.trim(),
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString()
        };
        
        this.currentTodo.items.unshift(item);
        this.loadTodoItems();
        this.saveCurrentNote();
        
        const addBtn = document.getElementById('addTodoBtn');
        addBtn.innerHTML = '<i class="fas fa-check"></i>';
        addBtn.style.background = '#10B981';
        
        setTimeout(() => {
            addBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addBtn.style.background = '';
        }, 1000);
    }

    toggleTodoItem(itemId) {
        if (!this.currentTodo) return;
        
        const item = this.currentTodo.items.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            item.completedAt = item.completed ? new Date().toISOString() : null;
            
            if (item.completed) {
                const todoItem = document.querySelector(`[onclick*="${itemId}"]`);
                if (todoItem) {
                    todoItem.classList.add('bounce-in');
                    setTimeout(() => todoItem.classList.remove('bounce-in'), 500);
                }
            }
            
            this.loadTodoItems();
            this.saveCurrentNote();
            this.updateNotesList();
        }
    }

    deleteTodoItem(itemId) {
        if (!this.currentTodo) return;
        
        const item = this.currentTodo.items.find(i => i.id === itemId);
        if (item && confirm(`Delete task: "${item.text}"?`)) {
            this.currentTodo.items = this.currentTodo.items.filter(i => i.id !== itemId);
            this.loadTodoItems();
            this.saveCurrentNote();
            this.updateNotesList();
        }
    }

    loadTodoItems() {
        if (!this.currentTodo) return;
        
        const todoList = document.getElementById('todoList');
        const items = this.currentTodo.items;
        
        document.getElementById('todoContainer').classList.add('active');
        
        if (items.length > 3) {
            todoList.classList.add('scrollable');
        } else {
            todoList.classList.remove('scrollable');
        }
        
        if (items.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks text-gray-300 text-3xl mb-3"></i>
                    <p class="text-gray-500 font-medium">No tasks yet</p>
                    <p class="text-gray-400 text-sm">Add your first task above</p>
                </div>
            `;
        } else {
            const sortedItems = [...items].sort((a, b) => {
                if (a.completed === b.completed) {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
                }
                return a.completed - b.completed;
            });
            
            todoList.innerHTML = sortedItems.map((item, index) => `
                <div class="todo-item ${item.completed ? 'completed' : ''}" style="animation-delay: ${index * 0.05}s" onclick="event.stopPropagation(); notesApp.toggleTodoItem('${item.id}')" oncontextmenu="event.preventDefault(); notesApp.deleteTodoItem('${item.id}')">
                    <div class="todo-checkbox ${item.completed ? 'checked' : ''}">
                        ${item.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="todo-text text-truncate" title="${item.text}">${item.text}</div>
                    <div class="todo-priority priority-${item.priority}">${item.priority.toUpperCase()}</div>
                    <div class="todo-actions">
                        <button class="todo-action-btn" onclick="event.stopPropagation(); notesApp.deleteTodoItem('${item.id}')" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        this.updateTodoStats();
    }

    updateTodoStats() {
        if (!this.currentTodo) return;
        
        const total = this.currentTodo.items.length;
        const completed = this.currentTodo.items.filter(item => item.completed).length;
        const remaining = total - completed;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const statsText = document.getElementById('todoStats');
        if (total === 0) {
            statsText.textContent = 'No tasks yet';
        } else if (remaining === 0) {
            statsText.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-1"></i>All tasks completed! 🎉`;
            statsText.style.color = '#10B981';
        } else {
            statsText.textContent = `${remaining} of ${total} tasks remaining (${progressPercent}% done)`;
            statsText.style.color = '';
        }
        
        const clearBtn = document.getElementById('clearCompletedBtn');
        clearBtn.style.display = completed > 0 ? 'block' : 'none';
        clearBtn.textContent = `Clear ${completed} Completed`;
    }

    clearCompletedTodos() {
        if (!this.currentTodo) return;
        
        const completedCount = this.currentTodo.items.filter(item => item.completed).length;
        if (completedCount > 0 && confirm(`Clear ${completedCount} completed tasks?`)) {
            this.currentTodo.items = this.currentTodo.items.filter(item => !item.completed);
            this.loadTodoItems();
            this.saveCurrentNote();
            this.updateNotesList();
        }
    }

    showShareModal() {
        if (!this.currentNote) {
            alert('Please select a note to share');
            return;
        }
        
        const shareLink = `${window.location.origin}/shared/${this.currentNote.id}`;
        document.getElementById('shareLink').value = shareLink;
        document.getElementById('shareModal').classList.remove('hidden');
    }

    showDeleteModal() {
        if (!this.currentNote) {
            alert('Please select a note to delete');
            return;
        }
        
        document.getElementById('deleteItemType').textContent = 'note';
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    deleteCurrentItem() {
        if (this.currentNote) {
            this.notes = this.notes.filter(note => note.id !== this.currentNote.id);
            this.saveNotes();
            this.currentNote = null;
            this.loadNotes();
            this.showWelcomeScreen();
            this.closeModal('deleteModal');
        }
    }

    deleteNoteFromList(noteId) {
        if (confirm('Delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            
            if (this.currentNote && this.currentNote.id === noteId) {
                this.currentNote = null;
                this.showWelcomeScreen();
            }
            
            this.loadNotes();
        }
    }





    showExportModal() {
        if (!this.currentNote) {
            alert('Please select a note to export');
            return;
        }
        document.getElementById('exportModal').classList.remove('hidden');
    }

    exportNote(format) {
        if (!this.currentNote) return;

        const title = this.currentNote.title;
        const content = this.getPlainText(this.currentNote.content);
        
        switch (format) {
            case 'pdf':
                this.exportToPDF(title, content);
                break;
            case 'html':
                this.exportToHTML(title, content);
                break;
            case 'txt':
                this.exportToText(title, content);
                break;
            case 'docx':
                this.exportToWord(title, content);
                break;
        }
        
        this.closeModal('exportModal');
    }

    async exportToPDF(title, content) {
        try {
            const response = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(title, 20, 30);
            doc.setFontSize(12);
            const lines = doc.splitTextToSize(content, 170);
            doc.text(lines, 20, 50);
            doc.save(`${title}.pdf`);
        }
    }

    exportToHTML(title, content) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #333; }
                    p { line-height: 1.6; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div>${this.quill.root.innerHTML}</div>
            </body>
            </html>
        `;
        
        this.downloadFile(`${title}.html`, html, 'text/html');
    }

    exportToText(title, content) {
        const text = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
        this.downloadFile(`${title}.txt`, text, 'text/plain');
    }

    exportToWord(title, content) {
        const text = `${title}\n\n${content}`;
        this.downloadFile(`${title}.docx`, text, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('notesTheme', isDark ? 'dark' : 'light');
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const editorContainer = document.getElementById('editorContainer');
        
        if (!this.notes.length || !this.currentNote) {
            welcomeScreen.style.display = 'flex';
            editorContainer.style.display = 'none';
        } else {
            welcomeScreen.style.display = 'none';
            editorContainer.style.display = 'flex';
        }
    }

    // Utility functions
    getPlainText(content) {
        if (!content) return '';
        try {
            const delta = JSON.parse(content);
            return delta.ops ? delta.ops.map(op => op.insert).join('') : '';
        } catch {
            return content;
        }
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    updateNotesList() {
        this.loadNotes();
    }

    async loadNotesFromAPI() {
        try {
            const response = await fetch('/api/notes');
            const data = await response.json();
            if (data.notes && data.notes.length > 0) {
                this.notes = data.notes;
                localStorage.setItem('interactiveNotes', JSON.stringify(this.notes));
            }
        } catch (error) {
            console.log('Using local storage');
        }
    }

    saveNotes() {
        localStorage.setItem('interactiveNotes', JSON.stringify(this.notes));
    }

    async saveFolders() {
        localStorage.setItem('noteFolders', JSON.stringify(this.folders));
        
        try {
            await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folders: this.folders })
            });
        } catch (error) {
            console.log('Offline mode - saved locally');
        }
    }
}

// Global functions
function createNewNote() {
    if (notesApp) {
        notesApp.createNewNote();
    }
}

async function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    
    try {
        await navigator.clipboard.writeText(shareLink.value);
    } catch (error) {
        shareLink.select();
        document.execCommand('copy');
    }
    
    const copyBtn = document.querySelector('.copy-link-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.background = '#10B981';
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = '';
    }, 2000);
}

function confirmDelete() {
    notesApp.deleteCurrentItem();
}

function closeModal(modalId) {
    notesApp.closeModal(modalId);
}

function createFolder() {
    notesApp.createFolder();
}

function exportNote(format) {
    notesApp.exportNote(format);
}

// Initialize the app
let notesApp;
document.addEventListener('DOMContentLoaded', () => {
    notesApp = new InteractiveNotes();
    
    const savedTheme = localStorage.getItem('notesTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    notesApp.createNewNote();
                    break;
                case 's':
                    e.preventDefault();
                    notesApp.saveCurrentNote();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;

            }
        }
        
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open')) {
                notesApp.toggleMobileMenu();
            }
        }
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        }
    });
});