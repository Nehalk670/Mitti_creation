import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { dataService, Product } from '../services/dataService';

const ProductShowcase = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await dataService.getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product._id, 1);
      // Success feedback could be added here
    } catch (error: any) {
      alert(error.message || 'Failed to add item to cart');
    }
  };

  return (
    <section id="products" className="min-h-screen bg-[#0d0d0d] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-4">
            The Collection
          </h2>
          <p className="text-gray-400 text-lg font-light">
            Each piece tells a story of light and heritage
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c542]"></div>
            <p className="text-gray-400 mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#1a1410] border border-transparent hover:border-[#f5c542]/30 transition-all duration-500">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5c542]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />
                  <div className="aspect-square overflow-hidden relative">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ scale: 1.05 }}
                      className="absolute inset-0 m-auto w-40 h-12 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-2 z-10"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-light text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 font-light">
                      {product.tagline}
                    </p>
                    <p className="text-[#f5c542] font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1a1410] rounded-3xl max-w-4xl w-full overflow-hidden border border-[#f5c542]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 bg-[#0d0d0d]/80 rounded-full flex items-center justify-center hover:bg-[#f5c542] transition-colors duration-300 group"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-4xl font-light text-white mb-3">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-gray-400 mb-6 font-light leading-relaxed">
                      {selectedProduct.description}
                    </p>
                    <p className="text-3xl text-[#f5c542] font-medium mb-8">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </p>
                    <button
                      onClick={(e) => {
                        handleAddToCart(selectedProduct, e);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-4 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium hover:bg-[#f5c542]/90 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductShowcase;
