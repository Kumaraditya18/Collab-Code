import { useState } from 'react';
import { generateEncryptedInviteToken } from '../utils/inviteToken';

const ShareModal = ({ isOpen, onClose, room, userName }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const senderDisplayName = userName ? userName.trim() : 'Developer';
  const encryptedToken = generateEncryptedInviteToken(room, 'public', senderDisplayName);
  const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${encryptedToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const emailSubject = encodeURIComponent(`Encrypted Room Invite: ${room}`);
  const emailBody = encodeURIComponent(
    `Hi,\n\n${senderDisplayName} has sent you an encrypted invitation link to join workspace room '${room}'.\n\nClick to join directly: ${inviteUrl}\n`
  );
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs select-none">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          Close
        </button>

        <div className="mb-6">
          <div className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 mb-2">
            Encrypted Link Share
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Share Workspace Invite</h2>
          <p className="text-xs text-slate-500 mt-1">
            Invite anyone to join this room via encrypted link. Guests only need to enter their display name to enter!
          </p>
        </div>

        <div className="space-y-4">
          {/* Direct Encrypted Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Encrypted Invitation Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                {copiedLink ? 'Copied Encrypted Link' : 'Copy Invite Link'}
              </button>
            </div>
          </div>

          {/* Room Access Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Room Identifier
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={room}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-md border border-slate-300 transition-colors cursor-pointer"
              >
                {copiedCode ? 'Copied Code' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Email Invite Option */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Send Email Invitation</div>
              <div className="text-[11px] text-slate-500">Draft an email with pre-filled encrypted link</div>
            </div>
            <a
              href={mailtoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-md border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              Draft Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
