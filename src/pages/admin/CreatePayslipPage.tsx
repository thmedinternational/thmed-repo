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
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { formatCurrency } from "@/lib/currency";
import { useEffect } from "react";

const deductionSchema = z.object({
  name: z.string().min(1, "Deduction name is required."),
  amount: z.coerce.number().min(0, "Amount must be non-negative."),
});

const payslipFormSchema = z.object({
  employee_name: z.string().min(2, "Employee name is required."),
  pay_period_start: z.date({ required_error: "Start date is required." }),
  pay_period_end: z.date({ required_error: "End date is required." }),
  gross_salary: z.coerce.number().positive("Gross salary must be a positive number."),
  deductions: z.array(deductionSchema).optional(),
});

type PayslipFormValues = z.infer<typeof payslipFormSchema>;

const CreatePayslipPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";

  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema),
    defaultValues: {
      employee_name: "",
      gross_salary: 0,
      deductions: [{ name: "PAYE", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const watchedGrossSalary = form.watch("gross_salary");
  const watchedDeductions = form.watch("deductions");

  const totalDeductions = (watchedDeductions || []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const netSalary = watchedGrossSalary - totalDeductions;

  function onSubmit(values: PayslipFormValues) {
    console.log("Payslip Generated:", {
      ...values,
      total_deductions: totalDeductions,
      net_salary: netSalary,
    });
    // Here you would typically mutate data to save the payslip
    // For now, we'll just log it and navigate back.
    navigate("/admin/payslips");
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
              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pay_period_start"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pay Period Start</FormLabel>
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
                <FormField
                  control={form.control}
                  name="pay_period_end"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pay Period End</FormLabel>
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

              <FormField
                control={form.control}
                name="gross_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Salary</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="2000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Deductions</FormLabel>
                <div className="space-y-4 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`deductions.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input placeholder="Deduction Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`deductions.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="Amount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", amount: 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Deduction
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(totalDeductions, currencyCode)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Salary:</span>
                  <span>{formatCurrency(netSalary, currencyCode)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full">
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