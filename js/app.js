// Initialize the application
class CodeNest {
    constructor() {
        this.editor = null;
        this.socket = null;
        this.currentWorkspace = null;
        this.collaborators = new Map();
        this.files = new Map();
        this.activeTab = null;
        this.terminal = null;
        this.aiAssistant = null;
        this.gitManager = null;

        this.initializeApp();
    }

    async initializeApp() {
        // Initialize Monaco Editor
        await this.initializeEditor();
        
        // Initialize WebSocket connection
        this.initializeWebSocket();
        
        // Initialize Terminal
        this.initializeTerminal();
        
        // Initialize AI Assistant
        this.initializeAIAssistant();
        
        // Initialize Git Integration
        this.initializeGit();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial workspace
        this.loadWorkspace();
    }

    async initializeEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
        
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                value: '',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                cursorStyle: 'line',
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on'
            });

            // Set up editor change listener for collaboration
            this.editor.onDidChangeModelContent((e) => {
                if (this.socket) {
                    this.socket.emit('editor-change', {
                        workspaceId: this.currentWorkspace,
                        changes: e.changes,
                        version: this.editor.getModel().getVersionId()
                    });
                }
            });
        });
    }

    initializeWebSocket() {
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
            console.log('Connected to collaboration server');
        });

        this.socket.on('editor-change', (data) => {
            if (data.workspaceId === this.currentWorkspace) {
                this.applyRemoteChanges(data.changes);
            }
        });

        this.socket.on('collaborator-joined', (data) => {
            this.addCollaborator(data.user);
        });

        this.socket.on('collaborator-left', (data) => {
            this.removeCollaborator(data.userId);
        });
    }

    initializeTerminal() {
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, monospace',
            theme: {
                background: '#2c3e50',
                foreground: '#ecf0f1'
            }
        });

        this.terminal.open(document.getElementById('terminal'));
        this.terminal.write('Welcome to CodeNest Terminal\r\n');
    }

    initializeAIAssistant() {
        this.aiAssistant = {
            chat: document.getElementById('ai-chat'),
            messages: [],
            
            sendMessage: async (message) => {
                // Add user message to chat
                this.addChatMessage('user', message);
                
                try {
                    // Call AI API (to be implemented)
                    const response = await this.callAIAPI(message);
                    this.addChatMessage('assistant', response);
                } catch (error) {
                    this.addChatMessage('error', 'Sorry, I encountered an error processing your request.');
                }
            },
            
            addChatMessage: (type, content) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${type}`;
                messageDiv.textContent = content;
                this.aiAssistant.chat.appendChild(messageDiv);
                this.aiAssistant.chat.scrollTop = this.aiAssistant.chat.scrollHeight;
            }
        };
    }

    initializeGit() {
        this.gitManager = {
            status: document.getElementById('git-status'),
            
            updateStatus: async () => {
                try {
                    // Call Git API (to be implemented)
                    const status = await this.getGitStatus();
                    this.updateGitStatusUI(status);
                } catch (error) {
                    console.error('Error updating git status:', error);
                }
            },
            
            updateGitStatusUI: (status) => {
                this.gitManager.status.innerHTML = '';
                status.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'git-item';
                    itemDiv.innerHTML = `
                        <div class="git-status-indicator ${item.status}"></div>
                        <span>${item.file}</span>
                    `;
                    this.gitManager.status.appendChild(itemDiv);
                });
            }
        };
    }

    setupEventListeners() {
        // File tree click handler
        document.getElementById('file-tree').addEventListener('click', (e) => {
            if (e.target.classList.contains('file-item')) {
                this.openFile(e.target.dataset.path);
            }
        });

        // Terminal controls
        document.getElementById('new-terminal').addEventListener('click', () => {
            this.terminal.write('\r\n$ ');
        });

        document.getElementById('clear-terminal').addEventListener('click', () => {
            this.terminal.clear();
            this.terminal.write('$ ');
        });

        // AI Assistant input
        const aiInput = document.querySelector('.chat-input input');
        const aiSendButton = document.querySelector('.chat-input button');

        aiSendButton.addEventListener('click', () => {
            const message = aiInput.value.trim();
            if (message) {
                this.aiAssistant.sendMessage(message);
                aiInput.value = '';
            }
        });

        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aiSendButton.click();
            }
        });
    }

    async loadWorkspace() {
        // Load workspace data (to be implemented)
        const workspaceData = await this.fetchWorkspaceData();
        this.currentWorkspace = workspaceData.id;
        document.getElementById('workspace-name').textContent = workspaceData.name;
        
        // Load files
        this.loadFiles(workspaceData.files);
        
        // Update git status
        this.gitManager.updateStatus();
    }

    loadFiles(files) {
        const fileTree = document.getElementById('file-tree');
        fileTree.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.path = file.path;
            fileItem.innerHTML = `
                <i class="fas ${this.getFileIcon(file.type)}"></i>
                <span>${file.name}</span>
            `;
            fileTree.appendChild(fileItem);
        });
    }

    getFileIcon(type) {
        const icons = {
            'js': 'fa-js',
            'html': 'fa-html5',
            'css': 'fa-css3',
            'json': 'fa-code',
            'md': 'fa-markdown',
            'default': 'fa-file'
        };
        return icons[type] || icons.default;
    }

    openFile(path) {
        // Load file content (to be implemented)
        this.loadFileContent(path).then(content => {
            const model = monaco.editor.createModel(content, this.getLanguageFromPath(path));
            this.editor.setModel(model);
            this.activeTab = path;
            this.updateTabs();
        });
    }

    getLanguageFromPath(path) {
        const ext = path.split('.').pop().toLowerCase();
        const languages = {
            'js': 'javascript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown'
        };
        return languages[ext] || 'plaintext';
    }

    updateTabs() {
        const tabsContainer = document.getElementById('tabs-container');
        tabsContainer.innerHTML = '';
        
        this.files.forEach((file, path) => {
            const tab = document.createElement('div');
            tab.className = `tab ${path === this.activeTab ? 'active' : ''}`;
            tab.innerHTML = `
                <span>${file.name}</span>
                <span class="tab-close">&times;</span>
            `;
            tabsContainer.appendChild(tab);
        });
    }

    addCollaborator(user) {
        const collaboratorsList = document.getElementById('collaborators-list');
        const collaboratorDiv = document.createElement('div');
        collaboratorDiv.className = 'collaborator';
        collaboratorDiv.innerHTML = `
            <div class="collaborator-avatar" style="background-color: ${user.color}"></div>
            <span>${user.name}</span>
        `;
        collaboratorsList.appendChild(collaboratorDiv);
        this.collaborators.set(user.id, user);
    }

    removeCollaborator(userId) {
        const collaborator = this.collaborators.get(userId);
        if (collaborator) {
            const element = document.querySelector(`[data-user-id="${userId}"]`);
            if (element) {
                element.remove();
            }
            this.collaborators.delete(userId);
        }
    }

    applyRemoteChanges(changes) {
        const model = this.editor.getModel();
        if (model) {
            model.pushEditOperations(
                [],
                changes.map(change => ({
                    range: new monaco.Range(
                        change.range.startLineNumber,
                        change.range.startColumn,
                        change.range.endLineNumber,
                        change.range.endColumn
                    ),
                    text: change.text
                })),
                () => null
            );
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeNest = new CodeNest();
});

// Sample data for demonstration
const sampleRooms = [
    { name: 'Senior_Dev', code: 'seniordev', created: 'Jun 10, 2025' },
    { name: 'Junior_DEv', code: 'juniordev', created: 'Jun 1, 2025' },
    { name: 'custom', code: 'custom', created: 'May 9, 2025' },
    { name: 'cip5', code: 'abdullah-jameel', created: 'May 9, 2025' },
    { name: 'abdullah', code: 'abdullah', created: 'May 9, 2025' }
];

const roomList = document.getElementById('room-list');
const roomsTableBody = document.getElementById('rooms-table-body');
const addRoomBtn = document.getElementById('add-room-btn');
const createRoomModal = document.getElementById('create-room-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const createRoomForm = document.getElementById('create-room-form');
const roomNameInput = document.getElementById('room-name');
const roomLinkInput = document.getElementById('room-link');
const roomLanguageInput = document.getElementById('room-language');
const roomGroupsInput = document.getElementById('room-groups');
const roomStarterCodeInput = document.getElementById('room-starter-code');
const lockRoomInput = document.getElementById('lock-room');
const runnableCodeInput = document.getElementById('runnable-code');
const hintsInput = document.getElementById('hints');

const BASE_URL = 'https://codenest.app/room/';

function renderRooms() {
    // Sidebar list
    roomList.innerHTML = '';
    sampleRooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room.name;
        li.title = `Join ${room.name}`;
        li.onclick = () => window.open(BASE_URL + room.code, '_blank');
        roomList.appendChild(li);
    });
    // Table
    roomsTableBody.innerHTML = '';
    sampleRooms.forEach(room => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${room.name}</td>
            <td><a href="${BASE_URL + room.code}" target="_blank" class="room-link">${room.code}</a></td>
            <td>${room.created}</td>
        `;
        roomsTableBody.appendChild(tr);
    });
}

function openModal() {
    createRoomModal.classList.remove('hidden');
    roomNameInput.value = '';
    roomLinkInput.value = '';
    roomLanguageInput.value = 'Python';
    roomGroupsInput.value = 1;
    roomStarterCodeInput.value = 'Add starter code here';
    lockRoomInput.checked = false;
    runnableCodeInput.checked = false;
    hintsInput.checked = false;
}

function closeModal() {
    createRoomModal.classList.add('hidden');
}

function generateRoomCode(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function updateRoomLink() {
    const code = generateRoomCode(roomNameInput.value || 'my-room');
    roomLinkInput.value = BASE_URL + code;
}

roomNameInput && roomNameInput.addEventListener('input', updateRoomLink);
addRoomBtn && addRoomBtn.addEventListener('click', openModal);
closeModalBtn && closeModalBtn.addEventListener('click', closeModal);
createRoomModal && createRoomModal.addEventListener('click', (e) => {
    if (e.target === createRoomModal) closeModal();
});

createRoomForm && createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = roomNameInput.value.trim();
    const code = generateRoomCode(name);
    const created = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newRoom = {
        name,
        code,
        created,
        language: roomLanguageInput.value,
        groups: roomGroupsInput.value,
        starterCode: roomStarterCodeInput.value,
        lock: lockRoomInput.checked,
        runnable: runnableCodeInput.checked,
        hints: hintsInput.checked
    };
    sampleRooms.unshift(newRoom);
    renderRooms();
    closeModal();
    showRoomIDE(newRoom); // Show IDE immediately after creation
});

// Initial render
renderRooms();

// --- ROOM/IDE VIEW LOGIC ---
const roomIdeView = document.getElementById('room-ide-view');
const roomTitle = document.getElementById('room-title');
const roomCode = document.getElementById('room-code');
const monacoEditorRoom = document.getElementById('monaco-editor-room');
const floatingControls = document.getElementById('floating-controls');
const roomMenuBtn = document.getElementById('room-menu-btn');
const roomMenuDropdown = document.getElementById('room-menu-dropdown');

function showRoomIDE(room) {
    // Hide main UI, show IDE view
    document.querySelector('.main-content-ui').style.display = 'none';
    roomIdeView.classList.remove('hidden');
    roomTitle.textContent = room.name;
    roomCode.textContent = room.code;
    // Monaco Editor
    monacoEditorRoom.innerHTML = '';
    require(['vs/editor/editor.main'], function () {
        monaco.editor.create(monacoEditorRoom, {
            value: room.starterCode || '',
            language: (room.language || 'javascript').toLowerCase(),
            theme: 'vs-dark',
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true,
        });
    });
    // Close dropdown if open
    roomMenuBtn.parentElement.classList.remove('open');
}

// Show IDE view when clicking a room in the sidebar or table
roomList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const room = sampleRooms.find(r => r.name === e.target.textContent);
        if (room) showRoomIDE(room);
    }
});
roomsTableBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (tr) {
        const name = tr.children[0].textContent;
        const room = sampleRooms.find(r => r.name === name);
        if (room) showRoomIDE(room);
    }
});

// Dropdown menu logic
roomMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    roomMenuBtn.parentElement.classList.toggle('open');
});
document.body.addEventListener('click', (e) => {
    if (!roomMenuBtn.contains(e.target) && !roomMenuDropdown.contains(e.target)) {
        roomMenuBtn.parentElement.classList.remove('open');
    }
});

// Floating controls animation (show on editor hover/focus)
monacoEditorRoom.addEventListener('mouseenter', () => {
    floatingControls.style.opacity = 1;
    floatingControls.style.top = '30px';
});
monacoEditorRoom.addEventListener('mouseleave', () => {
    floatingControls.style.opacity = 0;
    floatingControls.style.top = '50px';
});

// --- GEMINI-INSPIRED PARTICLE ANIMATION ---
const bg = document.querySelector('.animated-bg');
const particles = [];
const colors = ['#4f8cff', '#6a82fb', '#fff'];
for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'gemini-particle';
    p.style.position = 'absolute';
    p.style.width = p.style.height = `${Math.random() * 18 + 8}px`;
    p.style.borderRadius = '50%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)] + '33';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.filter = 'blur(1.5px)';
    bg.appendChild(p);
    particles.push({el: p, dx: Math.random() * 0.5 + 0.2, dy: Math.random() * 0.5 + 0.2});
}
function animateParticles() {
    for (const p of particles) {
        let left = parseFloat(p.el.style.left);
        let top = parseFloat(p.el.style.top);
        left += p.dx * (Math.random() > 0.5 ? 1 : -1);
        top += p.dy * (Math.random() > 0.5 ? 1 : -1);
        if (left < 0) left = 100; if (left > 100) left = 0;
        if (top < 0) top = 100; if (top > 100) top = 0;
        p.el.style.left = left + '%';
        p.el.style.top = top + '%';
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- SHOW IDE IF URL IS /room/:code ---
function getRoomCodeFromURL() {
    const match = window.location.pathname.match(/^\/room\/([a-zA-Z0-9\-_]+)/);
    return match ? match[1] : null;
}

window.addEventListener('DOMContentLoaded', () => {
    const code = getRoomCodeFromURL();
    if (code) {
        const room = sampleRooms.find(r => r.code === code);
        if (room) {
            showRoomIDE(room);
        } else {
            // Show not found message or fallback
            document.body.innerHTML = '<div style="color:#fff;text-align:center;margin-top:10vh;font-size:2rem;">Room not found</div>';
        }
    }
}); 