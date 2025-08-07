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

const StockManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - in real app this would come from an API
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Melamine Board 18mm White',
      code: 'MB-18-W-001',
      category: 'Melamine',
      size: '120x240 cm',
      price: 45.50,
      stock: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Superwood Panel Natural',
      code: 'SW-12-N-002',
      category: 'Superwood',
      size: '100x200 cm',
      price: 32.75,
      stock: 5, // Low stock
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'PVC Board White',
      code: 'PVC-W-003',
      category: 'PVC',
      size: '80x160 cm',
      price: 28.90,
      stock: 42,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Fluted Panel Oak',
      code: 'FP-OAK-004',
      category: 'Fluted Panels',
      size: '60x120 cm',
      price: 65.20,
      stock: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const categories = ['all', 'Melamine', 'Superwood', 'PVC', 'Fluted Panels', 'Other'];

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
          <Button variant="outline" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button className="pos-action-btn flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
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
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
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