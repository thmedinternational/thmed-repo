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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Product } from "@/pages/admin/ProductsPage";
import type { Customer } from "@/pages/admin/CustomersPage";
import { formatCurrency } from "@/lib/currency"; // Import the new utility

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
const quotationItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  name: z.string(),
});

const quotationFormSchema = z.object({
  customer_id: z.string().uuid("Please select a customer."),
  valid_until: z.date().optional(),
  items: z.array(quotationItemSchema).min(1, "Please add at least one product."),
});

export type QuotationFormValues = z.infer<typeof quotationFormSchema>;

// --- Component ---
interface QuotationFormProps {
  onSubmit: (values: QuotationFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const QuotationForm = ({ onSubmit, isSubmitting, onCancel }: QuotationFormProps) => {
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({ queryKey: ["customers"], queryFn: fetchCustomers });

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("items")) {
        const newTotal = (value.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        setTotal(newTotal);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error("Please select a product.");
      return;
    }
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (fields.some(item => item.product_id === product.id)) {
      toast.warning(`${product.name} is already in the quotation.`);
      return;
    }

    append({
      product_id: product.id,
      quantity: 1,
      price: product.price,
      name: product.name,
    });
    setSelectedProductId("");
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
                    <SelectTrigger><SelectValue placeholder="Select a customer..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>{customers?.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Valid Until (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader><CardTitle>Quotation Items</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-grow">
                <FormLabel>Product</FormLabel>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isLoadingProducts}>
                  <SelectTrigger><SelectValue placeholder="Select a product to add..." /></SelectTrigger>
                  <SelectContent>{products?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleAddProduct}>Add Product</Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Unit Price</TableHead>
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
                        <TableCell>
                          <Input type="number" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} min="1" className="w-20" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" {...form.register(`items.${index}.price`, { valueAsNumber: true })} step="0.01" min="0" className="w-24" />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
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

            <div className="text-right text-xl font-bold mt-4">Total: {formatCurrency(total)}</div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Quotation
          </Button>
        </div>
      </form>
    </Form>
  );
};