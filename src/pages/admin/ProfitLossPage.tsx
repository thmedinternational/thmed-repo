import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type PaidOrder = {
  id: string;
  total: number;
  order_items: {
    quantity: number;
    products: {
      cost: number;
    } | null;
  }[];
};
type Expense = { id: string; name: string; amount: number; expense_date: string; };

// --- Data Fetching ---
const fetchPaidOrders = async (from: string, to: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, order_items(quantity, products(cost))")
    .eq("status", "paid")
    .gte("created_at", from)
    .lte("created_at", to);
  if (error) throw new Error(error.message);
  return data as PaidOrder[];
};

const fetchExpenses = async (from: string, to: string) => {
  const { data, error } = await supabase.from("expenses").select("*").gte("expense_date", from).lte("expense_date", to).order("expense_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Expense[];
};

// --- Expense Form ---
const expenseFormSchema = z.object({
  name: z.string().min(2, "Expense name is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  expense_date: z.date({ required_error: "Expense date is required." }),
});
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// --- Helper ---
const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// --- Main Component ---
const ProfitLossPage = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const from = date?.from ? format(date.from, "yyyy-MM-dd") : "";
  const to = date?.to ? format(date.to, "yyyy-MM-dd") : "";

  const { data: paidOrders } = useQuery({
    queryKey: ["paidOrdersWithCost", from, to],
    queryFn: () => fetchPaidOrders(from, to),
    enabled: !!from && !!to,
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses", from, to],
    queryFn: () => fetchExpenses(from, to),
    enabled: !!from && !!to,
  });

  const { revenue, cogs, grossProfit, totalExpenses, netProfit } = useMemo(() => {
    const revenue = paidOrders?.reduce((sum, order) => sum + order.total, 0) ?? 0;
    
    const cogs = paidOrders?.reduce((sum, order) => {
      const orderCost = order.order_items.reduce((itemSum, item) => {
        const cost = item.products?.cost ?? 0;
        return itemSum + (cost * item.quantity);
      }, 0);
      return sum + orderCost;
    }, 0) ?? 0;

    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    return { revenue, cogs, grossProfit, totalExpenses, netProfit };
  }, [paidOrders, expenses]);

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { name: "", amount: 0, expense_date: new Date() },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      const { error } = await supabase.from("expenses").insert({
        ...values,
        user_id: user.id,
        expense_date: format(values.expense_date, "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expense added!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      expenseForm.reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expense deleted!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Profit & Loss</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))
              ) : (<span>Pick a date</span>)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="range" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(revenue)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Cost of Goods Sold</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(cogs)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Gross Profit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(grossProfit)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Other Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p></CardContent></Card>
        <Card className={netProfit >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}>
            <CardHeader><CardTitle>Net Profit</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(netProfit)}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add Other Expense</CardTitle><CardDescription>Log a new business expense for this period.</CardDescription></CardHeader>
          <CardContent>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(v => addExpenseMutation.mutate(v))} className="space-y-4">
                <FormField control={expenseForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Office Supplies" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={expenseForm.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="100.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={expenseForm.control} name="expense_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={addExpenseMutation.isPending}>{addExpenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Expense</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expense List</CardTitle><CardDescription>All expenses logged in the selected period.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {loadingExpenses ? <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow> :
                 expenses?.length ? expenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.name}</TableCell>
                    <TableCell>{format(new Date(exp.expense_date), "LLL dd, y")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteExpenseMutation.mutate(exp.id)} disabled={deleteExpenseMutation.isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                 )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No expenses found.</TableCell></TableRow>
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfitLossPage;