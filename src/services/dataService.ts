import { productsAPI, ordersAPI } from '../lib/api';

export interface Product {
  _id: string;
  name: string;
  tagline?: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const dataService = {
  // Products
  getProducts: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await productsAPI.getAll(params);
    return response.data.data;
  },

  getProduct: async (id: string) => {
    const response = await productsAPI.getById(id);
    return response.data.data.product;
  },

  getCategories: async () => {
    const response = await productsAPI.getCategories();
    return response.data.data.categories;
  },

  // Admin product operations
  addProduct: async (productData: any) => {
    const response = await productsAPI.create(productData);
    return response.data.data.product;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await productsAPI.update(id, productData);
    return response.data.data.product;
  },

  deleteProduct: async (id: string) => {
    await productsAPI.delete(id);
    return true;
  },

  // Orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await ordersAPI.getAll(params);
    return response.data.data;
  },

  getOrder: async (id: string) => {
    const response = await ordersAPI.getById(id);
    return response.data.data.order;
  },

  // Admin order operations
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
  }) => {
    const response = await ordersAPI.getAllAdmin(params);
    return response.data.data;
  },

  updateOrderStatus: async (id: string, statusData: {
    orderStatus?: string;
    paymentStatus?: string;
  }) => {
    const response = await ordersAPI.updateStatus(id, statusData);
    return response.data.data.order;
  },
};
