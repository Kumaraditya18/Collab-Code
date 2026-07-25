import { useState, useEffect, useCallback } from 'react';
import { parseResponseJson } from '../utils/api';

const JoinRoom = ({
  room,
  setRoom,
  userName,
  setUserName,
  joinRoom,
  currentUser,
  inviteData,
  onOpenAuth,
  onLogout,
  serverUrl,
}) => {
  const [roomType, setRoomType] = useState('public');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(!!inviteData || !!room);
  const [browseTab, setBrowseTab] = useState('public'); // 'public' | 'my'

  const [recentRooms, setRecentRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('editor');

  // Auto-sync display name when user is signed in
  useEffect(() => {
    if (currentUser?.username) {
      setUserName(currentUser.username);
    }
  }, [currentUser, setUserName]);

  useEffect(() => {
    if (inviteData || (room && room.trim().length > 0)) {
      setIsInvitePopupOpen(true);
    }
  }, [inviteData, room]);

  // Fetch rooms list from API
  const fetchRoomsList = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('collabcode_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${serverUrl}/api/rooms`, { headers });
      if (res.ok) {
        const data = await parseResponseJson(res);
        if (data.rooms) setPublicRooms(data.rooms);
        if (data.myRooms) setMyRooms(data.myRooms);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingRooms(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchRoomsList();
  }, [fetchRoomsList, currentUser]);

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError('Please enter a display name.');
      return;
    }
    if (!room.trim()) {
      setError('Please enter a room code.');
      return;
    }
    if (roomType === 'private' && !currentUser) {
      setError('Private Rooms require authentication. Please sign in.');
      onOpenAuth();
      return;
    }

    try {
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
    setIsCreateModalOpen(false);
    joinRoom(roomType, room.trim());
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError('Please enter your name to enter the room.');
      return;
    }

    setError('');
    setIsInvitePopupOpen(false);
    joinRoom(inviteData?.roomType || 'public', inviteData?.roomId || room, true);
  };

  const handleJoinDirect = (targetRoomId, targetRoomType) => {
    if (targetRoomType === 'private' && !currentUser) {
      setError('Private rooms require authentication. Please sign in to join.');
      onOpenAuth();
      return;
    }
    setRoom(targetRoomId);
    setIsBrowseModalOpen(false);
    joinRoom(targetRoomType || 'public', targetRoomId);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none">
      <div className="w-full max-w-6xl mx-auto space-y-8">

        {/* Top Navbar Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">CollabCode</span>
            <span className="text-xs px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold uppercase tracking-wider rounded">
              Collaborative Workspace
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

          {/* Left Column: Platform Hero & Interactive Workspace Suite */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-slate-200/80 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-md mb-3">
                Real-Time Pair Programming
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Work Together. <br />Build Code Faster.
              </h1>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xl">
                Collaborative real-time coding workspace: multi-file code editing, instant compiler execution, WebRTC video meetings, and free AI code assistance.
              </p>
            </div>

            {/* Platform Feature Suite */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Workspace Features
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
          </div>

          {/* Right Column: Portal Cards */}
          <div className="lg:col-span-5 space-y-4">

            {/* Action Card 1: Create New Room Modal Trigger */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 hover:border-slate-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Workspace
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase border border-slate-200">
                  Create
                </span>
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Create New Room</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Launch a new Public or Private workspace room for team coding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleGenerateRoom();
                  setIsCreateModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Create Workspace Room
              </button>
            </div>

            {/* Action Card 2: Browse Workspaces Modal Trigger */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 hover:border-slate-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Rooms ({publicRooms.length})
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase border border-slate-200">
                  Explore
                </span>
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Browse Available Rooms</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentUser ? 'Explore all public rooms & your created workspaces.' : 'View all publicly available collaborative rooms.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  fetchRoomsList();
                  setIsBrowseModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                Browse & Join Rooms Modal
              </button>
            </div>

            {/* Recent Workspaces */}
            {recentRooms.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <span className="block text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">
                  Recent Workspaces
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentRooms.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleJoinDirect(r, 'public')}
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

        {/* POPUP MODAL: ENTER YOUR NAME TO JOIN ROOM (FOR SHARED/INVITED LINKS) */}
        {isInvitePopupOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="text-lg font-extrabold text-slate-900">Join Workspace Room</h2>
                <button
                  type="button"
                  onClick={() => setIsInvitePopupOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are entering room <span className="font-mono font-bold text-slate-900">{room || inviteData?.roomId}</span>. Please enter your name to proceed.
                </p>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="popupUserName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="popupUserName"
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE ROOM MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="text-lg font-extrabold text-slate-900">Create Workspace Room</h2>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Privacy Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Room Privacy Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoomType('public')}
                      className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                        roomType === 'public'
                          ? 'border-slate-900 bg-slate-50 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Public Room</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Anyone can join & view</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoomType('private');
                        if (!currentUser) {
                          setError('Sign in required for Private Rooms.');
                        } else {
                          setError('');
                        }
                      }}
                      className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                        roomType === 'private'
                          ? 'border-slate-900 bg-slate-50 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Private Room</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Signed-in users only</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="modalUserName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Display Name
                  </label>
                  <input
                    id="modalUserName"
                    type="text"
                    placeholder="Enter display name"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="modalRoomId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Room Code / Name
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRoom}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Generate Code
                    </button>
                  </div>
                  <input
                    id="modalRoomId"
                    type="text"
                    placeholder="e.g. dev-team-101"
                    value={room}
                    onChange={(e) => {
                      setRoom(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Create & Enter Room
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: BROWSE ROOMS MODAL */}
        {isBrowseModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-2xl w-full space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Workspace Rooms Explorer</h2>
                  <p className="text-xs text-slate-500">Select a collaborative room to join instantly</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBrowseModalOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Tab Navigation if Logged In */}
              {currentUser && (
                <div className="flex border-b border-slate-200 gap-4">
                  <button
                    type="button"
                    onClick={() => setBrowseTab('public')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${
                      browseTab === 'public'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Public Rooms ({publicRooms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowseTab('my')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${
                      browseTab === 'my'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    My Created / Private Rooms ({myRooms.length})
                  </button>
                </div>
              )}

              {/* Rooms List Output */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {loadingRooms ? (
                  <div className="text-xs text-slate-400 py-6 italic text-center">Loading active rooms...</div>
                ) : (browseTab === 'my' && currentUser ? myRooms : publicRooms).length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 italic text-center bg-slate-50 border border-slate-200 rounded-xl">
                    No rooms available in this view. Use "Create Workspace Room" to launch one.
                  </div>
                ) : (
                  (browseTab === 'my' && currentUser ? myRooms : publicRooms).map((r) => (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">{r.roomId}</span>
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
                        onClick={() => handleJoinDirect(r.roomId, r.type)}
                        className="text-xs px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
                      >
                        Join Room
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
