import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import Editor from './components/Editor';
import JoinRoom from './components/JoinRoom';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : window.location.origin);

const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [room, setRoom] = useState('');
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState('');

  const codeRef = useRef('');

  // Check saved token and query params on mount
  useEffect(() => {
    const checkAuthAndParams = async () => {
      try {
        const token = localStorage.getItem('collabcode_token');
        if (token) {
          const res = await fetch(`${SERVER_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setUserName(data.user.username);
          } else {
            localStorage.removeItem('collabcode_token');
            localStorage.removeItem('collabcode_user');
          }
        } else {
          const savedName = localStorage.getItem('collabcode_user_name');
          if (savedName) setUserName(savedName);
        }

        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
          setRoom(roomParam);
        }
      } catch {
        // Fallback
      }
    };

    checkAuthAndParams();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setUserName(user.username);
    try {
      localStorage.setItem('collabcode_user_name', user.username);
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('collabcode_token');
    localStorage.removeItem('collabcode_user');
    setCurrentUser(null);
  };

  const saveToRecentRooms = (roomToSave) => {
    try {
      const saved = localStorage.getItem('collabcode_recent_rooms');
      let roomsArr = saved ? JSON.parse(saved) : [];
      roomsArr = [roomToSave, ...roomsArr.filter((r) => r !== roomToSave)].slice(0, 5);
      localStorage.setItem('collabcode_recent_rooms', JSON.stringify(roomsArr));
    } catch {
      // Ignore
    }
  };

  const joinRoom = () => {
    if (room.trim() && userName.trim()) {
      try {
        localStorage.setItem('collabcode_user_name', userName.trim());
        saveToRecentRooms(room.trim());
      } catch {
        // Ignore
      }

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join-room', { roomId: room.trim(), userName: userName.trim() });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.disconnect();
    setJoined(false);
    setChatMessages([]);
    setRoomUsers([]);
    setIsConnected(false);
  };

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onInitCode = (existingCode) => {
      codeRef.current = existingCode;
      setCode(existingCode);
    };

    const onInitChat = (messages) => {
      setChatMessages(messages || []);
    };

    const onRoomUsers = (users) => {
      setRoomUsers(users || []);
    };

    const onCodeChange = (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        setCode(newCode);
      }
    };

    const onChatMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('init-code', onInitCode);
    socket.on('init-chat', onInitChat);
    socket.on('room-users', onRoomUsers);
    socket.on('code-change', onCodeChange);
    socket.on('chat-message', onChatMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('init-code', onInitCode);
      socket.off('init-chat', onInitChat);
      socket.off('room-users', onRoomUsers);
      socket.off('code-change', onCodeChange);
      socket.off('chat-message', onChatMessage);
    };
  }, []);

  const handleCodeChange = (value) => {
    if (value !== codeRef.current) {
      codeRef.current = value;
      setCode(value);
      if (joined) {
        socket.emit('code-change', { room, code: value });
      }
    }
  };

  const sendMessage = (msgText) => {
    if (!msgText.trim()) return;
    socket.emit('chat-message', {
      room,
      message: msgText.trim(),
      senderName: userName,
    });
  };

  const runCode = async (codeToRun) => {
    try {
      const token = localStorage.getItem('collabcode_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${SERVER_URL}/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: codeToRun, language }),
      });
      const data = await res.json();
      return data.output;
    } catch (err) {
      return `Error executing code: ${err.message || 'Server connection failed'}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        serverUrl={SERVER_URL}
      />

      {!joined ? (
        <JoinRoom
          room={room}
          setRoom={setRoom}
          userName={userName}
          setUserName={setUserName}
          joinRoom={joinRoom}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          <Header
            room={room}
            isConnected={isConnected}
            userCount={roomUsers.length}
            onLeave={leaveRoom}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
          />

          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 h-full">
              <Editor
                code={code}
                handleChange={handleCodeChange}
                onRun={runCode}
                language={language}
                setLanguage={setLanguage}
              />
            </div>

            <div className="h-[650px] lg:h-[720px] sticky top-6">
              <Sidebar
                roomUsers={roomUsers}
                messages={chatMessages}
                sendMessage={sendMessage}
                currentUserName={userName}
                socketId={socketId}
              />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
