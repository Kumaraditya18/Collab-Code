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
  const [recentRooms, setRecentRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');

  // Auto-sync display name when user is signed in
  useEffect(() => {
    if (currentUser?.username) {
      setUserName(currentUser.username);
    }
  }, [currentUser, setUserName]);

  // Fetch active public rooms on mount
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
    const randomId = Math.random().toString(36).substring(2, 8) + '-' + Math.floor(100 + Math.random() * 900);
    setRoom(randomId);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Please sign in first to access collaborative workspace rooms.');
      onOpenAuth();
      return;
    }

    if (!room.trim()) {
      setError('Please enter a room identifier to proceed.');
      return;
    }

    setError('');
    joinRoom();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

        {/* Left Column: Platform Features & Active Public Rooms */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-md mb-4">
              Real-Time Collaboration Platform
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              CollabCode
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-md">
              A robust, secure workspace for multi-language code editing, real-time sync, WebRTC video calls, and AI code assistance.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-800">Multi-File IDE</div>
                <div className="text-[11px] text-slate-500 mt-0.5">JS, Python, C++, Java, Rust with live sync</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-800">Code Execution</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant compilation with stdin/stdout terminal</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-800">Video Meetings</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Seamless video & audio conference drawer</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-800">Free AI Assistant</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Code explanations, debugging & 1-click fixes</div>
              </div>
            </div>
          </div>

          {/* Active Public Rooms Panel */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Public Rooms {availableRooms.length > 0 ? `(${availableRooms.length})` : ''}
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
                Refresh List
              </button>
            </div>

            {loadingRooms ? (
              <div className="text-xs text-slate-400 py-3 italic">Scanning active rooms...</div>
            ) : availableRooms.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 italic bg-white border border-slate-200 rounded-lg px-3">
                No active public rooms right now. Sign in and enter a room ID on the right to start.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {availableRooms.map((r) => (
                  <div
                    key={r.roomId}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {r.roomId}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.userCount} {r.userCount === 1 ? 'user' : 'users'} online • {r.activeLanguage}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRoom(r.roomId);
                        if (currentUser) {
                          joinRoom();
                        } else {
                          onOpenAuth();
                        }
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors cursor-pointer"
                    >
                      {currentUser ? 'Enter Room' : 'Sign In to Join'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Auth & Enter Room Portal */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* User Account Status Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                  currentUser
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}>
                  {currentUser ? currentUser.username.slice(0, 2).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {currentUser ? currentUser.username : 'Signed Out'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser ? currentUser.email : 'Sign in to access room workspace'}
                  </div>
                </div>
              </div>

              <div>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>

            {/* Room Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  {currentUser ? 'Enter Room' : 'Workspace Access'}
                </h2>
                {currentUser && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Authenticated
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors"
                  autoComplete="name"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="roomId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Room ID
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
                  placeholder="e.g. main-workspace-1"
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors"
                  autoComplete="off"
                />
              </div>

              {currentUser ? (
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Enter Workspace Room
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Sign In to Enter Room
                </button>
              )}
            </form>
          </div>

          {/* Recent Rooms */}
          {recentRooms.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                Recent Rooms
              </span>
              <div className="flex flex-wrap gap-2">
                {recentRooms.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRoom(r);
                      if (currentUser) {
                        joinRoom();
                      } else {
                        onOpenAuth();
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono rounded border border-slate-200 transition-colors cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JoinRoom;
