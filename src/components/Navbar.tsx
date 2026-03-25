import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Flame, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import CartModal from './CartModal';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const id = href.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#f5c542]/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection('#home')}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5c542] to-orange-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#0d0d0d]" />
              </div>
              <h1 className="text-2xl font-light text-white tracking-wide">
                Mitti <span className="font-medium text-[#f5c542]">Creation</span>
              </h1>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-gray-300 hover:text-[#f5c542] transition-colors duration-300 text-sm font-light tracking-wide"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-[#f5c542]/10 rounded-full transition-colors duration-300"
              >
                <ShoppingCart className="w-6 h-6 text-gray-300" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#f5c542] rounded-full flex items-center justify-center text-xs font-medium text-[#0d0d0d]"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              {user ? (
                <div className="relative hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 hover:bg-[#f5c542]/10 rounded-full transition-colors duration-300"
                  >
                    <User className="w-6 h-6 text-gray-300" />
                  </motion.button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#1a1410] rounded-xl border border-[#f5c542]/20 overflow-hidden shadow-xl z-50"
                      >
                        <button
                          onClick={() => {
                            navigate('/orders');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-[#f5c542]/10 hover:text-[#f5c542] transition-colors flex items-center space-x-2"
                        >
                          <Package className="w-4 h-4" />
                          <span className="text-sm">My Orders</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-[#f5c542]/10 hover:text-[#f5c542] transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="hidden md:block px-4 py-2 bg-[#f5c542] text-[#0d0d0d] rounded-full text-sm font-medium hover:bg-[#f5c542]/90 transition-colors duration-300"
                >
                  Login
                </motion.button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-[#f5c542] transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#0d0d0d]/98 border-t border-[#f5c542]/10 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left text-gray-300 hover:text-[#f5c542] transition-colors duration-300 text-base font-light tracking-wide py-2"
                  >
                    {link.name}
                  </button>
                ))}
                <div className="pt-4 border-t border-[#f5c542]/10">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('/orders');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left text-gray-300 hover:text-[#f5c542] transition-colors duration-300 text-base font-light tracking-wide py-2 flex items-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left text-gray-300 hover:text-[#f5c542] transition-colors duration-300 text-base font-light tracking-wide py-2 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 bg-[#f5c542] text-[#0d0d0d] rounded-full text-sm font-medium hover:bg-[#f5c542]/90 transition-colors duration-300"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
