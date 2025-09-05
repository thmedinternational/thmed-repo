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
import { PlusCircle, CheckCircle } from "lucide-react";
import { PurchaseForm, PurchaseFormValues } from "@/components/admin/PurchaseForm";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

export type Purchase = {
  id: string;
  created_at: string;
  status: "pending" | "completed";
  total_amount: number;
  supplier: string | null;
};

const fetchPurchases = async () => {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Purchase[];
};

const PurchasesPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const { data: purchases, isLoading, error } = useQuery<Purchase[]>({
    queryKey: ["purchases"],
    queryFn: fetchPurchases,
  });

  const addPurchaseMutation = useMutation({
    mutationFn: async (values: PurchaseFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const total_amount = values.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          supplier: values.supplier,
          total_amount,
          user_id: user.id,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const purchaseItems = values.items.map(item => ({
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost: item.cost,
      }));

      const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItems);

      if (itemsError) {
        await supabase.from("purchases").delete().eq("id", purchaseData.id);
        throw itemsError;
      }
    },
    onSuccess: () => {
      toast.success("Purchase created successfully!");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setIsAddDialogOpen(false);
    },
    onError: (err: Error) => toast.error(`Failed to create purchase: ${err.message}`),
  });

  const completePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from("purchases")
        .update({ status: 'completed' })
        .eq("id", purchaseId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Purchase marked as completed. Stock updated!");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Invalidate products to show new stock
    },
    onError: (err: Error) => toast.error(`Failed to complete purchase: ${err.message}`),
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Purchase</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader><DialogTitle>Record New Purchase</DialogTitle></DialogHeader>
            <PurchaseForm
              onSubmit={(values) => addPurchaseMutation.mutate(values)}
              isSubmitting={addPurchaseMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>A list of all stock purchases for your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : purchases?.length ? (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.supplier || "N/A"}</TableCell>
                    <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={purchase.status === 'completed' ? 'success' : 'secondary'} className="capitalize">{purchase.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(purchase.total_amount, currencyCode)}</TableCell>
                    <TableCell className="text-right">
                      {purchase.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => completePurchaseMutation.mutate(purchase.id)}
                          disabled={completePurchaseMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No purchases found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default PurchasesPage;