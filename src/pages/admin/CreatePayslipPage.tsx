import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { formatCurrency } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EARNING_TYPES = [
  "Transport Allowance",
  "Telephone Allowance",
  "Overtime",
  "Medical Allowance",
  "Meal Allowance",
  "Housing Allowance",
  "Grocery Allowance",
  "Fuel Allowance",
  "Commission",
  "Bonus",
  "Backpay",
];

const earningSchema = z.object({
  name: z.string().min(1, "Earning name is required."),
  amount: z.coerce.number().min(0, "Amount must be non-negative."),
});

const deductionSchema = z.object({
  name: z.string().min(1, "Deduction name is required."),
  amount: z.coerce.number().min(0, "Amount must be non-negative."),
});

const payslipFormSchema = z.object({
  employee_name: z.string().min(2, "Employee name is required."),
  job_title: z.string().optional(),
  grade: z.string().optional(),
  department: z.string().optional(),
  cost_centre: z.string().optional(),
  id_number: z.string().optional(),
  date_of_birth: z.date().optional(),
  date_of_employment: z.date().optional(),
  pay_period_start: z.date({ required_error: "Start date is required." }),
  pay_period_end: z.date({ required_error: "End date is required." }),
  basic_salary: z.coerce.number().positive("Basic salary must be a positive number."),
  earnings: z.array(earningSchema).optional(),
  deductions: z.array(deductionSchema).optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
});

type PayslipFormValues = z.infer<typeof payslipFormSchema>;

const CreatePayslipPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema),
    defaultValues: {
      employee_name: "",
      job_title: "",
      grade: "",
      department: "",
      cost_centre: "",
      id_number: "",
      date_of_birth: undefined,
      date_of_employment: undefined,
      basic_salary: 0,
      earnings: [],
      deductions: [{ name: "PAYE", amount: 0 }],
      bank_name: "",
      bank_account_number: "",
    },
  });

  const { fields: earningsFields, append: appendEarning, remove: removeEarning } = useFieldArray({
    control: form.control,
    name: "earnings",
  });

  const { fields: deductionsFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const watchedBasicSalary = form.watch("basic_salary");
  const watchedEarnings = form.watch("earnings");
  const watchedDeductions = form.watch("deductions");

  const totalEarnings = (watchedEarnings || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const grossSalary = Number(watchedBasicSalary || 0) + totalEarnings;
  const totalDeductions = (watchedDeductions || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const netSalary = grossSalary - totalDeductions;

  const createPayslipMutation = useMutation({
    mutationFn: async (values: PayslipFormValues & { total_earnings: number; gross_salary: number; total_deductions: number; net_salary: number }) => {
      if (!session) throw new Error("User not authenticated");

      const { error } = await supabase.from("payslips").insert([{
        ...values,
        user_id: session.user.id,
        pay_period_start: format(values.pay_period_start, "yyyy-MM-dd"),
        pay_period_end: format(values.pay_period_end, "yyyy-MM-dd"),
        date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
        date_of_employment: values.date_of_employment ? format(values.date_of_employment, "yyyy-MM-dd") : null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payslip saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
      navigate("/admin/payslips");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save payslip: ${error.message}`);
    },
  });

  function onSubmit(values: PayslipFormValues) {
    createPayslipMutation.mutate({
      ...values,
      total_earnings: totalEarnings,
      gross_salary: grossSalary,
      total_deductions: totalDeductions,
      net_salary: netSalary,
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate("/admin/payslips")} className="mb-4">
        &larr; Back to Payslips
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Generate Payslip</CardTitle>
          <CardDescription>Fill in the details to create a new payslip for an employee.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Employee Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Employee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="employee_name" render={({ field }) => (<FormItem><FormLabel>Employee Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="id_number" render={({ field }) => (<FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="e.g., 63-1234567-A-00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="job_title" render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g., Sales Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="grade" render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl><Input placeholder="e.g., C2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g., Sales" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="cost_centre" render={({ field }) => (<FormItem><FormLabel>Cost Centre</FormLabel><FormControl><Input placeholder="e.g., C012" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="date_of_employment" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Employment</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="pay_period_start" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Pay Period Start</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pay_period_end" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Pay Period End</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="basic_salary" render={({ field }) => (<FormItem><FormLabel>Basic Salary</FormLabel><FormControl><Input type="number" step="0.01" placeholder="2000.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              {/* Earnings */}
              <div>
                <FormLabel>Earnings</FormLabel>
                <div className="space-y-4 mt-2">
                  {earningsFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField control={form.control} name={`earnings.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select an earning type" /></SelectTrigger><SelectContent>{EARNING_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`earnings.${index}.amount`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.01" placeholder="e.g., 20.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeEarning(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEarning({ name: "", amount: 0 })}><PlusCircle className="mr-2 h-4 w-4" />Add Earning</Button>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <FormLabel>Deductions</FormLabel>
                <div className="space-y-4 mt-2">
                  {deductionsFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField control={form.control} name={`deductions.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="Deduction Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`deductions.${index}.amount`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.01" placeholder="Amount" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendDeduction({ name: "", amount: 0 })}><PlusCircle className="mr-2 h-4 w-4" />Add Deduction</Button>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., CBZ Bank" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="bank_account_number" render={({ field }) => (<FormItem><FormLabel>Bank Account Number</FormLabel><FormControl><Input placeholder="e.g., 01234567890123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between"><span>Basic Salary:</span><span>{formatCurrency(watchedBasicSalary, currencyCode)}</span></div>
                <div className="flex justify-between"><span>Total Earnings:</span><span>{formatCurrency(totalEarnings, currencyCode)}</span></div>
                <div className="flex justify-between font-medium"><span>Gross Salary:</span><span>{formatCurrency(grossSalary, currencyCode)}</span></div>
                <div className="flex justify-between font-medium text-destructive"><span>Total Deductions:</span><span>- {formatCurrency(totalDeductions, currencyCode)}</span></div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span>Net Salary:</span><span>{formatCurrency(netSalary, currencyCode)}</span></div>
              </div>

              <Button type="submit" className="w-full" disabled={createPayslipMutation.isPending}>
                {createPayslipMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Payslip
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePayslipPage;