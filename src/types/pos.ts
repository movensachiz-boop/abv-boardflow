export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'viewer';
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: 'Melamine' | 'Superwood' | 'PVC' | 'Fluted Panels' | 'Other';
  size: string; // e.g., "120x240 cm"
  price: number;
  stock: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  notes?: string;
  createdAt: Date;
}

export interface DashboardStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  totalProducts: number;
  lowStockItems: number;
  topSellingProducts: Array<{
    product: Product;
    quantitySold: number;
  }>;
}