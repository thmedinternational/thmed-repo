import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { MessageSquare, FileText, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

const kitItems = [
  { name: "PRECISION SCALE DIG 0.01G-500G, CALIBRATED", price: 40.00 },
  { name: "MORTAR AND PESTLE 130MM", price: 30.00 },
  { name: "MORTAR AND PESTLE 100MM", price: 25.00 },
  { name: "PLASTIC MEASURING CYLINDER 100ML", price: 9.00 },
  { name: "METAL SPOON SPATULA", price: 5.00 },
  { name: "SHARPS TIN", price: 3.50 },
  { name: "METAL PEDAL BIN", price: 20.00 },
  { name: "SANITARY BIN", price: 45.00 },
  { name: "BIN LINER 4S", price: 1.00 },
  { name: "DIGITAL FRIDGE/HUMIDITY/ROOM THERMOMETER/ ALARM CLOCK 3 IN1 CALIBRATED", price: 40.00 },
  { name: "INSTANT WATER HEATING SYSTEM", price: 50.00 },
  { name: "2 X100ML MEASURING CYLINDER PLASTIC", price: 18.00 },
  { name: "2XPILL COUNTING TRAYS", price: 14.00 },
  { name: "1X PILL CUTTER", price: 5.00 },
  { name: "PAPER TOWEL", price: 4.00 },
  { name: "DD REGISTER 60PAGE", price: 10.00 },
  { name: "1X 50ML MEASURING CYLINDER PLASTIC", price: 7.00 },
];

const totalKitPrice = 300.00; // As per the image

const PharmacyStartupKitPage: React.FC = () => {
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";
  const whatsAppNumber = "263775224209";

  const generateWhatsAppMessage = (type: 'kit' | 'quotation') => {
    let message = "";
    const kitList = kitItems.map(item => `- ${item.name}: ${formatCurrency(item.price, currencyCode)}`).join("\n");

    if (type === 'kit') {
      message = `Hello, I'm interested in the Pharmacy Start-Up Kit from TH-MED International. Here are the details:\n\n${kitList}\n\nTotal Kit Price: ${formatCurrency(totalKitPrice, currencyCode)}\n\nPlease provide more information on how to purchase this kit.`;
    } else if (type === 'quotation') {
      message = `Hello, I'd like to request a formal quotation for the Pharmacy Start-Up Kit from TH-MED International. Here are the items:\n\n${kitList}\n\nEstimated Total: ${formatCurrency(totalKitPrice, currencyCode)}\n\nPlease send me a detailed quote.`;
    }
    return encodeURIComponent(message);
  };

  const handleWhatsAppAction = (type: 'kit' | 'quotation') => {
    const encodedMessage = generateWhatsAppMessage(type);
    if (encodedMessage) {
      window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, "_blank");
    } else {
      toast.error("Could not generate WhatsApp message.");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pharmacy Start-Up Kit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta mb-8">
        Pharmacy Start-Up Kit
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Complete Kit for MCAZ Minimum Requirements
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Everything you need to get your pharmacy started, meeting all regulatory standards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-primary/10 rounded-md">
            <div className="flex items-center space-x-4">
              <Package className="h-10 w-10 text-primary" />
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(totalKitPrice, currencyCode)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleWhatsAppAction('kit')}
              >
                <MessageSquare className="mr-2 h-5 w-5" /> Get This Kit
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => handleWhatsAppAction('quotation')}
              >
                <FileText className="mr-2 h-5 w-5" /> Request Quotation
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Kit Contents:</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kitItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price, currencyCode)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyStartupKitPage;