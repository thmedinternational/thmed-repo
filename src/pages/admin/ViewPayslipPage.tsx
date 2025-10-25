import { useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/lib/currency';
import { Payslip } from './PayslipsPage'; // Re-using the type

const fetchPayslipById = async (id: string) => {
  const { data, error } = await supabase.from('payslips').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Payslip;
};

const ViewPayslipPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const payslipRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const currencyCode = settings?.currency || 'USD';

  const { data: payslip, isLoading, error } = useQuery({
    queryKey: ['payslip', id],
    queryFn: () => fetchPayslipById(id!),
    enabled: !!id,
  });

  const handleDownloadPdf = () => {
    const input = payslipRef.current;
    if (!input) {
      toast.error("Could not find the payslip element to download.");
      return;
    }
    toast.info("Generating PDF...");
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`payslip-${payslip?.employee_name}-${payslip?.pay_period_end}.pdf`);
        toast.success("PDF downloaded successfully!");
      });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.message}</div>;
  }

  if (!payslip) {
    return <div className="text-center">Payslip not found.</div>;
  }

  const earnings = (payslip.earnings as any[] || []);
  const deductions = (payslip.deductions as any[] || []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigate('/admin/payslips')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/payslips/generate?edit=${payslip.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
      <Card>
        <CardContent ref={payslipRef} className="p-8 text-sm bg-white text-black">
          <header className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Payslip</h1>
              <p className="text-gray-500">For period: {format(new Date(payslip.pay_period_start), "dd MMM yyyy")} - {format(new Date(payslip.pay_period_end), "dd MMM yyyy")}</p>
            </div>
            <div className="text-right">
              {settings?.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="Company Logo" 
                  className="mb-2 ml-auto"
                  style={{ width: settings.logo_width || 120, height: 'auto' }}
                />
              )}
            </div>
          </header>

          <div className="grid grid-cols-2 gap-4 mb-8 border-y py-4">
            <div>
              <h3 className="font-semibold mb-2">Employee Details</h3>
              <p><strong>Name:</strong> {payslip.employee_name}</p>
              <p><strong>ID Number:</strong> {payslip.id_number || 'N/A'}</p>
              <p><strong>Job Title:</strong> {payslip.job_title || 'N/A'}</p>
              <p><strong>Department:</strong> {payslip.department || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <p><strong>Bank:</strong> {payslip.bank_name || 'N/A'}</p>
              <p><strong>Account No:</strong> {payslip.bank_account_number || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Earnings</h3>
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>{formatCurrency(payslip.basic_salary, currencyCode)}</span>
              </div>
              {earnings.map((earning, index) => (
                <div key={index} className="flex justify-between">
                  <span>{earning.name}</span>
                  <span>{formatCurrency(earning.amount, currencyCode)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t mt-2 pt-2">
                <span>Gross Salary</span>
                <span>{formatCurrency(payslip.gross_salary, currencyCode)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Deductions</h3>
              {deductions.map((deduction, index) => (
                <div key={index} className="flex justify-between">
                  <span>{deduction.name}</span>
                  <span>({formatCurrency(deduction.amount, currencyCode)})</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t mt-2 pt-2">
                <span>Total Deductions</span>
                <span>({formatCurrency(payslip.total_deductions, currencyCode)})</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-gray-800 text-right">
            <p className="text-lg font-bold">
              Net Salary: <span className="ml-4">{formatCurrency(payslip.net_salary, currencyCode)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewPayslipPage;