import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import Editor from './components/Editor';
import JoinRoom from './components/JoinRoom';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import ShareModal from './components/ShareModal';
import VideoCallDrawer from './components/VideoCallDrawer';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import { parseResponseJson } from './utils/api';

// Resolve backend URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://collab-code-81ih.onrender.com');

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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiDebugOutput, setAiDebugOutput] = useState('');
  const [joined, setJoined] = useState(false);

  // Multi-file workspace state
  const [files, setFiles] = useState([
    {
      id: 'file_main',
      name: 'main.js',
      content: '// Welcome to CollabCode Workspace\nconsole.log("Hello, Collaborative Coding World!");\n\nfunction calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log("Sum calculation:", calculateSum(12, 34));\n',
      language: 'javascript',
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('file_main');

  const [chatMessages, setChatMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState('');

  const filesRef = useRef(files);
  const activeFileIdRef = useRef(activeFileId);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
    const currentFileObj = files.find((f) => f.id === activeFileId);
    if (currentFileObj) {
      setLanguage(currentFileObj.language);
    }
  }, [activeFileId, files]);

  // Load saved user & room URL params on mount
  useEffect(() => {
    const checkAuthAndParams = async () => {
      try {
        const token = localStorage.getItem('collabcode_token');
        if (token) {
          const res = await fetch(`${SERVER_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await parseResponseJson(res);
            if (data.user) {
              setCurrentUser(data.user);
              setUserName(data.user.username);
            }
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

  const joinRoomWithUser = (userObj, roomTarget, targetRoomType = 'public') => {
    const r = (roomTarget || room).trim();
    const u = (userObj?.username || userName || 'Guest').trim();

    if (r && u) {
      try {
        localStorage.setItem('collabcode_user_name', u);
        saveToRecentRooms(r);
      } catch {
        // Ignore
      }

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join-room', { roomId: r, userName: u, roomType: targetRoomType });
      setJoined(true);
    }
  };

  const joinRoom = (selectedType = 'public') => {
    if (selectedType === 'private' && !currentUser) {
      setIsAuthOpen(true);
      return;
    }
    joinRoomWithUser(currentUser, room, selectedType);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setUserName(user.username);
    try {
      localStorage.setItem('collabcode_user_name', user.username);
    } catch {
      // Ignore
    }
    setIsAuthOpen(false);

    if (room.trim()) {
      joinRoomWithUser(user, room);
    }
  };

  const leaveRoom = () => {
    socket.disconnect();
    setJoined(false);
    setChatMessages([]);
    setRoomUsers([]);
    setIsConnected(false);
    setIsVideoOpen(false);
    setIsAiOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('collabcode_token');
    localStorage.removeItem('collabcode_user');
    setCurrentUser(null);
    leaveRoom();
  };

  // Socket event handling
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onInitFiles = ({ files: roomFiles, activeFileId: roomActiveId }) => {
      if (roomFiles && roomFiles.length > 0) {
        setFiles(roomFiles);
        setActiveFileId(roomActiveId || roomFiles[0].id);
      }
    };

    const onFilesUpdated = ({ files: newFiles, activeFileId: newActiveId }) => {
      setFiles(newFiles);
      if (newActiveId) {
        setActiveFileId(newActiveId);
      }
    };

    const onActiveFileChanged = (fileId) => {
      setActiveFileId(fileId);
    };

    const onFileContentChange = ({ fileId, content }) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, content } : f))
      );
    };

    const onInitChat = (messages) => {
      setChatMessages(messages || []);
    };

    const onRoomUsers = (users) => {
      setRoomUsers(users || []);
    };

    const onChatMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('init-files', onInitFiles);
    socket.on('files-updated', onFilesUpdated);
    socket.on('active-file-changed', onActiveFileChanged);
    socket.on('file-content-change', onFileContentChange);
    socket.on('init-chat', onInitChat);
    socket.on('room-users', onRoomUsers);
    socket.on('chat-message', onChatMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('init-files', onInitFiles);
      socket.off('files-updated', onFilesUpdated);
      socket.off('active-file-changed', onActiveFileChanged);
      socket.off('file-content-change', onFileContentChange);
      socket.off('init-chat', onInitChat);
      socket.off('room-users', onRoomUsers);
      socket.off('chat-message', onChatMessage);
    };
  }, []);

  // Multi-File Manager Handlers
  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
    if (joined) {
      socket.emit('file-select', { room, fileId });
    }
  };

  const handleCreateFile = (newFileObj) => {
    setFiles((prev) => [...prev, newFileObj]);
    setActiveFileId(newFileObj.id);
    if (joined) {
      socket.emit('file-create', { room, file: newFileObj });
    }
  };

  const handleDeleteFile = (fileIdToDelete) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== fileIdToDelete);
    setFiles(remaining);
    if (activeFileId === fileIdToDelete) {
      setActiveFileId(remaining[0].id);
    }
    if (joined) {
      socket.emit('file-delete', { room, fileId: fileIdToDelete });
    }
  };

  const handleImportFile = (importedFileObj) => {
    setFiles((prev) => [...prev, importedFileObj]);
    setActiveFileId(importedFileObj.id);
    if (joined) {
      socket.emit('file-create', { room, file: importedFileObj });
    }
  };

  const handleExportAll = () => {
    const projectData = JSON.stringify(files, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `collabcode_workspace_${room || 'export'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (newContent) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
    if (joined) {
      socket.emit('file-content-change', {
        room,
        fileId: activeFileId,
        content: newContent,
      });
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

  const runCode = async (codeToRun, stdinInput) => {
    try {
      const token = localStorage.getItem('collabcode_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${SERVER_URL}/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: codeToRun, language, stdin: stdinInput }),
      });
      const data = await parseResponseJson(res);
      return data.output || data.error || 'Execution completed with no output.';
    } catch (err) {
      return `Error executing code: ${err.message || 'Server connection failed'}`;
    }
  };

  const handleApplyAiFix = (fixedCode) => {
    if (!fixedCode) return;
    handleCodeChange(fixedCode);
    setIsAiOpen(false);
  };

  const handleAskAiToDebug = (output) => {
    setAiDebugOutput(output);
    setIsAiOpen(true);
  };

  const currentFileObj = files.find((f) => f.id === activeFileId) || files[0];
  const activeCodeContent = currentFileObj ? currentFileObj.content : '';

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        serverUrl={SERVER_URL}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        room={room}
        userName={userName}
      />

      <VideoCallDrawer
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        room={room}
        userName={userName}
        currentUser={currentUser}
      />

      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={activeCodeContent}
        language={language}
        executionOutput={aiDebugOutput}
        onApplyFix={handleApplyAiFix}
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
          serverUrl={SERVER_URL}
        />
      ) : (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          <Header
            room={room}
            isConnected={isConnected}
            userCount={roomUsers.length}
            onLeave={leaveRoom}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onOpenShare={() => setIsShareOpen(true)}
            onToggleVideo={() => setIsVideoOpen(!isVideoOpen)}
            isVideoOpen={isVideoOpen}
            onToggleAi={() => setIsAiOpen(!isAiOpen)}
            isAiOpen={isAiOpen}
          />

          <main className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 h-full overflow-hidden p-3 md:p-4">
              <Editor
                code={activeCodeContent}
                handleChange={handleCodeChange}
                onRun={runCode}
                language={language}
                setLanguage={setLanguage}
                files={files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onImportFile={handleImportFile}
                onExportAll={handleExportAll}
                onToggleAi={() => setIsAiOpen(!isAiOpen)}
                onAskAiToDebug={handleAskAiToDebug}
              />
            </div>

            <Sidebar
              roomUsers={roomUsers}
              messages={chatMessages}
              sendMessage={sendMessage}
              currentUserName={userName}
              socketId={socketId}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
