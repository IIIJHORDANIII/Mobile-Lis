import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CustomList, Sale, AuthResponse } from '../types';

// Atualize esta URL para o endereço correto do seu backend
// // Para Android Emulator
// // const API_URL = 'http://10.0.2.2:3000';
//
// // Para iOS Simulator (atual)
const API_URL = 'https://backend-lis-production.up.railway.app/api'; // Base URL já inclui /api
//
// // Para dispositivo físico (substitua pelo IP da sua máquina)
// // const API_URL = 'http://192.168.1.100:3000'; // Para dispositivo físico

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('@LisMobile:token');
      await AsyncStorage.removeItem('@LisMobile:user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('@LisMobile:token', token);
    return { token, user };
  } catch (error: any) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('@LisMobile:token');
    await AsyncStorage.removeItem('@LisMobile:user');
  } catch (error) {
  }
};

export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData: any) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (productData: FormData): Promise<Product> => {
  try {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    throw error;
  }
};

// Custom Lists
export const getCustomLists = async (): Promise<CustomList[]> => {
  try {
    const response = await api.get('/custom-lists');
    return response.data;
  } catch (error) {
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
    const response = await api.post('/custom-lists', listData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const shareCustomList = async (listId: string, userIds: string[]): Promise<void> => {
  try {
    await api.post(`/custom-lists/${listId}/share`, { userIds });
  } catch (error) {
    throw error;
  }
};

// Users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAdmin = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const response = await api.post('/admin', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get('/sales');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSale = async (saleData: {
  products: { product: string; quantity: number }[];
}): Promise<Sale> => {
  try {
    const response = await api.post('/sales', saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSalesSummary = async (): Promise<any> => {
  try {
    const response = await api.get('/sales/summary');
    return response.data;
  } catch (error) {
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
    const response = await api.put(`/custom-lists/${listId}`, listData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProductToList = async (listId: string, productId: string): Promise<CustomList> => {
  try {
    const response = await api.post(`/custom-lists/${listId}/products`, { productId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromList = async (listId: string, productId: string): Promise<CustomList> => {
  try {
    const response = await api.delete(`/custom-lists/${listId}/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { api };