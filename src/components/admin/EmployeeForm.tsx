import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Employee } from "@/pages/admin/EmployeesPage";

const employeeFormSchema = z.object({
  employee_name: z.string().min(2, "Employee name is required."),
  job_title: z.string().optional(),
  grade: z.string().optional(),
  department: z.string().optional(),
  cost_centre: z.string().optional(),
  id_number: z.string().optional(),
  date_of_birth: z.date().optional(),
  date_of_employment: z.date().optional(),
  basic_salary: z.coerce.number().min(0, "Basic salary must be non-negative."),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => void;
  isSubmitting?: boolean;
  employee?: Employee | null;
}

export function EmployeeForm({ onSubmit, isSubmitting, employee }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employee_name: employee?.employee_name ?? "",
      job_title: employee?.job_title ?? "",
      grade: employee?.grade ?? "",
      department: employee?.department ?? "",
      cost_centre: employee?.cost_centre ?? "",
      id_number: employee?.id_number ?? "",
      date_of_birth: employee?.date_of_birth ? new Date(employee.date_of_birth) : undefined,
      date_of_employment: employee?.date_of_employment ? new Date(employee.date_of_employment) : undefined,
      basic_salary: employee?.basic_salary ?? 0,
      bank_name: employee?.bank_name ?? "",
      bank_account_number: employee?.bank_account_number ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="employee_name" render={({ field }) => (<FormItem><FormLabel>Employee Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="id_number" render={({ field }) => (<FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="e.g., 63-1234567-A-00" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="job_title" render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g., Sales Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g., Sales" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="grade" render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl><Input placeholder="e.g., C2" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="cost_centre" render={({ field }) => (<FormItem><FormLabel>Cost Centre</FormLabel><FormControl><Input placeholder="e.g., C012" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="date_of_employment" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Employment</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="basic_salary" render={({ field }) => (<FormItem><FormLabel>Basic Salary</FormLabel><FormControl><Input type="number" step="0.01" placeholder="2000.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., CBZ Bank" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="bank_account_number" render={({ field }) => (<FormItem><FormLabel>Bank Account Number</FormLabel><FormControl><Input placeholder="e.g., 01234567890123" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {employee ? "Update Employee" : "Add Employee"}
        </Button>
      </form>
    </Form>
  );
}