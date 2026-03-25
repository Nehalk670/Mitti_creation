import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('mitti_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('mitti_token');
            localStorage.removeItem('mitti_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData: { name: string; email: string; password: string }) =>
        api.post('/auth/register', userData),

    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),

    getMe: () => api.get('/auth/me'),

    verifyEmail: (token: string) =>
        api.post('/auth/verify-email', { token }),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
        api.post('/auth/reset-password', { token, password }),

    updatePassword: (currentPassword: string, newPassword: string) =>
        api.put('/auth/update-password', { currentPassword, newPassword }),
};

// Products API
export const productsAPI = {
    getAll: (params?: {
        category?: string;
        search?: string;
        sort?: string;
        order?: string;
        page?: number;
        limit?: number;
    }) => api.get('/products', { params }),

    getById: (id: string) => api.get(`/products/${id}`),

    getCategories: () => api.get('/products/categories'),

    create: (productData: any) => api.post('/products', productData),

    update: (id: string, productData: any) => api.put(`/products/${id}`, productData),

    delete: (id: string) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),

    add: (productId: string, quantity: number) =>
        api.post('/cart/add', { productId, quantity }),

    update: (productId: string, quantity: number) =>
        api.put('/cart/update', { productId, quantity }),

    remove: (productId: string) => api.delete(`/cart/remove/${productId}`),

    clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) => api.get('/orders', { params }),

    getById: (id: string) => api.get(`/orders/${id}`),

    createRazorpayOrder: (shippingAddress: any) =>
        api.post('/orders/create-razorpay-order', { shippingAddress }),

    verifyPayment: (paymentData: {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) => api.post('/orders/verify-payment', paymentData),

    createCOD: (shippingAddress: any) =>
        api.post('/orders/cod', { shippingAddress }),

    cancel: (id: string) => api.put(`/orders/${id}/cancel`),

    // Admin APIs
    getAllAdmin: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
    }) => api.get('/orders/admin/all', { params }),

    updateStatus: (id: string, statusData: {
        orderStatus?: string;
        paymentStatus?: string;
    }) => api.put(`/orders/${id}/status`, statusData),
};

// Utility API
export const utilityAPI = {
    getHealth: () => api.get('/health'),

    getDemoCredentials: () => api.get('/demo-credentials'),
};

export default api;
