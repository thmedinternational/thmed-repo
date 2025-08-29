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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const Contact = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
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
                    <FormLabel>Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
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
              <Button type="submit" className="w-full">Send Message</Button>
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
          <Button onClick={openWhatsApp} className="mt-6 bg-[#25D366] hover:bg-[#1DAE52] text-white">
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;