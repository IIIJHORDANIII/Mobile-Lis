export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export interface CustomList {
  _id: string;
  name: string;
  products: Product[];
  sharedWith: string[];
  createdBy: string;
  createdAt: string;
}

export interface Sale {
  _id: string;
  products: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  createdBy: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}