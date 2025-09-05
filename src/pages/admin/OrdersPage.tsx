import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { OrderForm, OrderFormValues } from "@/components/admin/OrderForm";
import { OrderActions } from "@/components/admin/OrderActions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

export type Order = {
  id: string;
  created_at: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  total: number;
  customers: { full_name: string | null }[] | null; // Changed to array
};

const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, total, customers(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Order[];
};

const OrdersPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const addOrderMutation = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create an order.");

      const total = values.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: values.customer_id,
          status: values.status,
          total: total,
          user_id: user.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Failed to create order.");

      const orderItems = values.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) {
        await supabase.from("orders").delete().eq("id", orderData.id);
        throw itemsError;
      }

      return orderData;
    },
    onSuccess: () => {
      toast.success("Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Order status updated to ${variables.status}.`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const getStatusVariant = (status: Order["status"]) => {
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
        <h1 className="text-3xl font-bold">Orders</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              onSubmit={(values) => addOrderMutation.mutate(values)}
              isSubmitting={addOrderMutation.isPending}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of all orders placed in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading orders...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">Error loading orders: {error.message}</TableCell></TableRow>
              ) : orders?.length ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customers?.[0]?.full_name || "N/A"}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total, currencyCode)}</TableCell>
                    <TableCell className="text-right">
                      <OrderActions
                        order={order}
                        onStatusChange={(orderId, status) => updateStatusMutation.mutate({ orderId, status })}
                        isUpdating={updateStatusMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default OrdersPage;