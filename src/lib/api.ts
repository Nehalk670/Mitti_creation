import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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
        api.post('/api/auth/register', userData),

    login: (credentials: { email: string; password: string }) =>
        api.post('/api/auth/login', credentials),

    getMe: () => api.get('/api/auth/me'),

    verifyEmail: (token: string) =>
        api.post('/api/auth/verify-email', { token }),

    forgotPassword: (email: string) =>
        api.post('/api/auth/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
        api.post('/api/auth/reset-password', { token, password }),

    updatePassword: (currentPassword: string, newPassword: string) =>
        api.put('/api/auth/update-password', { currentPassword, newPassword }),
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
    }) => api.get('/api/products', { params }),

    getById: (id: string) => api.get(`/api/products/${id}`),

    getCategories: () => api.get('/api/products/categories'),

    create: (productData: any) => api.post('/api/products', productData),

    update: (id: string, productData: any) => api.put(`/api/products/${id}`, productData),

    delete: (id: string) => api.delete(`/api/products/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/api/cart'),

    add: (productId: string, quantity: number) =>
        api.post('/api/cart/add', { productId, quantity }),

    update: (productId: string, quantity: number) =>
        api.put('/api/cart/update', { productId, quantity }),

    remove: (productId: string) => api.delete(`/api/cart/remove/${productId}`),

    clear: () => api.delete('/api/cart/clear'),
};

// Orders API
export const ordersAPI = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) => api.get('/api/orders', { params }),

    getById: (id: string) => api.get(`/api/orders/${id}`),

    createRazorpayOrder: (shippingAddress: any) =>
        api.post('/api/orders/create-razorpay-order', { shippingAddress }),

    verifyPayment: (paymentData: {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) => api.post('/api/orders/verify-payment', paymentData),

    createCOD: (shippingAddress: any) =>
        api.post('/api/orders/cod', { shippingAddress }),

    cancel: (id: string) => api.put(`/api/orders/${id}/cancel`),

    // Admin APIs
    getAllAdmin: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
    }) => api.get('/api/orders/admin/all', { params }),

    updateStatus: (id: string, statusData: {
        orderStatus?: string;
        paymentStatus?: string;
    }) => api.put(`/api/orders/${id}/status`, statusData),
};

// Utility API
export const utilityAPI = {
    getHealth: () => api.get('/api/health'),

    getDemoCredentials: () => api.get('/api/demo-credentials'),
};

export default api;
