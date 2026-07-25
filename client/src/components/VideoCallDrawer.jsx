import { useState } from 'react';

const VideoCallDrawer = ({ isOpen, onClose, room, userName }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  // Clean room identifier for Jitsi Meet integration
  const safeRoomName = `CollabCode-${room.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const meetUrl = `https://meet.jit.si/${safeRoomName}#userInfo.displayName="${encodeURIComponent(userName || 'Developer')}"`;

  return (
    <div className={`fixed bottom-4 right-4 z-40 bg-white border border-slate-200 rounded-xl shadow-xl transition-all duration-200 overflow-hidden ${
      isMinimized ? 'w-80 h-14' : 'w-96 md:w-[480px] h-[380px]'
    }`}>
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">
            Video & Audio Conference
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            {isMinimized ? 'Expand' : 'Minimize'}
          </button>
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            Pop Out
          </a>
          <button
            onClick={onClose}
            className="text-xs px-2 py-0.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-medium rounded transition-colors cursor-pointer"
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Video Call Frame */}
      {!isMinimized && (
        <div className="w-full h-[calc(100%-48px)] bg-slate-50">
          <iframe
            src={meetUrl}
            title="Video Collaboration Call"
            className="w-full h-full border-0"
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
          />
        </div>
      )}
    </div>
  );
};

export default VideoCallDrawer;
