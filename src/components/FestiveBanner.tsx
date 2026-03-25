import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FestiveBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const bannerClosed = sessionStorage.getItem('festive-banner-closed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('festive-banner-closed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full bg-gradient-to-r from-yellow-700 via-orange-600 to-red-700 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative px-6 py-4 flex items-center justify-center">
            <motion.p
              className="text-white text-center text-sm md:text-base font-medium tracking-wide"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              ✨ Diwali Sale – 20% Off on All Diyas & Lanterns! Limited Time Offer ✨
            </motion.p>

            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors duration-300"
              aria-label="Close banner"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FestiveBanner;
