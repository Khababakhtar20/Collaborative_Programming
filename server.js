const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Redis = require('redis');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Redis client for session management
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codenest', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle workspace joining
    socket.on('join-workspace', (workspaceId) => {
        socket.join(workspaceId);
        console.log(`Client joined workspace: ${workspaceId}`);
    });

    // Handle editor changes
    socket.on('editor-change', (data) => {
        socket.to(data.workspaceId).emit('editor-change', data);
    });

    // Handle terminal commands
    socket.on('terminal-command', (data) => {
        socket.to(data.workspaceId).emit('terminal-output', data);
    });

    // Handle file operations
    socket.on('file-operation', (data) => {
        socket.to(data.workspaceId).emit('file-update', data);
    });

    // Handle collaboration events
    socket.on('collaborator-joined', (data) => {
        socket.to(data.workspaceId).emit('collaborator-joined', data);
    });

    socket.on('collaborator-left', (data) => {
        socket.to(data.workspaceId).emit('collaborator-left', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Workspace routes
app.get('/api/workspaces', async (req, res) => {
    try {
        // TODO: Implement workspace listing
        res.json({ workspaces: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/workspaces', async (req, res) => {
    try {
        // TODO: Implement workspace creation
        res.json({ message: 'Workspace created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File routes
app.get('/api/files/:workspaceId', async (req, res) => {
    try {
        // TODO: Implement file listing
        res.json({ files: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/files/:workspaceId', async (req, res) => {
    try {
        // TODO: Implement file creation
        res.json({ message: 'File created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Git routes
app.post('/api/git/:workspaceId/commit', async (req, res) => {
    try {
        // TODO: Implement git commit
        res.json({ message: 'Changes committed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all unknown routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 