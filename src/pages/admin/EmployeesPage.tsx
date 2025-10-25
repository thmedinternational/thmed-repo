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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { EmployeeForm, EmployeeFormValues } from "@/components/admin/EmployeeForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Employee = {
  id: string;
  created_at: string;
  employee_name: string;
  job_title: string | null;
  department: string | null;
  basic_salary: number;
  grade: string | null;
  cost_centre: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  date_of_employment: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
};

const fetchEmployees = async () => {
  const { data, error } = await supabase.from("employees").select("*").order("employee_name");
  if (error) throw new Error(error.message);
  return data as Employee[];
};

const EmployeesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: employees, isLoading, error } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDialogOpen(false);
      setEditingEmployee(null);
    },
    onError: (error: Error) => toast.error(error.message),
  };

  const addEmployeeMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (values: EmployeeFormValues) => {
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase.from("employees").insert([{ ...values, user_id: session.user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee added successfully!");
      mutationOptions.onSuccess();
    },
  });

  const updateEmployeeMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (values: EmployeeFormValues) => {
      if (!editingEmployee) throw new Error("No employee selected");
      const { error } = await supabase.from("employees").update(values).eq("id", editingEmployee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      mutationOptions.onSuccess();
    },
  });

  const deleteEmployeeMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const handleOpenDialog = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>Manage your company's employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : employees?.length ? (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.employee_name}</TableCell>
                    <TableCell>{employee.job_title || 'N/A'}</TableCell>
                    <TableCell>{employee.department || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(employee)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteEmployeeMutation.mutate(employee.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">No employees found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            onSubmit={editingEmployee ? (values) => updateEmployeeMutation.mutate(values) : (values) => addEmployeeMutation.mutate(values)}
            isSubmitting={addEmployeeMutation.isPending || updateEmployeeMutation.isPending}
            employee={editingEmployee}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeesPage;