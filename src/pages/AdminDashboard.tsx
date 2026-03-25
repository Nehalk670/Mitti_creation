import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService, Product, Order } from '../services/dataService';

type Tab = 'orders' | 'products' | 'users';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadData();
  }, [user, loading, navigate]);

  const loadData = async () => {
    try {
      setDataLoading(true);

      // Load orders and products
      const [ordersData, productsData] = await Promise.all([
        dataService.getAllOrders(),
        dataService.getProducts()
      ]);

      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      await dataService.updateOrderStatus(orderId, { orderStatus, paymentStatus });
      await loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await dataService.deleteProduct(id);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const productData = {
      name: formData.get('name') as string,
      tagline: formData.get('tagline') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
      description: formData.get('description') as string,
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string || 'general',
    };

    try {
      if (editingProduct) {
        await dataService.updateProduct(editingProduct._id, productData);
      } else {
        await dataService.addProduct(productData);
      }

      await loadData();
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
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
            Admin Dashboard
          </h1>
          <p className="text-gray-400 font-light">
            Manage your store and orders
          </p>
        </motion.div>

        <div className="flex space-x-2 mb-8 bg-[#1a1410] p-2 rounded-2xl border border-[#f5c542]/20">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === 'orders'
                ? 'bg-[#f5c542] text-[#0d0d0d]'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === 'products'
                ? 'bg-[#f5c542] text-[#0d0d0d]'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === 'users'
                ? 'bg-[#f5c542] text-[#0d0d0d]'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {dataLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c542]"></div>
                <p className="text-gray-400 mt-4">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-[#1a1410] rounded-2xl border border-[#f5c542]/20">
                <ShoppingBag className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-light">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1410] rounded-2xl border border-[#f5c542]/20 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-light text-white mb-2">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order._id, e.target.value)
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                          order.orderStatus
                        )} bg-transparent cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <span className="text-[#f5c542] font-medium">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-sm"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="text-gray-300">
                          {item.name} x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="px-6 py-3 bg-[#f5c542] text-[#0d0d0d] rounded-full font-medium hover:bg-[#f5c542]/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
            {dataLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c542]"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1410] rounded-2xl border border-[#f5c542]/20 overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-light text-white mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {product.tagline}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#f5c542] font-medium">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-gray-400">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                          className="flex-1 py-2 bg-[#f5c542]/20 text-[#f5c542] rounded-lg hover:bg-[#f5c542]/30 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product._id)}
                          className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#1a1410] rounded-2xl border border-[#f5c542]/20 p-8 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-light">
              User management features coming soon
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1410] rounded-3xl max-w-2xl w-full border border-[#f5c542]/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#f5c542]/20 flex items-center justify-between">
                <h2 className="text-2xl font-light text-white">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="w-10 h-10 bg-[#0d0d0d]/80 rounded-full flex items-center justify-center hover:bg-[#f5c542] transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct?.name}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    defaultValue={editingProduct?.tagline}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingProduct?.category || 'general'}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    defaultValue={editingProduct?.image}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock || 100}
                    min="0"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#f5c542]/20 rounded-xl text-white focus:outline-none focus:border-[#f5c542]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#f5c542] text-[#0d0d0d] rounded-xl font-medium hover:bg-[#f5c542]/90 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1410] rounded-3xl max-w-md w-full border border-red-500/30 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-light text-white mb-4">
                Delete Product?
              </h3>
              <p className="text-gray-400 font-light mb-6">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-transparent border border-[#f5c542]/30 text-[#f5c542] rounded-xl font-medium hover:bg-[#f5c542]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showDeleteConfirm && handleDeleteProduct(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
