const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  findUserByEmailOrUsername,
  findUserById,
  createUser,
} = require('./usersStore');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'collabcode_jwt_secret_key_2026';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static compiled client app
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    req.user = { id: user.id, username: user.username, email: user.email };
    next();
  });
};

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH ENDPOINTS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !username.trim() || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = findUserByEmailOrUsername(cleanEmail) || findUserByEmailOrUsername(cleanUsername);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const newUser = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    createUser(newUser);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      token,
      message: 'Account created successfully.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during account registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required.' });
    }

    const user = findUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials provided.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials provided.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
      message: 'Logged in successfully.',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ENHANCED CODE RUNNER ENDPOINT WITH STDIN SUPPORT
app.post('/run', async (req, res) => {
  const { code, language, stdin } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).send({ output: 'No code provided for execution.' });
  }

  const languageMap = {
    javascript: { name: 'javascript', version: '18.15.0' },
    typescript: { name: 'typescript', version: '5.0.3' },
    python: { name: 'python', version: '3.10.0' },
    cpp: { name: 'cpp', version: '10.2.0' },
    java: { name: 'java', version: '15.0.2' },
    csharp: { name: 'csharp', version: '6.12.0' },
    go: { name: 'go', version: '1.20.0' },
    rust: { name: 'rust', version: '1.68.0' },
  };

  const targetLang = languageMap[language] || { name: language, version: '*' };

  try {
    const fetchModule = await import('node-fetch');
    const fetchFunc = fetchModule.default || fetchModule;

    const response = await fetchFunc('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: targetLang.name,
        version: targetLang.version,
        files: [{ content: code }],
        stdin: stdin || '',
      }),
    });

    const data = await response.json();

    if (data.run) {
      let result = '';
      if (data.run.stdout) result += data.run.stdout;
      if (data.run.stderr) result += (result ? '\n-- Standard Error --\n' : '') + data.run.stderr;
      if (!result) result = 'Execution completed with no output.';
      res.send({ output: result, code: data.run.code });
    } else if (data.message) {
      res.send({ output: `Execution Error: ${data.message}` });
    } else {
      res.send({ output: 'Unable to execute code at this time.' });
    }
  } catch (err) {
    console.error('Code execution error:', err);
    res.status(500).send({ output: 'Server error while processing code execution request.' });
  }
});

// Fallback route for SPA client routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/run' || req.path === '/health') {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('CollabCode Advanced Server is running');
  }
});

// IN-MEMORY MULTI-FILE AND ROOM STORE
const roomCodeStore = {};
const roomFilesStore = {};
const roomActiveFileStore = {};
const roomChatStore = {};
const roomUsersStore = {};

const DEFAULT_FILES = [
  {
    id: 'file_main',
    name: 'main.js',
    content: '// Welcome to CollabCode Workspace\nconsole.log("Hello, Collaborative Coding World!");\n\nfunction calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log("Sum calculation:", calculateSum(12, 34));\n',
    language: 'javascript',
  },
];

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUserName = 'Anonymous';

  socket.on('join-room', ({ roomId, userName }) => {
    if (!roomId) return;

    currentRoom = roomId;
    currentUserName = userName && userName.trim() ? userName.trim() : 'Guest';

    socket.join(roomId);

    if (!roomUsersStore[roomId]) {
      roomUsersStore[roomId] = [];
    }

    roomUsersStore[roomId] = roomUsersStore[roomId].filter((u) => u.socketId !== socket.id);
    roomUsersStore[roomId].push({ socketId: socket.id, userName: currentUserName });

    if (!roomFilesStore[roomId] || roomFilesStore[roomId].length === 0) {
      roomFilesStore[roomId] = JSON.parse(JSON.stringify(DEFAULT_FILES));
      roomActiveFileStore[roomId] = DEFAULT_FILES[0].id;
    }

    socket.emit('init-files', {
      files: roomFilesStore[roomId],
      activeFileId: roomActiveFileStore[roomId],
    });

    if (roomCodeStore[roomId] !== undefined) {
      socket.emit('init-code', roomCodeStore[roomId]);
    }
    if (roomChatStore[roomId]) {
      socket.emit('init-chat', roomChatStore[roomId]);
    }

    io.to(roomId).emit('room-users', roomUsersStore[roomId]);

    const systemMsg = {
      type: 'system',
      text: `${currentUserName} joined the room`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (!roomChatStore[roomId]) roomChatStore[roomId] = [];
    roomChatStore[roomId].push(systemMsg);
    io.to(roomId).emit('chat-message', systemMsg);
  });

  socket.on('file-create', ({ room, file }) => {
    if (!room || !file) return;
    if (!roomFilesStore[room]) roomFilesStore[room] = [];

    roomFilesStore[room].push(file);
    roomActiveFileStore[room] = file.id;

    io.to(room).emit('files-updated', {
      files: roomFilesStore[room],
      activeFileId: file.id,
    });
  });

  socket.on('file-select', ({ room, fileId }) => {
    if (!room || !fileId) return;
    roomActiveFileStore[room] = fileId;
    socket.to(room).emit('active-file-changed', fileId);
  });

  socket.on('file-content-change', ({ room, fileId, content }) => {
    if (!room || !fileId) return;

    if (roomFilesStore[room]) {
      const targetFile = roomFilesStore[room].find((f) => f.id === fileId);
      if (targetFile) {
        targetFile.content = content;
      }
    }

    socket.to(room).emit('file-content-change', { fileId, content });
  });

  socket.on('file-delete', ({ room, fileId }) => {
    if (!room || !fileId) return;

    if (roomFilesStore[room] && roomFilesStore[room].length > 1) {
      roomFilesStore[room] = roomFilesStore[room].filter((f) => f.id !== fileId);
      if (roomActiveFileStore[room] === fileId) {
        roomActiveFileStore[room] = roomFilesStore[room][0].id;
      }

      io.to(room).emit('files-updated', {
        files: roomFilesStore[room],
        activeFileId: roomActiveFileStore[room],
      });
    }
  });

  socket.on('file-rename', ({ room, fileId, newName }) => {
    if (!room || !fileId || !newName) return;

    if (roomFilesStore[room]) {
      const file = roomFilesStore[room].find((f) => f.id === fileId);
      if (file) {
        file.name = newName;
        io.to(room).emit('files-updated', {
          files: roomFilesStore[room],
          activeFileId: roomActiveFileStore[room],
        });
      }
    }
  });

  socket.on('webrtc-signal', ({ room, signal, targetSocketId }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-signal', {
        signal,
        senderSocketId: socket.id,
        senderName: currentUserName,
      });
    } else {
      socket.to(room).emit('webrtc-signal', {
        signal,
        senderSocketId: socket.id,
        senderName: currentUserName,
      });
    }
  });

  socket.on('chat-message', ({ room, message, senderName }) => {
    if (!room || !message) return;
    if (!roomChatStore[room]) roomChatStore[room] = [];

    const msgData = {
      type: 'user',
      text: message,
      senderName: senderName || currentUserName || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    roomChatStore[room].push(msgData);
    io.to(room).emit('chat-message', msgData);
  });

  socket.on('disconnect', () => {
    if (currentRoom && roomUsersStore[currentRoom]) {
      roomUsersStore[currentRoom] = roomUsersStore[currentRoom].filter((u) => u.socketId !== socket.id);

      io.to(currentRoom).emit('room-users', roomUsersStore[currentRoom]);

      const systemMsg = {
        type: 'system',
        text: `${currentUserName} left the room`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (roomChatStore[currentRoom]) {
        roomChatStore[currentRoom].push(systemMsg);
      }
      io.to(currentRoom).emit('chat-message', systemMsg);
    }
  });
});

server.listen(PORT, () => {
  console.log(`CollabCode Advanced Server running on port ${PORT}`);
});
