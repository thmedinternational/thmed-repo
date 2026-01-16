import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileSpreadsheet, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import readXlsxFile, { Row } from "read-excel-file";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProductImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Helper to ensure category exists or create it
  const getOrCreateCategory = async (categoryName: string): Promise<string | null> => {
    if (!categoryName) return null;
    const cleanName = categoryName.trim();

    // 1. Check if exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", cleanName)
      .maybeSingle();

    if (existing) return existing.id;

    // 2. Create if not exists
    const { data: created, error } = await supabase
      .from("categories")
      .insert({ name: cleanName })
      .select("id")
      .single();

    if (error) {
      console.error(`Error creating category ${cleanName}:`, error);
      return null;
    }
    return created.id;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const rows: Row[] = await readXlsxFile(file);

      // Remove header row (assuming first row is headers: Catalogue, Product Name, Quantity, Price, Picture)
      const dataRows = rows.slice(1); 

      if (dataRows.length === 0) {
        toast.error("The Excel file appears to be empty.");
        setIsImporting(false);
        return;
      }

      toast.info(`Processing ${dataRows.length} products...`);

      // Process row by row
      for (const row of dataRows) {
        try {
          // Excel columns: 
          // 0: Catalogue (Category)
          // 1: Product Name
          // 2: Quantity (Stock)
          // 3: Price
          // 4: Picture (URL)

          const categoryName = row[0]?.toString() || "";
          const productName = row[1]?.toString() || "";
          const quantity = Number(row[2]) || 0;
          const price = Number(row[3]) || 0;
          const pictureUrl = row[4]?.toString() || "";

          if (!productName) {
            failCount++;
            continue; // Skip rows without names
          }

          const categoryId = await getOrCreateCategory(categoryName);

          const { error } = await supabase.from("products").insert({
            name: productName,
            description: "Imported via Excel",
            category_id: categoryId,
            stock: quantity,
            price: price,
            cost: 0, // Default cost
            image_urls: pictureUrl ? [pictureUrl] : null
          });

          if (error) {
            console.error("Error inserting product:", error);
            failCount++;
          } else {
            successCount++;
          }

        } catch (err) {
          console.error("Error processing row:", err);
          failCount++;
        }
      }

      toast.success(`Import complete! Added: ${successCount}, Failed: ${failCount}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsOpen(false);

    } catch (error) {
      console.error("File parsing error:", error);
      toast.error("Failed to read the Excel file. Please ensure it follows the format.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV content
    const headers = ["Catalogue", "Product Name", "Quantity", "Price", "Picture URL"];
    const exampleRow = ["Medical Supplies", "Surgical Mask", "500", "15.00", "https://example.com/mask.jpg"];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + exampleRow.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "th_med_product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) file to bulk add products.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required Format</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Ensure your columns are in this exact order:</p>
              <ol className="list-decimal list-inside text-sm font-medium space-y-1">
                <li>Catalogue (Category Name)</li>
                <li>Product Name</li>
                <li>Quantity (Stock)</li>
                <li>Price</li>
                <li>Picture (Image URL)</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Template (CSV)
            </Button>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/5 mt-2">
              {isImporting ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Importing products...</p>
                </div>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Excel File
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Supports .xlsx files
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}