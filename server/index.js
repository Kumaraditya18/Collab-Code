const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ✅ Updated CORS for local + production (Vercel)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://collab-code-lemon.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// 👇 Dynamically import node-fetch to avoid ESM error
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 💻 Code execution endpoint (using Piston API)
app.post('/run', async (req, res) => {
  const { code, language } = req.body;

  const languageVersions = {
    javascript: '18.15.0',
    python: '3.10.0',
    cpp: '10.2.0',
    java: '15.0.2',
    csharp: '6.12.0',
    go: '1.20.0',
    rust: '1.68.0',
  };

  const version = languageVersions[language];

  if (!version) {
    return res.status(400).send({ output: '❌ Unsupported language or missing version' });
  }

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: code }],
      }),
    });

    const data = await response.json();
    res.send({ output: data.run?.output || '✅ Executed but no output' });
  } catch (err) {
    console.error('Execution error:', err);
    res.send({ output: '❌ Error executing code' });
  }
});

// 🧠 In-memory storage for code and chat per room
const roomCodeStore = {};
const roomChatStore = {};

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // 🧩 Join a room and re-sync code + chat
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`🛏️ ${socket.id} joined room: ${roomId}`);

    // Send existing code (if any)
    if (roomCodeStore[roomId]) {
      socket.emit('init-code', roomCodeStore[roomId]);
    }

    // Send existing chat history (if any)
    if (roomChatStore[roomId]) {
      socket.emit('init-chat', roomChatStore[roomId]);
    }
  });

  // 🔁 Code change broadcast
  socket.on('code-change', ({ room, code }) => {
    roomCodeStore[room] = code;
    socket.to(room).emit('code-change', code);
  });

  // 💬 Chat message handler with timestamp + sender
  socket.on('chat-message', ({ room, message, sender }) => {
    if (!roomChatStore[room]) roomChatStore[room] = [];

    const msgData = {
      text: message,
      sender: sender || 'Anonymous',
      timestamp: Date.now(),
    };

    roomChatStore[room].push(msgData);
    socket.to(room).emit('chat-message', msgData);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
