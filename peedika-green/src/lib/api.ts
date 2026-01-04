import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),
};

// ============ Products API ============
export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  label?: string;
  minScore?: number;
  maxPrice?: number;
  sort?: 'eco_desc' | 'eco_asc' | 'price_asc' | 'price_desc';
}

export const productsAPI = {
  getProducts: (params?: ProductQuery) =>
    api.get('/products', { params }),

  getProduct: (id: string) =>
    api.get(`/products/${id}`),

  getAlternatives: (id: string) =>
    api.get(`/products/${id}/alternatives`),
};

// ============ Cart API ============
export const cartAPI = {
  getCart: () => api.get('/cart'),

  addToCart: (productId: string, quantity: number = 1) =>
    api.post('/cart', { productId, quantity }),

  updateQuantity: (productId: string, quantity: number) =>
    api.patch('/cart', { productId, quantity }),

  removeItem: (productId: string) =>
    api.delete(`/cart/${productId}`),

  clearCart: () => api.delete('/cart'),

  // Greener cart features
  getGreenerCart: () => api.get('/cart/greener'),

  swapCartItem: (oldProductId: string, newProductId: string) =>
    api.post('/cart/swap', { oldProductId, newProductId }),
};

// ============ Copilot API ============
export const copilotAPI = {
  sendMessage: (message: string, productId?: string) =>
    api.post('/copilot', { message, productId }),
};

// ============ Checkout API ============
export const checkoutAPI = {
  createOrder: (data?: { useEcoPoints?: number; useStoreCredit?: number }) =>
    api.post('/checkout', data || {}),

  // Eco-points management
  getEcoPoints: () => api.get('/checkout/eco-points'),

  convertToStoreCredit: (points: number) => api.post('/checkout/eco-points/convert', { points }),

  awardSwapBonus: (ecoPointsEarned: number) =>
    api.post('/checkout/eco-points/swap-bonus', { ecoPointsEarned }),

  // Order history
  getOrderHistory: () => api.get('/checkout/orders'),
};

export default api;
