import { useState } from 'react';
import { parseResponseJson } from '../utils/api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, serverUrl }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { emailOrUsername, password }
      : { username, email, password };

    setLoading(true);

    try {
      const res = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await parseResponseJson(res);

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      localStorage.setItem('collabcode_token', data.token);
      localStorage.setItem('collabcode_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Server error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          Close
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {isLogin ? 'Sign In to CollabCode' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? 'Access your saved sessions and collaborate'
              : 'Register your developer profile for workspace access'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 mb-5 bg-slate-50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email or Username
              </label>
              <input
                type="text"
                placeholder="developer@example.com"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="alex_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
