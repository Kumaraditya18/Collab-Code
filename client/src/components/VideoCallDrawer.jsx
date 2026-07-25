import { useState } from 'react';

const VideoCallDrawer = ({ isOpen, onClose, room, userName, currentUser }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  // Clean room name for video call
  const safeRoomName = `CollabCode_VC_${room.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const displayName = currentUser ? currentUser.username : userName || 'Developer';
  const displayEmail = currentUser
    ? currentUser.email
    : `${displayName.toLowerCase().replace(/\s+/g, '')}@collabcode.local`;

  // URL hash parameters bypass Jitsi prejoin prompts and log in user directly
  const hashParams = [
    `userInfo.displayName="${encodeURIComponent(displayName)}"`,
    `userInfo.email="${encodeURIComponent(displayEmail)}"`,
    'config.prejoinPageEnabled=false',
    'config.requireDisplayName=false',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
    'config.deepLinkingEnabled=false',
  ].join('&');

  const meetUrl = `https://meet.jit.si/${safeRoomName}#${hashParams}`;

  return (
    <div className={`fixed bottom-4 right-4 z-40 bg-white border border-slate-200 rounded-xl shadow-xl transition-all duration-200 overflow-hidden ${
      isMinimized ? 'w-80 h-14' : 'w-96 md:w-[520px] h-[400px]'
    }`}>
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              Video & Audio Conference
            </span>
            <span className="text-[10px] text-slate-500">
              Logged in as {displayName}
            </span>
          </div>
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
        <div className="w-full h-[calc(100%-52px)] bg-slate-50">
          <iframe
            src={meetUrl}
            title="Video Collaboration Call"
            className="w-full h-full border-0"
            allow="camera; microphone; display-capture; autoplay; clipboard-write; allow-same-origin"
          />
        </div>
      )}
    </div>
  );
};

export default VideoCallDrawer;
