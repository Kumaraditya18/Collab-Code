import { useState } from 'react';

const Chat = ({ messages, sendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col h-[500px] w-full">
      <h2 className="text-3xl font-bold text-white tracking-wide flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.645 0-3.174-.402-4.5-1.106L3 20l1.262-3.157C3.462 15.03 3 13.562 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Chat <span className="text-blue-400">Now</span>
      </h2>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-700 p-3 rounded-lg text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-blue-300 font-medium">{msg.sender.slice(0, 5)}</span>
              <span className="text-gray-400 text-xs">{msg.timestamp}</span>
            </div>
            <p className="text-white">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
