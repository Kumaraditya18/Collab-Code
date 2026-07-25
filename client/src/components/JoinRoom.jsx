import { useState, useEffect } from 'react';

const JoinRoom = ({
  room,
  setRoom,
  userName,
  setUserName,
  joinRoom,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [recentRooms, setRecentRooms] = useState([]);
  const [error, setError] = useState('');

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
    if (!userName.trim()) {
      setError('Please enter your name');
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

        {/* User Account Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-300">
              {currentUser ? currentUser.username.slice(0, 2).toUpperCase() : 'G'}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                {currentUser ? currentUser.username : 'Guest Developer'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser ? currentUser.email : 'Not signed in'}
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
                className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded shadow-xs transition-colors cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Card */}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors"
                autoComplete="name"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="roomId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Room Identifier
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRoom}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  Generate ID
                </button>
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden transition-colors"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-md shadow-xs transition-colors cursor-pointer mt-2"
            >
              Enter Room
            </button>
          </form>

          {recentRooms.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-xs text-slate-500 font-medium mb-2">Recent Rooms:</span>
              <div className="flex flex-wrap gap-2">
                {recentRooms.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRoom(r);
                      if (userName.trim()) {
                        joinRoom();
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

        {/* Feature badges */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs font-semibold text-slate-800">Multi-Language</div>
            <div className="text-xs text-slate-500 mt-0.5">JS, Python, C++, Java & more</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs font-semibold text-slate-800">Instant Sync</div>
            <div className="text-xs text-slate-500 mt-0.5">Real-time socket connection</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
