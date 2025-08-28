import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import type { OrderWithDetails } from '@/pages/admin/ReceiptsPage';

interface InvoiceProps {
  order: OrderWithDetails;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export const Invoice = ({ order }: InvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const input = invoiceRef.current;
    if (!input) {
      toast.error("Could not find the invoice element to download.");
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
        pdf.save(`invoice-${order.id.substring(0, 8)}.pdf`);
        toast.success("PDF downloaded successfully!");
      })
      .catch(err => {
        toast.error("Failed to generate PDF. Please try again.");
        console.error(err);
      });
  };

  return (
    <div>
      <div ref={invoiceRef} className="p-8 bg-white text-black">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
            <p className="text-gray-500">Invoice #: {order.id.substring(0, 8)}</p>
            <p className="text-gray-500">Date: {formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Your Store Name</h2>
            <p className="text-gray-600">123 Main Street</p>
            <p className="text-gray-600">Anytown, USA 12345</p>
          </div>
        </header>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="text-gray-700">{order.customers?.full_name || 'N/A'}</p>
          <p className="text-gray-700">{order.customers?.email || ''}</p>
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
            {order.order_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.products?.name || 'Unknown Product'}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mt-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-4 border-t text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
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