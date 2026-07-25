import { useState } from 'react';

const ShareModal = ({ isOpen, onClose, room, userName }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
  const senderDisplayName = userName ? userName.trim() : 'A developer';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const emailSubject = encodeURIComponent(`Join my CollabCode workspace: ${room}`);
  const emailBody = encodeURIComponent(
    `Hi,\n\n${senderDisplayName} has invited you to join a collaborative coding room on CollabCode.\nJoin here: ${shareUrl}\n\nRoom ID: ${room}`
  );
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          Close
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Share Workspace</h2>
          <p className="text-xs text-slate-500 mt-1">
            Invite teammates and collaborators to code together in real-time.
          </p>
        </div>

        <div className="space-y-4">
          {/* Direct Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Direct Workspace URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
              >
                {copiedLink ? 'Copied Link' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Room Identifier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Room Access Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={room}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-md border border-slate-300 transition-colors cursor-pointer"
              >
                {copiedCode ? 'Copied Code' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Email Invite Option */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quick Email Invitation
            </label>
            <a
              href={mailtoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-md border border-slate-300 transition-colors cursor-pointer"
            >
              Open Email Client Draft
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
