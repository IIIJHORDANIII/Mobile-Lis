import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CustomList, Sale, AuthResponse } from '../types';

// Atualize esta URL para o endereço correto do seu backend
// // Para Android Emulator
// // const API_URL = 'http://10.0.2.2:3000';
//
// // Para iOS Simulator (atual)
const API_URL = 'http://localhost:3000'; // Removido /api daqui
//
// // Para dispositivo físico (substitua pelo IP da sua máquina)
// // const API_URL = 'http://192.168.1.100:3000'; // Para dispositivo físico - Removido /api

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@LisMobile:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('@LisMobile:token');
      await AsyncStorage.removeItem('@LisMobile:user');
      // You might want to navigate to login screen here
    }
    console.error('Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    console.log('Attempting login with:', { email });
    const response = await api.post('/api/login', { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('@LisMobile:token', token);
    console.log('Login successful, token stored');
    return { token, user };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('@LisMobile:token');
    await AsyncStorage.removeItem('@LisMobile:user');
    console.log('Logout successful, token removed');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const getTasks = async () => {
  try {
    const response = await api.get('/api/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData: any) => {
  try {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/api/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (productData: FormData): Promise<Product> => {
  try {
    const response = await api.post('/api/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Custom Lists
export const getCustomLists = async (): Promise<CustomList[]> => {
  try {
    const response = await api.get('/api/custom-lists');
    return response.data;
  } catch (error) {
    console.error('Error fetching custom lists:', error);
    throw error;
  }
};

export const createCustomList = async (listData: {
  name: string;
  products: string[];
  sharedWith: string[];
  description?: string;
  isPublic?: boolean;
}): Promise<CustomList> => {
  try {
    const response = await api.post('/api/custom-lists', listData);
    return response.data;
  } catch (error) {
    console.error('Error creating custom list:', error);
    throw error;
  }
};

export const shareCustomList = async (listId: string, userIds: string[]): Promise<void> => {
  try {
    await api.post(`/api/custom-lists/${listId}/share`, { userIds });
  } catch (error) {
    console.error('Error sharing custom list:', error);
    throw error;
  }
};

// Users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const response = await api.post('/api/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const createAdmin = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const response = await api.post('/api/admin', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

// Sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get('/api/sales');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

export const createSale = async (saleData: {
  products: { product: string; quantity: number }[];
}): Promise<Sale> => {
  try {
    const response = await api.post('/api/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

export const getSalesSummary = async (): Promise<any> => {
  try {
    const response = await api.get('/api/sales/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
};

export const updateCustomList = async (listId: string, listData: {
  name?: string;
  description?: string;
  products?: string[];
  sharedWith?: string[];
  isPublic?: boolean;
}): Promise<CustomList> => {
  try {
    const response = await api.put(`/api/custom-lists/${listId}`, listData);
    return response.data;
  } catch (error) {
    console.error('Error updating custom list:', error);
    throw error;
  }
};

export const addProductToList = async (listId: string, productId: string): Promise<CustomList> => {
  try {
    const response = await api.post(`/api/custom-lists/${listId}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding product to list:', error);
    throw error;
  }
};

export const removeProductFromList = async (listId: string, productId: string): Promise<CustomList> => {
  try {
    const response = await api.delete(`/api/custom-lists/${listId}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing product from list:', error);
    throw error;
  }
};

export { api };