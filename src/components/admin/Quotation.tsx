import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import type { QuotationWithDetails } from '@/pages/admin/QuotationsPage';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from "@/lib/currency";

interface QuotationProps {
  quotation: QuotationWithDetails;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export const Quotation = ({ quotation }: QuotationProps) => {
  const quotationRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const handleDownloadPdf = () => {
    const input = quotationRef.current;
    if (!input) {
      toast.error("Could not find the quotation element to download.");
      return;
    }

    toast.info("Generating PDF... Please wait.");

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const pdfHeight = pdfWidth / ratio;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`quotation-${quotation.id.substring(0, 8)}.pdf`);
        toast.success("PDF downloaded successfully!");
      })
      .catch(err => {
        toast.error("Failed to generate PDF. Please try again.");
        console.error(err);
      });
  };

  return (
    <div>
      <div ref={quotationRef} className="p-8 bg-white text-black">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quotation</h1>
            <p className="text-gray-500">Quote #: {quotation.id.substring(0, 8)}</p>
            <p className="text-gray-500">Date: {formatDate(quotation.created_at)}</p>
            {quotation.valid_until && <p className="text-gray-500">Valid Until: {formatDate(quotation.valid_until)}</p>}
          </div>
          <div className="text-right">
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Store Logo" 
                className="mb-2 ml-auto"
                style={{ width: settings.logo_width || 120, height: 'auto' }}
              />
            )}
            <h2 className="text-xl font-semibold">{settings?.company_name || settings?.store_name || 'Your Company'}</h2>
          </div>
        </header>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Quote For:</h3>
          <p className="text-gray-700">{quotation.customers?.full_name || 'N/A'}</p>
          <p className="text-gray-700">{quotation.customers?.email || ''}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotation.quotation_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.products?.name || 'Unknown Product'}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price, currencyCode)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price * item.quantity, currencyCode)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mt-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-4 border-t-2 border-gray-300">
              <span className="text-2xl font-bold">Total:</span>
              <span className="text-2xl font-bold">{formatCurrency(quotation.total, currencyCode)}</span>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-4 border-t text-gray-500 text-sm">
          {settings?.banking_details && (
            <div className="mb-4 text-left">
              <h4 className="font-semibold text-gray-800 mb-1">Banking Details</h4>
              <pre className="whitespace-pre-wrap font-sans text-xs">{settings.banking_details}</pre>
            </div>
          )}
          <p className="text-center">Thank you for your consideration.</p>
        </footer>
      </div>

      <div className="p-6 bg-muted flex justify-end">
        <Button onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};