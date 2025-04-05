const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
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

// 💻 Code execution endpoint
app.post('/run', async (req, res) => {
  const { code, language } = req.body;

  // You can add more mappings as needed
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


const roomCodeStore = {};
const roomChatStore = {};

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`🛏️ ${socket.id} joined room: ${roomId}`);

    if (roomCodeStore[roomId]) {
      socket.emit('init-code', roomCodeStore[roomId]);
    }
    if (roomChatStore[roomId]) {
      socket.emit('init-chat', roomChatStore[roomId]);
    }
  });

  socket.on('code-change', ({ room, code }) => {
    roomCodeStore[room] = code;
    socket.to(room).emit('code-change', code);
  });

  socket.on('chat-message', ({ room, message }) => {
    if (!roomChatStore[room]) roomChatStore[room] = [];
    roomChatStore[room].push(message);
    socket.to(room).emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
