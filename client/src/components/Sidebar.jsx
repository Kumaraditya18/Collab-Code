import { useState, useRef, useEffect } from 'react';

const Sidebar = ({ roomUsers, messages, sendMessage, currentUserName, socketId }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'chat'
              ? 'border-slate-800 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Room Chat ({messages.filter((m) => m.type !== 'system').length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'users'
              ? 'border-slate-800 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Participants ({roomUsers.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'chat' ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 italic">
                No messages yet. Send a message to start chatting.
              </div>
            ) : (
              messages.map((msg, index) => {
                if (msg.type === 'system') {
                  return (
                    <div key={index} className="text-center text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded py-1 px-2 my-1">
                      {msg.text} <span className="text-[10px] text-slate-400">({msg.timestamp})</span>
                    </div>
                  );
                }

                const isMe = msg.senderId === socketId || msg.senderName === currentUserName;

                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                        isMe
                          ? 'bg-slate-800 text-slate-50'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        /* Participants List */
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active Collaborators ({roomUsers.length})
          </div>

          <div className="space-y-2">
            {roomUsers.map((user) => {
              const isMe = user.socketId === socketId || user.userName === currentUserName;
              return (
                <div
                  key={user.socketId}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-300">
                      {getInitials(user.userName)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        {user.userName}
                        {isMe && (
                          <span className="text-[10px] font-normal px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-[11px] text-slate-500">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
