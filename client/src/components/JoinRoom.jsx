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
      setError('You must sign in to join or view code in workspace rooms.');
      onOpenAuth();
      return;
    }
    if (!room.trim()) {
      setError('Please enter a room ID');
      return;
    }
    setError('');
    joinRoom();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-md mb-3">
            Production Release
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            CollabCode
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time collaborative code editor and workspace
          </p>
        </div>

        {/* User Account Status Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 mb-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center border ${
              currentUser
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}>
              {currentUser ? currentUser.username.slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                {currentUser ? currentUser.username : 'Signed Out'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser ? currentUser.email : 'Sign in required to write/view code'}
              </div>
            </div>
          </div>

          <div>
            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
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

        {/* Auth Requirement Notice if not logged in */}
        {!currentUser && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            <div className="font-bold text-amber-950 mb-1">
              Sign In Required to View & Edit Code
            </div>
            <div>
              CollabCode requires an authenticated account to view, write, and execute code in workspaces. Please sign in or register to continue.
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="mt-3 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Sign In / Register Account
            </button>
          </div>
        )}

        {/* Room Join Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Join Collaborative Workspace
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Display Name
              </label>
              <input
                id="userName"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (error) setError('');
                }}
                disabled={!currentUser}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                autoComplete="name"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="roomId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Room Identifier
                </label>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleGenerateRoom}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                  >
                    Generate ID
                  </button>
                )}
              </div>
              <input
                id="roomId"
                type="text"
                placeholder="e.g. dev-team-42"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  if (error) setError('');
                }}
                disabled={!currentUser}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={!currentUser}
              className={`w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-md shadow-xs transition-colors cursor-pointer mt-2 ${
                !currentUser ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {currentUser ? 'Enter Room' : 'Sign In to Enter Room'}
            </button>
          </form>

          {/* Available Public Rooms Section */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Available Active Rooms {availableRooms.length > 0 ? `(${availableRooms.length})` : ''}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`${serverUrl}/api/rooms`);
                    if (res.ok) {
                      const data = await parseResponseJson(res);
                      if (data.rooms) setAvailableRooms(data.rooms);
                    }
                  } catch {
                    // Ignore
                  }
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loadingRooms ? (
              <div className="text-xs text-slate-400 py-2 italic">Loading active rooms...</div>
            ) : availableRooms.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 italic">
                No active public rooms currently running. Create one above to start coding.
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {availableRooms.map((r) => (
                  <div
                    key={r.roomId}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <div>
                      <div className="text-xs font-mono font-semibold text-slate-800">
                        {r.roomId}
                      </div>
                      <div className="text-[10px] text-slate-500">
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
                      className="text-xs px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Rooms */}
          {recentRooms.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="block text-xs text-slate-500 font-medium mb-2">Recent Rooms:</span>
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
