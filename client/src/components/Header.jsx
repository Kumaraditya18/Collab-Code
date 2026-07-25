import { useState } from 'react';

const Header = ({
  room,
  isConnected,
  userCount,
  onLeave,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenShare,
  onToggleVideo,
  isVideoOpen,
  onToggleAi,
  isAiOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 shadow-2xs select-none">
      <div className="w-full flex flex-wrap items-center justify-between gap-4">

        {/* 1. Left Group: Brand & Active Room Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-base tracking-tight">
              CollabCode
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Room:
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {room}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
            >
              {copied ? 'Copied Link' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* 2. Center Group: Primary Action Tools */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-200">
          <button
            onClick={onToggleAi}
            className={`text-xs px-3 py-1 font-semibold rounded transition-colors cursor-pointer ${
              isAiOpen
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            {isAiOpen ? 'AI Assistant (Active)' : 'AI Assistant'}
          </button>

          <button
            onClick={onToggleVideo}
            className={`text-xs px-3 py-1 font-semibold rounded transition-colors cursor-pointer ${
              isVideoOpen
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            {isVideoOpen ? 'Video Call (Active)' : 'Video Call'}
          </button>

          <button
            onClick={onOpenShare}
            className="text-xs px-3 py-1 text-slate-700 font-semibold rounded hover:bg-white transition-colors cursor-pointer"
          >
            Share
          </button>
        </div>

        {/* 3. Right Group: Connection Indicator & Profile */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-600' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-slate-700">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">{userCount} {userCount === 1 ? 'user' : 'users'}</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-900 hidden md:inline">
                {currentUser.username}
              </span>
              <button
                onClick={onLogout}
                className="text-[11px] px-2 py-1 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs px-3 py-1 bg-slate-900 text-white font-semibold rounded cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onLeave}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold rounded border border-slate-300 transition-colors cursor-pointer"
          >
            Leave
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
