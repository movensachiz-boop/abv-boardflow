import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  Upload,
  Filter
} from 'lucide-react';
import { Product } from '@/types/pos';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import AddProductDialog from '@/components/dialogs/AddProductDialog';
import ExcelImportDialog from '@/components/dialogs/ExcelImportDialog';

const StockManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products = [], isLoading, error } = useProducts();
  const deleteProductMutation = useDeleteProduct();

  const categories = ['all', 'Melamine', 'Superwood', 'PVC', 'Fluted Panels', 'Other'];

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= 10) return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-6">
              <div className="h-6 bg-muted animate-pulse rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <div className="h-8 bg-muted animate-pulse rounded flex-1"></div>
                <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error loading products</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your ABV Boards inventory and product catalog
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <ExcelImportDialog />
          <AddProductDialog />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="pos-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="pos-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {product.code} • {product.category}
                  </CardDescription>
                </div>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="font-medium">{product.size}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-bold text-lg">${product.price}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stock:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{product.stock}</span>
                  {getStockBadge(product.stock)}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deleteProductMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="pos-card text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button className="pos-action-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockManagement;