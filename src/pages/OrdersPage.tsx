import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService, Order } from '../services/dataService';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await dataService.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-[#f5c542] bg-[#f5c542]/10 border-[#f5c542]/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-[#f5c542] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-2">
            My Orders
          </h1>
          <p className="text-gray-400 font-light">
            Track and manage your orders
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c542]"></div>
            <p className="text-gray-400 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Package className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-light text-white mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-400 font-light mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium hover:bg-[#f5c542]/90 transition-colors duration-300"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1410] rounded-2xl border border-[#f5c542]/20 overflow-hidden"
              >
                <div className="p-6 border-b border-[#f5c542]/10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-light text-white">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() +
                            order.orderStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-4 bg-[#0d0d0d]/50 rounded-xl p-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-light">
                            {item.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-[#f5c542] font-medium">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#f5c542]/10 flex items-center justify-between">
                    <span className="text-gray-400 font-light">
                      Total Amount
                    </span>
                    <span className="text-[#f5c542] text-xl font-medium">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
