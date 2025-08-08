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
      {
        name: 'Example Product Name',
        code: 'PROD-001',
        category: 'Board',
        size: '120x240 cm',
        price: 45.50,
        stock: 25,
        image: 'https://example.com/image.jpg (optional)'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products Template');
    XLSX.writeFile(wb, 'products_template.xlsx');
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