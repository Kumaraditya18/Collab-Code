import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import Editor from './components/Editor';
import JoinRoom from './components/JoinRoom';
import Chat from './components/Chat';

const socket = io('http://localhost:3001', { autoConnect: false });

function App() {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const codeRef = useRef('');

  const joinRoom = () => {
    if (room.trim()) {
      socket.connect();
      socket.emit('join-room', room);
      setJoined(true);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected:', socket.id);
    });

    socket.on('init-code', (existingCode) => {
      codeRef.current = existingCode;
      setCode(existingCode);
    });

    socket.on('init-chat', (messages) => {
      setChatMessages(messages);
    });

    socket.on('code-change', (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        setCode(newCode);
      }
    });

    socket.on('chat-message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCodeChange = (value) => {
    if (value !== codeRef.current) {
      codeRef.current = value;
      setCode(value);
      socket.emit('code-change', { room, code: value });
    }
  };

  const sendMessage = (msg) => {
    const message = {
      sender: socket.id,
      text: msg,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, message]);
    socket.emit('chat-message', { room, message });
  };

  const runCode = async (code) => {
    try {
      const res = await fetch('http://localhost:3001/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      return data.output;
    } catch (err) {
      return '❌ Error running code';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      {!joined ? (
        <JoinRoom room={room} setRoom={setRoom} joinRoom={joinRoom} />
      ) : (
        <>
          <Header room={room} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
            <div className="col-span-2">
              <Editor
                code={code}
                handleChange={handleCodeChange}
                onRun={runCode}
                language={language}
                setLanguage={setLanguage}
              />
            </div>
            <Chat messages={chatMessages} sendMessage={sendMessage} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
