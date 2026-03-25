import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section id="about" className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1410] py-24 px-6 flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-light text-white mb-8">
              Our Story
            </h2>
            <div className="space-y-6 text-gray-400 text-lg font-light leading-relaxed">
              <p>
                At Mitti Creation, each diya and lantern is a story of warmth and
                craftsmanship — blending tradition with modern design.
              </p>
              <p>
                We believe that light is more than illumination. It's a symbol
                of hope, celebration, and the timeless connection between
                generations.
              </p>
              <p>
                Every piece in our collection is thoughtfully curated to bring
                the spirit of Diwali into contemporary homes, where heritage
                meets minimalism.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12"
            >
              <div className="inline-block border-t border-[#f5c542] pt-4">
                <p className="text-[#f5c542] font-light tracking-wider">
                  Handcrafted with care, delivered with love
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#f5c542]/20 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
              <img
                src="https://images.pexels.com/photos/3408267/pexels-photo-3408267.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Mitti Creation Craftsmanship"
                className="w-full h-[600px] object-cover rounded-3xl"
              />
              <motion.div
                className="absolute inset-0 border-2 border-[#f5c542]/30 rounded-3xl"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
