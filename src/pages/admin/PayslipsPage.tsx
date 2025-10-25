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
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

export type Payslip = {
  id: string;
  created_at: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_salary: number;
  net_salary: number;
};

const fetchPayslips = async () => {
  const { data, error } = await supabase
    .from("payslips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Payslip[];
};

const PayslipsPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";

  const { data: payslips, isLoading, error } = useQuery<Payslip[]>({
    queryKey: ["payslips"],
    queryFn: fetchPayslips,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Payslips</h1>
        <Button onClick={() => navigate("/admin/payslips/generate")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate Payslip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>
            A list of recently generated payslips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : payslips?.length ? (
                payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">{payslip.employee_name}</TableCell>
                    <TableCell>{`${format(new Date(payslip.pay_period_start), "LLL dd, y")} - ${format(new Date(payslip.pay_period_end), "LLL dd, y")}`}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.gross_salary, currencyCode)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.net_salary, currencyCode)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No payslips generated yet.
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

export default PayslipsPage;