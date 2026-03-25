import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Facebook, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.email === 'admin@mitticreation.com';

  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://facebook.com/mitticreation',
      label: 'Facebook',
    },
    {
      icon: Instagram,
      href: 'https://instagram.com/mitticreation',
      label: 'Instagram',
    },
  ];

  return (
    <footer id="contact" className="bg-[#0d0d0d] border-t border-[#f5c542]/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-light text-[#f5c542] mb-6">
              Mitti Creation
            </h3>
            <p className="text-gray-400 font-light leading-relaxed mb-6">
              Handcrafted festive decor blending tradition with modern design.
              Each piece tells a story of warmth and craftsmanship.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="w-10 h-10 rounded-full border border-[#f5c542]/30 flex items-center justify-center hover:bg-[#f5c542] hover:border-[#f5c542] transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 text-[#f5c542] group-hover:text-[#0d0d0d] transition-colors duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-lg font-medium text-white mb-6 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#f5c542]" />
              <span>Visit Us</span>
            </h4>
            <p className="text-gray-400 font-light leading-relaxed mb-4">
              123 Pottery Lane, Artisan District
              <br />
              Mumbai, Maharashtra 400001
              <br />
              India
            </p>
            <div className="space-y-2">
              <a
                href="mailto:contact@mitticreation.com"
                className="flex items-center space-x-2 text-gray-400 hover:text-[#f5c542] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">contact@mitticreation.com</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="rounded-2xl overflow-hidden border border-[#f5c542]/20"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.082177816191955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="border-t border-[#f5c542]/10 pt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 font-light text-sm">
              © 2025 Mitti Creation. Crafted with Light.
            </p>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 text-gray-500 hover:text-[#f5c542] transition-colors text-sm group"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
