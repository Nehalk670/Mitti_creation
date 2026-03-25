import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#1a1410] to-[#0d0d0d]">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#f5c542] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
            Light Beyond
            <br />
            <span className="text-[#f5c542] font-normal">Tradition</span>
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="inline-block"
          >
            <p className="text-lg md:text-xl text-gray-400 mb-12 font-light">
              Discover handcrafted festive decor for the modern home.
            </p>
          </motion.div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={scrollToProducts}
          className="group relative px-10 py-4 bg-transparent border border-[#f5c542] text-[#f5c542] rounded-full text-sm tracking-wider uppercase font-medium overflow-hidden transition-all duration-500 hover:text-[#0d0d0d]"
        >
          <span className="relative z-10">Explore Collection</span>
          <motion.div
            className="absolute inset-0 bg-[#f5c542]"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ borderRadius: '9999px' }}
          />
        </motion.button>
      </div>

      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-[#f5c542] opacity-50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
