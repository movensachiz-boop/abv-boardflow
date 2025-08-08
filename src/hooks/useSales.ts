import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Sale, SaleItem, DashboardStats } from '@/types/pos';
import { useToast } from '@/hooks/use-toast';

// Fetch all sales
export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(sale => ({
        id: sale.id,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        cashierId: sale.cashier_id,
        cashierName: sale.cashier_name,
        customerName: sale.customer_name,
        notes: sale.notes,
        createdAt: new Date(sale.created_at),
        items: sale.sale_items.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          product: {
            ...item.products,
            createdAt: new Date(item.products.created_at),
            updatedAt: new Date(item.products.updated_at),
          },
        })),
      }));
    },
  });
};

// Add new sale
export const useAddSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          subtotal: sale.subtotal,
          discount: sale.discount,
          tax: sale.tax,
          total: sale.total,
          cashier_id: sale.cashierId,
          cashier_name: sale.cashierName,
          customer_name: sale.customerName,
          notes: sale.notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItemsData = sale.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of sale.items) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          product_id: item.productId,
          quantity_sold: item.quantity,
        });
        if (stockError) console.warn('Stock update failed:', stockError);
      }

      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record sale: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Fetch dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const weekStart = new Date(today.setDate(today.getDate() - 7)).toISOString();
      const monthStart = new Date(today.setDate(today.getDate() - 30)).toISOString();

      // Today's sales
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', todayStart);

      // Weekly sales
      const { data: weeklySales } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', weekStart);

      // Monthly sales
      const { data: monthlySales } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', monthStart);

      // Total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Low stock items (stock < 10)
      const { count: lowStockItems } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10);

      // Top selling products
      const { data: topSellingData } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          products (*)
        `)
        .gte('created_at', monthStart);

      // Process top selling products
      const productSales = topSellingData?.reduce((acc: any, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product: {
              ...item.products,
              createdAt: new Date(item.products.created_at),
              updatedAt: new Date(item.products.updated_at),
            },
            quantitySold: 0,
          };
        }
        acc[productId].quantitySold += item.quantity;
        return acc;
      }, {});

      const topSellingProducts = Object.values(productSales || {})
        .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

      return {
        todaySales: todaySales?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        weeklySales: weeklySales?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        monthlySales: monthlySales?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        totalProducts: totalProducts || 0,
        lowStockItems: lowStockItems || 0,
        topSellingProducts: topSellingProducts as any[],
      };
    },
  });
};