import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // This will be auto-configured by Lovable
const supabaseAnonKey = 'your-anon-key'; // This will be auto-configured by Lovable

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Tables Schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'cashier' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          code: string;
          category: 'Melamine' | 'Superwood' | 'PVC' | 'Fluted Panels' | 'Other';
          size: string;
          price: number;
          stock: number;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          cashier_id: string;
          cashier_name: string;
          customer_name: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sale_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
      };
    };
  };
};