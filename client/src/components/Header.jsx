import { motion } from 'framer-motion';

const Header = ({ room }) => {
  return (
    <motion.header
      className="w-full max-w-6xl mb-6 text-center"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className="text-5xl font-extrabold bg-green-500 bg-clip-text text-transparent mb-2">
         Collab-Code
      </h1>

      <p className="text-gray-400 text-lg mb-1">
        Room: <span className="text-blue-400 font-semibold">{room}</span>
      </p>

    </motion.header>
  );
};

export default Header;
