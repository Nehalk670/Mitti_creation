import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Flame, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/');
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center space-x-3 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f5c542] to-orange-600 flex items-center justify-center">
              <Flame className="w-7 h-7 text-[#0d0d0d]" />
            </div>
            <h1 className="text-3xl font-light text-white tracking-wide">
              Mitti <span className="font-medium text-[#f5c542]">Creation</span>
            </h1>
          </motion.div>
          <h2 className="text-2xl font-light text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 font-light">
            {isLogin ? 'Sign in to continue shopping' : 'Join us to start your journey'}
          </p>
        </div>

        <motion.div
          className="bg-[#1a1410] rounded-3xl p-8 border border-[#f5c542]/20"
          layout
        >
          <div className="flex mb-6 bg-[#0d0d0d] rounded-full p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 rounded-full transition-all duration-300 text-sm font-medium ${isLogin
                  ? 'bg-[#f5c542] text-[#0d0d0d]'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-3 rounded-full transition-all duration-300 text-sm font-medium ${!isLogin
                  ? 'bg-[#f5c542] text-[#0d0d0d]'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542] transition-colors duration-300"
                    placeholder="Enter your name"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-light text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542] transition-colors duration-300"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542] transition-colors duration-300"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f5c542] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#f5c542] text-[#0d0d0d] rounded-xl font-medium hover:bg-[#f5c542]/90 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#f5c542]/10 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-[#f5c542] transition-colors text-sm font-light"
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>

        <p className="text-center text-gray-500 text-xs mt-6 font-light">
          Demo Credentials:<br />
          Admin: admin@mitti.com / admin123<br />
          User: user@mitti.com / user123
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
