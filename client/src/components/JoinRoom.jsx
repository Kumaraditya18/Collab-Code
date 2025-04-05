import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const JoinRoom = ({ room, setRoom, joinRoom }) => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center relative">
      {/* 👤 Description about you (Top Right Corner) */}
      <motion.div
        className="absolute top-6 right-6 text-white text-sm md:text-base px-4 py-2 bg-gray-700/80 backdrop-blur-md rounded-full shadow-lg border border-gray-600"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        🚀 Built by <span className="font-bold text-green-400">Kumar Aditya</span> — Full Stack Developer
      </motion.div>

      {/* 👋 Welcome Heading (Outside Card) */}
      <motion.h1
        className="text-4xl font-bold text-green-400 mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
         Welcome to Collab-Code
      </motion.h1>

      {/* 🧪 Main Form Card */}
      <motion.div
        className="space-y-6 text-center bg-gray-800/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-gray-400 bg-clip-text text-transparent">
            Join a Room
          </h2>
          <p className="text-white text-s">
            Collaborate in real-time with your friends 💻
          </p>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔑</span>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-lg w-full text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          />
        </div>

        <motion.button
          onClick={joinRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-700 to-gray-700 hover:from-green-600 hover:to-green-900 text-white font-semibold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          Join Room
        </motion.button>

        <p className="text-s text-white">
          🔒 Your room ID is private — share it only with collaborators.
        </p>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
