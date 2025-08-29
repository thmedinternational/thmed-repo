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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  service_required: z.enum([
    "Safety Training",
    "Risk Assessment",
    "PPE Supply",
    "Compliance Audits",
    "Other",
  ], { required_error: "Please select a service." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const Contact = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      company_name: "",
      service_required: undefined, // Set to undefined for initial empty state
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Message Sent!",
      description: "We've received your message and will get back to you soon.",
    });
    console.log(values);
    form.reset();
  }

  const openWhatsApp = () => {
    // Replace with your actual phone number
    const phoneNumber = "27761120900";
    const message = "Hello! I'm interested in your products.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const onRequestCallback = () => {
    toast({
      title: "Callback Requested!",
      description: "We'll contact you shortly.",
    });
    console.log("Callback requested");
    // Implement further logic for callback request, e.g., sending to a backend service
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="text-left">
          <h1 className="text-4xl font-bold tracking-tight">Talk to Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're here to help with your safety, compliance, and equipment needs.
          </p>
          <p className="mt-2 text-muted-foreground">
            Have a question or want to place an order? Fill out the form or contact us directly on WhatsApp.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Required</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Safety Training">Safety Training</SelectItem>
                        <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                        <SelectItem value="PPE Supply">PPE Supply</SelectItem>
                        <SelectItem value="Compliance Audits">Compliance Audits</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your message..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
              <Button type="button" variant="outline" onClick={onRequestCallback} className="w-full">
                Request a Callback
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex flex-col items-center justify-center bg-secondary p-8 rounded-lg mt-10 md:mt-0">
          {/* Optional: Add a background image here, e.g., style={{ backgroundImage: 'url(/path/to/safety-helmet.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)' }} */}
          <h2 className="text-2xl font-bold text-center">Prefer a quick chat?</h2>
          <p className="mt-2 text-muted-foreground text-center">Click the button below to message us on WhatsApp.</p>
          <Button onClick={openWhatsApp} className="w-full mt-6 bg-[#25D366] hover:bg-[#1DAE52] text-white">
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;