import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";
import { ShieldCheck, Users, ClipboardCheck, HardHat, Briefcase, AlertTriangle, LifeBuoy, DollarSign, Globe } from "lucide-react";

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
                Explore Our Shop
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/Whisk_f24fcd5bd4.jpg"
              alt="Two women in hard hats and safety vests reviewing data on a tablet at a construction site"
              className="rounded-lg object-cover w-full max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      {/* About Our Company Section (Moved Here) */}
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

      {/* What We Offer Section */}
      <section className="py-16 px-4 md:px-6">
        <h2 className="text-4xl font-bold tracking-tight text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={ShieldCheck}
            title="Workplace Safety Setup"
            description="Comprehensive workplace safety systems design and implementation to prevent accidents and ensure compliance."
          />
          <FeatureCard
            icon={Users}
            title="OSHE Advisor & Committee Training"
            description="Specialized training for Occupational Safety, Health and Environment advisors and committee members."
          />
          <FeatureCard
            icon={ClipboardCheck}
            title="Compliance Audits"
            description="Thorough audits to identify compliance gaps and provide actionable recommendations for improvement."
          />
          <FeatureCard
            icon={HardHat}
            title="PPE Recommendations"
            description="Expert advice on appropriate Personal Protective Equipment for various workplace environments and tasks."
          />
          <FeatureCard
            icon={Briefcase}
            title="Health & Safety Consulting"
            description="Strategic consulting services to help businesses develop and maintain effective health and safety programs."
          />
          <FeatureCard
            icon={AlertTriangle}
            title="Risk Assessment Reports"
            description="Detailed risk assessments to identify potential hazards and develop mitigation strategies."
          />
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 px-4 md:px-6 bg-muted/40">
        <h2 className="text-4xl font-bold tracking-tight text-center mb-8">Who We Are</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-12">
          SueGuard is a South African company specializing in Risk Management, Occupational Safety, and Business Compliance. We assist organizations in building safety systems, training OSHE committees, and staying legally compliant.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={LifeBuoy}
            title="24/7 Support"
            description="Our team is always available to address emergencies and safety concerns whenever they arise."
          />
          <FeatureCard
            icon={DollarSign}
            title="Affordable Compliance Services"
            description="We provide cost-effective solutions to help businesses meet regulatory requirements without breaking the bank."
          />
          <FeatureCard
            icon={Globe}
            title="Nationwide Coverage"
            description="Our services extend throughout South Africa, ensuring businesses across the country can benefit from our expertise."
          />
        </div>
      </section>
    </div>
  );
};

export default About;