import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Trash2,
  Calculator,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface QuotationItem {
  productId: string;
  productName: string;
  productCode: string;
  price: number;
  quantity: number;
  total: number;
}

interface Quotation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quotationNumber: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

const QuotationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<QuotationItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [quotationDetails, setQuotationDetails] = useState({
    discount: 0,
    tax: 10, // 10% default tax
    notes: ''
  });

  const { data: products = [], isLoading } = useProducts();
  
  // Mock quotations for demo
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: '1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+1234567890',
      quotationNumber: 'QUO-001',
      date: '2024-01-15',
      items: [],
      subtotal: 2500,
      discount: 100,
      tax: 240,
      total: 2640,
      notes: 'Bulk order discount applied',
      status: 'sent'
    }
  ]);

  const addProductToQuotation = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = selectedProducts.find(item => item.productId === productId);
    if (existingItem) {
      setSelectedProducts(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setSelectedProducts(prev => [...prev, {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        price: product.price,
        quantity: 1,
        total: product.price
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    
    setSelectedProducts(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * quotationDetails.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * quotationDetails.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, total };
  };

  const saveQuotation = () => {
    if (!customerInfo.name || selectedProducts.length === 0) {
      toast.error('Please fill customer details and add at least one product');
      return;
    }

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
    const newQuotation: Quotation = {
      id: Date.now().toString(),
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      quotationNumber: `QUO-${String(quotations.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      items: selectedProducts,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      notes: quotationDetails.notes,
      status: 'draft'
    };

    setQuotations(prev => [...prev, newQuotation]);
    
    // Reset form
    setSelectedProducts([]);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setQuotationDetails({ discount: 0, tax: 10, notes: '' });
    setIsCreating(false);
    
    toast.success('Quotation created successfully!');
  };

  const downloadQuotation = (quotation: Quotation) => {
    toast.success('Quotation downloaded successfully!');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuotations = quotations;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-6">
              <div className="h-6 bg-muted animate-pulse rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isCreating) {
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Quotation</h1>
            <p className="text-muted-foreground mt-2">
              Generate professional quotations for your customers
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuotation} className="bg-primary hover:bg-primary/90">
              <FileText className="h-4 w-4 mr-2" />
              Save Quotation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={quotationDetails.notes}
                  onChange={(e) => setQuotationDetails(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:bg-accent/5 cursor-pointer"
                    onClick={() => addProductToQuotation(product.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{product.name}</h4>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{product.code}</p>
                    <p className="font-bold text-primary">${product.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Quotation Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProducts.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">{item.productCode}</p>
                      <p className="text-sm font-medium">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${item.total.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProduct(item.productId)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="mt-6 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Discount (%)</label>
                      <Input
                        type="number"
                        value={quotationDetails.discount}
                        onChange={(e) => setQuotationDetails(prev => ({ ...prev, discount: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tax (%)</label>
                      <Input
                        type="number"
                        value={quotationDetails.tax}
                        onChange={(e) => setQuotationDetails(prev => ({ ...prev, tax: Number(e.target.value) }))}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotation Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage customer quotations
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create New Quotation
        </Button>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {quotation.quotationNumber}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {quotation.customerName} • {quotation.date}
                  </CardDescription>
                </div>
                <Badge variant={
                  quotation.status === 'accepted' ? 'default' :
                  quotation.status === 'sent' ? 'secondary' :
                  quotation.status === 'rejected' ? 'destructive' : 'outline'
                }>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{quotation.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-bold text-lg">${quotation.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadQuotation(quotation)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotations found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quotation to get started
            </p>
            <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationManagement;