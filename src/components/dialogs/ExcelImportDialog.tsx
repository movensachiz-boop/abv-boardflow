import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUp, Download, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAddProduct } from '@/hooks/useProducts';
import { Product } from '@/types/pos';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

const ExcelImportDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addProductMutation = useAddProduct();

  const downloadTemplate = () => {
    const template = [
      { name: 'Board - Coimbra Matt', code: 'BC-MM', category: 'Board', size: '2440x1220mm', price: 75.00, stock: 45 },
      { name: 'Board - Petrol Blue Matt', code: 'BP-BM', category: 'Board', size: '2440x1220mm', price: 75.00, stock: 32 },
      { name: 'Board - Smoked Cedar', code: 'BS-CM', category: 'Board', size: '2440x1220mm', price: 75.00, stock: 28 },
      { name: 'Board - Harvard Cherry Matt', code: 'BH-CM', category: 'Board', size: '2440x1220mm', price: 75.00, stock: 36 },
      { name: 'Board - Greythorne Matt', code: 'BG-MM', category: 'Board', size: '2440x1220mm', price: 75.00, stock: 42 },
      { name: 'Edging - White Off Matt', code: 'EW-OM', category: 'Edging', size: '2.2mmx19mm', price: 0.80, stock: 125 },
      { name: 'Edging - White Off Matt - 0.4mm', code: 'EW-04', category: 'Edging', size: '0.4mmx19mm', price: 0.50, stock: 210 },
      { name: 'Edging - White Off Matt - 32mm', code: 'EW-32', category: 'Edging', size: '32mmx19mm', price: 2.00, stock: 78 },
      { name: 'Edging - Black Matt', code: 'EB-MM', category: 'Edging', size: '2.2mmx19mm', price: 0.80, stock: 95 },
      { name: 'Quartz Star Black', code: 'QS-BK', category: 'Quartz', size: '3000x1400mm', price: 195.00, stock: 8 },
      { name: 'Quartz Star Gray', code: 'QS-GY', category: 'Quartz', size: '3000x1400mm', price: 200.00, stock: 6 },
      { name: 'Quartz Star White', code: 'QS-WH', category: 'Quartz', size: '3000x1400mm', price: 195.00, stock: 10 },
      { name: 'Kitchen Bin - 46L', code: 'KB-46', category: 'Accessory', size: '460x350mm', price: 25.00, stock: 15 },
      { name: 'Spice rack', code: 'SR-01', category: 'Accessory', size: '300x100mm', price: 65.00, stock: 22 },
      { name: '6R Wine rack', code: 'WR-06', category: 'Accessory', size: '400x300mm', price: 15.00, stock: 30 },
      { name: '9R Wine rack', code: 'WR-09', category: 'Accessory', size: '600x300mm', price: 20.00, stock: 18 },
      { name: 'Tie rail', code: 'TR-01', category: 'Accessory', size: '1000x30mm', price: 1.00, stock: 50 },
      { name: '192 Steel handles', code: 'HB-192', category: 'Hardware', size: '192mm', price: 2.00, stock: 65 },
      { name: '288 Steel handles', code: 'HB-288', category: 'Hardware', size: '288mm', price: 2.50, stock: 48 },
      { name: 'Nordic handles 1m', code: 'NH-1M', category: 'Hardware', size: '1000mm', price: 18.00, stock: 12 },
      { name: '90 Deg hinge', code: 'HG-90', category: 'Hardware', size: 'Standard', price: 1.50, stock: 85 },
      { name: '165 Deg hinge', code: 'HG-165', category: 'Hardware', size: 'Standard', price: 1.50, stock: 72 },
      { name: 'Pack 40mm Screws', code: 'SC-40', category: 'Hardware', size: '40mm', price: 12.00, stock: 25 },
      { name: 'PVC legs-100', code: 'PL-100', category: 'Hardware', size: '100mm', price: 3.50, stock: 38 },
      { name: 'PVC legs-150', code: 'PL-150', category: 'Hardware', size: '150mm', price: 4.50, stock: 29 },
      { name: 'Woodfiller white', code: 'WF-WH', category: 'Consumable', size: '500ml', price: 3.50, stock: 42 },
      { name: 'Silicone white', code: 'SL-WH', category: 'Consumable', size: '310ml', price: 3.50, stock: 35 },
      { name: 'Glue (kg)', code: 'GL-BK', category: 'Consumable', size: '1kg', price: 4.50, stock: 20 },
      { name: 'Cutting fee', code: 'CF-01', category: 'Service', size: 'N/A', price: 9.00, stock: 0 },
      { name: 'Push to Open', code: 'PT-01', category: 'Hardware', size: 'Standard', price: 1.00, stock: 40 },
      { name: 'Fluted panel - grey', code: 'FP-GY', category: 'Panel', size: '2440x1220mm', price: 10.00, stock: 18 },
      { name: 'Fluted panel - black', code: 'FP-BK', category: 'Panel', size: '2440x1220mm', price: 13.50, stock: 12 },
      { name: '198 Roman handles', code: 'RH-198', category: 'Hardware', size: '198mm', price: 2.50, stock: 25 },
      { name: 'Gas hinges', code: 'GH-01', category: 'Hardware', size: 'Standard', price: 3.00, stock: 32 },
      { name: 'Airvents', code: 'AV-01', category: 'Hardware', size: 'Standard', price: 4.00, stock: 28 },
      { name: 'Hanger rail chrome', code: 'HC-CR', category: 'Hardware', size: '1000mm', price: 5.00, stock: 15 },
      { name: 'Top guide', code: 'TG-01', category: 'Hardware', size: 'Standard', price: 27.00, stock: 8 },
      { name: 'Bottom guide', code: 'BG-01', category: 'Hardware', size: 'Standard', price: 25.00, stock: 8 },
      { name: 'Wheel sets', code: 'WS-01', category: 'Hardware', size: 'Standard', price: 17.00, stock: 12 },
      { name: 'Quartz glue black', code: 'QG-BK', category: 'Consumable', size: '500ml', price: 3.00, stock: 18 },
      { name: 'Quartz glue white', code: 'QG-WH', category: 'Consumable', size: '500ml', price: 4.00, stock: 15 }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ABV Products');
    XLSX.writeFile(wb, 'abv_products_import.xlsx');
  };

  const validateProduct = (row: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!row.name || typeof row.name !== 'string') {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
    
    if (!row.code || typeof row.code !== 'string') {
      errors.push(`Row ${index + 2}: Product code is required`);
    }
    
    if (!row.category || !['Board', 'Edging', 'Quartz', 'Accessory', 'Hardware', 'Consumable', 'Service', 'Panel'].includes(row.category)) {
      errors.push(`Row ${index + 2}: Category must be one of: Board, Edging, Quartz, Accessory, Hardware, Consumable, Service, Panel`);
    }
    
    if (!row.size || typeof row.size !== 'string') {
      errors.push(`Row ${index + 2}: Size is required`);
    }
    
    if (!row.price || isNaN(parseFloat(row.price)) || parseFloat(row.price) <= 0) {
      errors.push(`Row ${index + 2}: Price must be a positive number`);
    }
    
    if (!row.stock || isNaN(parseInt(row.stock)) || parseInt(row.stock) < 0) {
      errors.push(`Row ${index + 2}: Stock must be a non-negative number`);
    }

    return { valid: errors.length === 0, errors };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    console.log('Starting Excel import for file:', file.name, 'Size:', file.size);
    
    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      console.log('Reading file as array buffer...');
      const data = await file.arrayBuffer();
      console.log('Array buffer size:', data.byteLength);
      
      console.log('Parsing Excel workbook...');
      const workbook = XLSX.read(data);
      console.log('Workbook sheet names:', workbook.SheetNames);
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log('Worksheet object:', worksheet);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('Excel data parsed:', jsonData, 'Row count:', jsonData.length);

      // Filter out empty rows and rows without required fields
      const validRows = jsonData.filter((row: any) => {
        return row && 
               typeof row === 'object' && 
               (row.name || row.code || row.category || row.size || row.price || row.stock);
      });

      console.log('Filtered valid rows:', validRows.length, 'out of', jsonData.length);

      const importResult: ImportResult = {
        success: 0,
        errors: [],
        total: validRows.length
      };

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i] as any;
        
        // Update progress
        setProgress(((i + 1) / validRows.length) * 100);
        
        // Validate row
        const validation = validateProduct(row, i);
        if (!validation.valid) {
          importResult.errors.push(...validation.errors);
          continue;
        }

        try {
          // Create product object
          const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
            name: row.name.toString().trim(),
            code: row.code.toString().trim(),
            category: row.category as Product['category'],
            size: row.size.toString().trim(),
            price: parseFloat(row.price),
            stock: parseInt(row.stock),
            image: row.image ? row.image.toString().trim() : undefined,
          };

          // Add product to database
          await addProductMutation.mutateAsync(product);
          importResult.success++;
          
          console.log(`Successfully imported product: ${product.name}`);
        } catch (error: any) {
          const errorMessage = `Row ${i + 2}: Failed to import ${row.name} - ${error.message}`;
          importResult.errors.push(errorMessage);
          console.error(errorMessage, error);
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResult(importResult);
      
      if (importResult.success > 0) {
        // Clear file input
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      setResult({
        success: 0,
        errors: [`Error reading Excel file: ${error.message}`],
        total: 0
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileUp className="h-4 w-4" />
          <span>Import Excel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products from Excel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-muted-foreground">
                Get the Excel template with correct column format
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Select Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Importing products...</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-2">
              {result.success > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {result.success} out of {result.total} products
                  </AlertDescription>
                </Alert>
              )}
              
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>{result.errors.length} errors occurred:</p>
                      <div className="max-h-32 overflow-y-auto text-xs">
                        {result.errors.slice(0, 5).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                        {result.errors.length > 5 && (
                          <div>... and {result.errors.length - 5} more errors</div>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={importing}
            >
              {result?.success ? 'Close' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? 'Importing...' : 'Import Products'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;