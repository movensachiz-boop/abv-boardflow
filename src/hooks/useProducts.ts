import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/pos';
import { useToast } from '@/hooks/use-toast';

// Fetch all products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      console.log('Fetching products from Supabase...');
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Supabase response:', data);

        return data?.map(product => ({
          ...product,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at),
        })) || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        // Return empty array if table doesn't exist yet
        return [];
      }
    },
  });
};

// Add new product
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('Adding product:', product);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            code: product.code,
            category: product.category,
            size: product.size,
            price: product.price,
            stock: product.stock,
            image: product.image || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Product added successfully:', data);
        return data;
      } catch (error) {
        console.error('Error adding product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: product.name,
          code: product.code,
          category: product.category,
          size: product.size,
          price: product.price,
          stock: product.stock,
          image: product.image,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product: " + error.message,
        variant: "destructive",
      });
    },
  });
};