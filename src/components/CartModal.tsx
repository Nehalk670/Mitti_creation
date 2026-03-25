import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../lib/api';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { cartItems, cartTotal, totalItems, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      onClose();
      return;
    }
    setShowCheckout(true);
  };

  const handleRazorpayPayment = async () => {
    if (!user) return;

    try {
      setProcessingPayment(true);

      // Create Razorpay order
      const response = await ordersAPI.createRazorpayOrder(shippingAddress);
      const { order, razorpayOrder } = response.data.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Mitti Creation',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            await ordersAPI.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              onClose();
              navigate('/orders');
            }, 2000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#f5c542'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.response?.data?.message || 'Payment initiation failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCODPayment = async () => {
    if (!user) return;

    try {
      setProcessingPayment(true);
      await ordersAPI.createCOD(shippingAddress);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate('/orders');
      }, 2000);
    } catch (error: any) {
      console.error('COD order creation failed:', error);
      alert(error.response?.data?.message || 'Failed to place COD order');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1410] rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[#f5c542]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#f5c542]/20 flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-[#0d0d0d]/80 rounded-full flex items-center justify-center hover:bg-[#f5c542] transition-colors duration-300 group"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg font-light">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-4 bg-[#0d0d0d]/50 rounded-xl p-4 border border-[#f5c542]/10"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-light text-lg">
                          {item.product.name}
                        </h3>
                        <p className="text-[#f5c542] font-medium">
                          ₹{item.product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={loading}
                          className="w-8 h-8 rounded-full bg-[#f5c542]/20 hover:bg-[#f5c542]/40 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4 text-[#f5c542]" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={loading}
                          className="w-8 h-8 rounded-full bg-[#f5c542]/20 hover:bg-[#f5c542]/40 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 text-[#f5c542]" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          disabled={loading}
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors ml-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && !showSuccess && !showCheckout && (
              <div className="p-6 border-t border-[#f5c542]/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-lg font-light">
                    Total:
                  </span>
                  <span className="text-[#f5c542] text-2xl font-medium">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearCart}
                    disabled={loading}
                    className="flex-1 py-3 bg-transparent border border-[#f5c542]/30 text-[#f5c542] rounded-full font-medium hover:bg-[#f5c542]/10 transition-colors duration-300 disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium hover:bg-[#f5c542]/90 transition-colors duration-300 disabled:opacity-50"
                  >
                    {user ? 'Checkout' : 'Login to Checkout'}
                  </button>
                </div>
              </div>
            )}

            {showCheckout && !showSuccess && (
              <div className="p-6 border-t border-[#f5c542]/20">
                <h3 className="text-white text-lg font-light mb-4">Shipping Information</h3>
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-lg text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-lg font-light">Total:</span>
                  <span className="text-[#f5c542] text-2xl font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={processingPayment || loading}
                    className="w-full py-3 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium hover:bg-[#f5c542]/90 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Pay Online (Razorpay)</span>
                  </button>

                  <button
                    onClick={handleCODPayment}
                    disabled={processingPayment || loading}
                    className="w-full py-3 bg-transparent border border-[#f5c542]/30 text-[#f5c542] rounded-full font-medium hover:bg-[#f5c542]/10 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Truck className="w-5 h-5" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full mt-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Back to Cart
                </button>
              </div>
            )}

            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-[#1a1410] flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle className="w-20 h-20 text-[#f5c542] mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-light text-white mb-2">
                    Order Placed Successfully! 🪔
                  </h3>
                  <p className="text-gray-400 font-light mb-4">
                    Thank you for shopping with Mitti Creation
                  </p>
                  <p className="text-gray-400 font-light text-sm">
                    Your order has been placed successfully and will be delivered soon.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
