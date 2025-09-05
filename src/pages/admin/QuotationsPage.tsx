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
import { PlusCircle, FileText } from "lucide-react";
import { QuotationForm, QuotationFormValues } from "@/components/admin/QuotationForm";
import { Quotation } from "@/components/admin/Quotation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

// --- Type Definitions ---
export type QuotationItemWithProduct = {
  id: string;
  quantity: number;
  price: number;
  products: { name: string } | null;
};

export type QuotationWithDetails = {
  id: string;
  created_at: string;
  valid_until: string | null;
  status: "draft" | "sent" | "accepted" | "expired";
  total: number;
  customers: { full_name: string | null; email: string | null; } | null;
  quotation_items: QuotationItemWithProduct[];
};

// --- Data Fetching ---
const fetchQuotations = async () => {
  const { data, error } = await supabase
    .from("quotations")
    .select(`*, customers ( full_name, email ), quotation_items ( id, quantity, price, products ( name ) )`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as QuotationWithDetails[];
};

// --- Component ---
const QuotationsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationWithDetails | null>(null);
  const queryClient = useQueryClient();
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const { data: quotations, isLoading, error } = useQuery<QuotationWithDetails[]>({
    queryKey: ["quotations"],
    queryFn: fetchQuotations,
  });

  const addQuotationMutation = useMutation({
    mutationFn: async (values: QuotationFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const total = values.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotations")
        .insert({
          customer_id: values.customer_id,
          total: total,
          valid_until: values.valid_until ? values.valid_until.toISOString() : null,
          user_id: user.id,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      const quoteItems = values.items.map(item => ({
        quotation_id: quoteData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("quotation_items").insert(quoteItems);

      if (itemsError) {
        await supabase.from("quotations").delete().eq("id", quoteData.id);
        throw itemsError;
      }
    },
    onSuccess: () => {
      toast.success("Quotation created successfully!");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setIsAddDialogOpen(false);
    },
    onError: (err: Error) => toast.error(`Failed to create quotation: ${err.message}`),
  });

  const handleViewQuotation = (quotation: QuotationWithDetails) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quotations</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Quotation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>
            <QuotationForm
              onSubmit={(values) => addQuotationMutation.mutate(values)}
              isSubmitting={addQuotationMutation.isPending}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation History</CardTitle>
          <CardDescription>A list of all quotations you have created.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading quotations...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : quotations?.length ? (
                quotations.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.customers?.full_name || "N/A"}</TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{quote.status}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(quote.total, currencyCode)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewQuotation(quote)}>
                        <FileText className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No quotations found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
          {selectedQuotation && <Quotation quotation={selectedQuotation} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuotationsPage;