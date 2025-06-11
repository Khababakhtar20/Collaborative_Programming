const CONFIG = {
    // Server Configuration
    SERVER: {
        HOST: 'localhost',
        PORT: 3000,
        WS_PATH: '/socket.io'
    },

    // Editor Configuration
    EDITOR: {
        DEFAULT_LANGUAGE: 'javascript',
        THEME: 'vs-dark',
        FONT_SIZE: 14,
        TAB_SIZE: 4,
        MINIMAP: true,
        WORD_WRAP: 'on'
    },

    // Terminal Configuration
    TERMINAL: {
        FONT_SIZE: 14,
        FONT_FAMILY: 'Consolas, monospace',
        CURSOR_BLINK: true,
        THEME: {
            background: '#2c3e50',
            foreground: '#ecf0f1'
        }
    },

    // AI Assistant Configuration
    AI_ASSISTANT: {
        API_ENDPOINT: 'https://api.codenest.ai/assistant',
        MAX_MESSAGE_LENGTH: 1000,
        RESPONSE_TIMEOUT: 30000
    },

    // Git Configuration
    GIT: {
        AUTO_FETCH_INTERVAL: 30000, // 30 seconds
        MAX_FILE_SIZE: 1024 * 1024 // 1MB
    },

    // File Types and Icons
    FILE_TYPES: {
        'js': {
            icon: 'fa-js',
            language: 'javascript',
            extensions: ['.js']
        },
        'html': {
            icon: 'fa-html5',
            language: 'html',
            extensions: ['.html', '.htm']
        },
        'css': {
            icon: 'fa-css3',
            language: 'css',
            extensions: ['.css']
        },
        'json': {
            icon: 'fa-code',
            language: 'json',
            extensions: ['.json']
        },
        'md': {
            icon: 'fa-markdown',
            language: 'markdown',
            extensions: ['.md', '.markdown']
        },
        'default': {
            icon: 'fa-file',
            language: 'plaintext',
            extensions: []
        }
    },

    // Collaboration Settings
    COLLABORATION: {
        CURSOR_COLORS: [
            '#FF5733', // Red
            '#33FF57', // Green
            '#3357FF', // Blue
            '#F333FF', // Purple
            '#FF33F3', // Pink
            '#33FFF3'  // Cyan
        ],
        PING_INTERVAL: 30000, // 30 seconds
        RECONNECT_ATTEMPTS: 5,
        RECONNECT_DELAY: 1000 // 1 second
    },

    // Security Settings
    SECURITY: {
        SESSION_TIMEOUT: 3600000, // 1 hour
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: [
            '.js', '.html', '.css', '.json', '.md',
            '.py', '.java', '.cpp', '.c', '.php',
            '.rb', '.go', '.rs', '.ts', '.jsx',
            '.tsx', '.vue', '.svelte'
        ]
    },

    // UI Settings
    UI: {
        SIDEBAR_WIDTH: 250,
        RIGHT_SIDEBAR_WIDTH: 300,
        HEADER_HEIGHT: 40,
        TERMINAL_HEIGHT: 200
    }
};

// Make config available globally
window.CONFIG = CONFIG; 