import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, PlusCircle } from "lucide-react";
import { Product } from "@/pages/admin/ProductsPage";
import { formatCurrency } from "@/lib/currency"; // Import the new utility

const purchaseItemSchema = z.object({
  product_id: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  cost: z.coerce.number().min(0, "Cost must be a positive number."),
});

const purchaseFormSchema = z.object({
  supplier: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "You must add at least one item."),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("id, name, cost").order("name");
  if (error) throw new Error(error.message);
  return data as Pick<Product, "id" | "name" | "cost">[];
};

interface PurchaseFormProps {
  onSubmit: (values: PurchaseFormValues) => void;
  isSubmitting?: boolean;
}

export function PurchaseForm({ onSubmit, isSubmitting }: PurchaseFormProps) {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchProducts,
  });

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplier: "",
      items: [{ product_id: "", quantity: 1, cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleProductSelect = (productId: string, index: number) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.cost`, product.cost);
      form.setValue(`items.${index}.product_id`, productId);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Wholesale Goods Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Purchase Items</FormLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost per Item</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={(value) => handleProductSelect(value, index)} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingProducts ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                              ) : (
                                products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.cost`}
                      render={({ field }) => (
                        <FormItem><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ product_id: "", quantity: 1, cost: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          {form.formState.errors.items && (
             <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Purchase"}
        </Button>
      </form>
    </Form>
  );
}