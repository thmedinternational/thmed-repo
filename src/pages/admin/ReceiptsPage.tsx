import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Invoice } from "@/components/admin/Invoice";

// --- Type Definitions ---
export type OrderItemWithProduct = {
  id: string;
  quantity: number;
  price: number;
  products: { name: string } | null;
};

export type OrderWithDetails = {
  id: string;
  created_at: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  total: number;
  customers: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  order_items: OrderItemWithProduct[];
};

// --- Data Fetching ---
const fetchOrdersWithDetails = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      status,
      total,
      customers ( id, full_name, email ),
      order_items ( id, quantity, price, products ( name ) )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as OrderWithDetails[];
};

// --- Component ---
const ReceiptsPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { data: orders, isLoading, error } = useQuery<OrderWithDetails[]>({
    queryKey: ["ordersWithDetails"],
    queryFn: fetchOrdersWithDetails,
  });

  const handleOpenInvoice = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const getStatusVariant = (status: OrderWithDetails["status"]) => {
    switch (status) {
      case "paid": return "success";
      case "pending": return "secondary";
      case "shipped": return "default";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Receipts & Invoices</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Select an order to view and generate an invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading orders...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-500">Error: {error.message}</TableCell></TableRow>
              ) : orders?.length ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium">{order.customers?.full_name || "N/A"}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenInvoice(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
          {selectedOrder && <Invoice order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptsPage;