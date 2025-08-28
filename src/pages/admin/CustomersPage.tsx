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
import { PlusCircle } from "lucide-react";
import { CustomerForm, CustomerFormValues } from "@/components/admin/CustomerForm";
import { toast } from "sonner";

export type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null; // Added phone_number
  created_at: string;
};

const fetchCustomers = async () => {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Customer[];
};

const CustomersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add a customer.");

      const { error } = await supabase.from("customers").insert([
        {
          full_name: values.full_name,
          email: values.email,
          phone_number: values.phone_number, // Include phone_number
          user_id: user.id,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer created successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const handleAddCustomer = (values: CustomerFormValues) => {
    addCustomerMutation.mutate(values);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new customer record.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleAddCustomer}
              isSubmitting={addCustomerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            A list of your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead> {/* New table header */}
                <TableHead>Added On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-red-500">
                    Error loading customers: {error.message}
                  </TableCell>
                </TableRow>
              ) : customers?.length ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name || 'N/A'}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone_number || 'N/A'}</TableCell> {/* Display phone number */}
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {/* Actions can be added here later */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default CustomersPage;