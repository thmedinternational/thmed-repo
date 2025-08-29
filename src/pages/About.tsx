import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="container mx-auto text-left">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/40">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Protect Your Business. Empower Your People.
            </h1>
            <p className="text-lg text-muted-foreground">
              SueGuard helps organizations implement risk management, OSHE systems, and safety compliance to create safer, more productive workplaces.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Explore Our Services
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="/placeholder.svg"
              alt="Professional office or training facility"
              className="rounded-lg object-cover w-full max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      {/* Existing content below */}
      <div className="py-12 px-4 md:px-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">About Our Company</h1>
          <p className="text-lg text-muted-foreground">
            We are dedicated to providing the best products with exceptional customer service. Our journey started with a simple idea: to make high-quality goods accessible to everyone.
          </p>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Customer Satisfaction: We prioritize our customers' needs and satisfaction above all else.</li>
              <li>Quality: We are committed to offering products that meet the highest standards of quality.</li>
              <li>Integrity: We believe in conducting our business with honesty and transparency.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Background</h2>
            <p className="text-muted-foreground">
              Founded in 2024, our company has grown from a small startup to a beloved brand. We are passionate about what we do and are constantly innovating to bring you the best.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;