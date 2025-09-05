import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/pages/admin/ProductsPage";
import type { Customer } from "@/pages/admin/CustomersPage";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

// --- Data Fetching ---
const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Product[];
};

const fetchCustomers = async () => {
  const { data, error } = await supabase.from("customers").select("*").order("full_name");
  if (error) throw new Error(error.message);
  return data as Customer[];
};

// --- Form Schema ---
const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number(), // Store price at time of order
  name: z.string(), // Store name for display
});

const orderFormSchema = z.object({
  customer_id: z.string().uuid("Please select a customer."),
  status: z.enum(["pending", "paid", "shipped", "cancelled"]),
  items: z.array(orderItemSchema).min(1, "Please add at least one product to the order."),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

// --- Component ---
interface OrderFormProps {
  onSubmit: (values: OrderFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const OrderForm = ({ onSubmit, isSubmitting, onCancel }: OrderFormProps) => {
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      status: "pending",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = form.getValues("items").reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [form, form.watch("items")]);

  const handleAddProduct = () => {
    if (!selectedProductId || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity.");
      return;
    }
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if product is already in the order
    const existingItemIndex = fields.findIndex(item => item.product_id === product.id);
    if (existingItemIndex !== -1) {
        toast.warning(`${product.name} is already in the order. You can remove it and add it again with a new quantity.`);
        return;
    }

    append({
      product_id: product.id,
      quantity: Number(quantity),
      price: product.price,
      name: product.name,
    });

    // Reset inputs
    setSelectedProductId("");
    setQuantity(1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCustomers}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Set order status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-grow">
                <FormLabel>Product</FormLabel>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isLoadingProducts}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price, currencyCode)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FormLabel>Quantity</FormLabel>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" className="w-20" />
              </div>
              <Button type="button" onClick={handleAddProduct}>Add</Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead><span className="sr-only">Remove</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">No products added yet.</TableCell></TableRow>
                  ) : (
                    fields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price, currencyCode)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity, currencyCode)}</TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {form.formState.errors.items && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>}

            <div className="text-right text-xl font-bold mt-4">
              Total: {formatCurrency(total, currencyCode)}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Order
          </Button>
        </div>
      </form>
    </Form>
  );
};