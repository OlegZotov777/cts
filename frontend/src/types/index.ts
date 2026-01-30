export interface Product {
  id: number;
  name: string;
  description: string | null;
  section: string | null;
  retailPrice: number;
  dealerPrice: number;
  dollar: number;
  availability: string;
  imageUrl: string | null;
  categoryId: number | null;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  company: string | null;
  role: 'user' | 'dealer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  currentDollar: number;
}
