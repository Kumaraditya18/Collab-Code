import { useState } from 'react';

const Header = ({ room, isConnected, userCount, onLeave, currentUser, onOpenAuth, onLogout }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand and Room Information */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg tracking-tight">CollabCode</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-medium">
              v1.0
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Room:</span>
            <span className="text-sm font-mono font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              {room}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-200 transition-colors cursor-pointer"
            >
              {copied ? 'Copied Link' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Connection, Profile & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-600' : 'bg-rose-500'
              }`}
            />
            <span className="font-medium text-slate-700">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">{userCount} {userCount === 1 ? 'User' : 'Users'}</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center border border-slate-300">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {currentUser.username}
              </span>
              <button
                onClick={onLogout}
                className="text-xs px-2 py-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded border border-slate-300 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onLeave}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            Leave Room
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
