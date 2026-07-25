import { useState, useEffect } from 'react';
import { parseResponseJson } from '../utils/api';

const JoinRoom = ({
  room,
  setRoom,
  userName,
  setUserName,
  joinRoom,
  currentUser,
  onOpenAuth,
  onLogout,
  serverUrl,
}) => {
  const [roomType, setRoomType] = useState('public'); // public | private
  const [recentRooms, setRecentRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('editor');

  // Auto-sync display name when user is signed in
  useEffect(() => {
    if (currentUser?.username) {
      setUserName(currentUser.username);
    }
  }, [currentUser, setUserName]);

  // Fetch active rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await fetch(`${serverUrl}/api/rooms`);
        if (res.ok) {
          const data = await parseResponseJson(res);
          if (data.rooms) {
            setAvailableRooms(data.rooms);
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [serverUrl]);

  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem('collabcode_recent_rooms');
      if (savedRooms) {
        setRecentRooms(JSON.parse(savedRooms).slice(0, 4));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleGenerateRoom = () => {
    const prefix = roomType === 'private' ? 'private' : 'public';
    const randomId = `${prefix}-${Math.random().toString(36).substring(2, 8)}-${Math.floor(100 + Math.random() * 900)}`;
    setRoom(randomId);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError('Please enter a display name to proceed.');
      return;
    }

    if (!room.trim()) {
      setError('Please enter a room identifier.');
      return;
    }

    // If attempting to join or create a Private Room, enforce login
    if (roomType === 'private' && !currentUser) {
      setError('Authentication required: You must sign in to create or join Private Rooms.');
      onOpenAuth();
      return;
    }

    try {
      // Register room type with backend
      const token = localStorage.getItem('collabcode_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${serverUrl}/api/rooms/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ roomId: room.trim(), roomType }),
      });
    } catch {
      // Continue anyway
    }

    setError('');
    joinRoom(roomType);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none">
      <div className="w-full max-w-6xl mx-auto space-y-8">

        {/* Navbar Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">CollabCode</span>
            <span className="text-xs px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold uppercase tracking-wider rounded">
              Enterprise Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{currentUser.username}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-xs px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Hero & Public Rooms */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-slate-200/80 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-md mb-3">
                Collaborative Code Environment
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Public & Private <br />Coding Workspaces.
              </h1>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xl">
                Join open Public Rooms for instant code sharing, or authenticate to create secure Private Rooms for enterprise pair programming.
              </p>
            </div>

            {/* Platform Feature Suite */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Workspace Capabilities
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Click tab to preview</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('editor')}
                  className={`py-2 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                    activePreviewTab === 'editor'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Multi-File IDE
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('compiler')}
                  className={`py-2 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                    activePreviewTab === 'compiler'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Code Execution
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('video')}
                  className={`py-2 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                    activePreviewTab === 'video'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Video Call Drawer
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('ai')}
                  className={`py-2 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                    activePreviewTab === 'ai'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Free AI Assistant
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[110px]">
                {activePreviewTab === 'editor' && (
                  <div>
                    <div className="text-xs font-bold text-slate-900">Multi-File Workspace</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Real-time multi-file editor (`.js`, `.py`, `.cpp`, `.java`, `.ts`, `.json`) with live cursor sync, file import/export, and light mode formatting.
                    </p>
                  </div>
                )}
                {activePreviewTab === 'compiler' && (
                  <div>
                    <div className="text-xs font-bold text-slate-900">Judge0 Execution Engine</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Instant code compilation across 8+ languages with standard input (`stdin`) and standard output (`stdout`) terminal panes.
                    </p>
                  </div>
                )}
                {activePreviewTab === 'video' && (
                  <div>
                    <div className="text-xs font-bold text-slate-900">WebRTC Video & Audio Conference</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Built-in video call drawer that automatically authenticates members using display names without extra logins.
                    </p>
                  </div>
                )}
                {activePreviewTab === 'ai' && (
                  <div>
                    <div className="text-xs font-bold text-slate-900">100% Free AI Code Support</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Step-by-step code explanations, automated bug diagnosis, refactoring, and 1-click **"Apply Fix to Editor"** patch generation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Public Rooms Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Available Public Rooms {availableRooms.length > 0 ? `(${availableRooms.length})` : ''}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setLoadingRooms(true);
                    try {
                      const res = await fetch(`${serverUrl}/api/rooms`);
                      if (res.ok) {
                        const data = await parseResponseJson(res);
                        if (data.rooms) setAvailableRooms(data.rooms);
                      }
                    } catch {
                      // Ignore
                    } finally {
                      setLoadingRooms(false);
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingRooms ? (
                <div className="text-xs text-slate-400 py-3 italic">Scanning rooms...</div>
              ) : availableRooms.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 italic bg-slate-50 border border-slate-200 rounded-lg px-3.5">
                  No public rooms listed. Create one on the right to start coding.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableRooms.map((r) => (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {r.roomId}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                            r.type === 'private'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {r.type === 'private' ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {r.userCount} {r.userCount === 1 ? 'user' : 'users'} online • {r.activeLanguage}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRoom(r.roomId);
                          setRoomType(r.type || 'public');
                          if (r.type === 'private' && !currentUser) {
                            setError('Private rooms require authentication. Please sign in to join.');
                            onOpenAuth();
                          } else {
                            joinRoom(r.type);
                          }
                        }}
                        className="text-xs px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
                      >
                        Join Room
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Room Creation & Entry Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">

            {/* Room Type Selector Tabs */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Room Privacy Mode
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRoomType('public');
                    if (error) setError('');
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-md text-center transition-all cursor-pointer ${
                    roomType === 'public'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Public Room (Open)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoomType('private');
                    if (!currentUser) {
                      setError('Sign in required for Private Rooms.');
                    } else if (error) {
                      setError('');
                    }
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-md text-center transition-all cursor-pointer ${
                    roomType === 'private'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Private Room (Signed In)
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 italic">
                {roomType === 'public'
                  ? 'Anyone can view and write code in Public Rooms.'
                  : 'Requires user login. Only authenticated members can access.'}
              </div>
            </div>

            {/* Room Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  {roomType === 'private' ? 'Join Private Room' : 'Join Public Room'}
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {roomType.toUpperCase()}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-md text-xs text-slate-800 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="userName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  id="userName"
                  type="text"
                  placeholder="Enter display name"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-hidden transition-colors"
                  autoComplete="name"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="roomId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Room Identifier
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRoom}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Generate ID
                  </button>
                </div>
                <input
                  id="roomId"
                  type="text"
                  placeholder={roomType === 'private' ? 'e.g. private-team-42' : 'e.g. public-js-playground'}
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-hidden transition-colors"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-md shadow-xs transition-colors cursor-pointer mt-2"
              >
                {roomType === 'private' && !currentUser
                  ? 'Sign In to Access Private Room'
                  : 'Enter Workspace Room'}
              </button>
            </form>

            {/* Recent Workspaces */}
            {recentRooms.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="block text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">
                  Recent Workspaces
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentRooms.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRoom(r);
                        joinRoom();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Metrics */}
        <footer className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            CollabCode &copy; 2026 Enterprise Collaborative Workspace Platform.
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <span>Public & Private Rooms</span>
            <span>•</span>
            <span>Judge0 Execution</span>
            <span>•</span>
            <span>WebRTC Video</span>
            <span>•</span>
            <span>Free AI Engine</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default JoinRoom;
