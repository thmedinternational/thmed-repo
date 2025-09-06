import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";
import { Stethoscope, Heart, FlaskConical, Shield, Truck, Handshake, Globe, LifeBuoy } from "lucide-react"; // Updated icons

const About = () => {
  return (
    <div className="container mx-auto text-left">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/40">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta">
              Your Partner in Health and Medical Supplies.
            </h1>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              TH-MED International is dedicated to providing high-quality medical equipment and health products to improve lives and support healthcare professionals.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Explore Our Products
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/Whisk_f24fcd5bd4.jpg" // Placeholder image, consider replacing with a relevant medical image
              alt="Medical professionals reviewing equipment"
              className="rounded-lg object-cover w-full max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      {/* About Our Company Section */}
      <div className="py-12 px-4 md:px-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl font-poppins font-bold tracking-tight text-magenta">About Our Company</h1>
          <p className="text-lg font-montserrat font-light text-muted-foreground">
            TH-MED International is a leading distributor of medical devices, pharmaceuticals, and health-related consumables. We are committed to excellence, innovation, and customer satisfaction, ensuring access to essential healthcare solutions.
          </p>
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 font-montserrat font-light text-muted-foreground">
              <li>Quality: We provide only the highest quality, certified medical products.</li>
              <li>Integrity: We operate with transparency, honesty, and ethical practices.</li>
              <li>Customer Focus: We prioritize the needs of our clients and their patients.</li>
              <li>Innovation: We continuously seek and offer the latest advancements in healthcare.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Our Background</h2>
            <p className="font-montserrat font-light text-muted-foreground">
              Established in 2024, TH-MED International has rapidly grown to become a trusted name in the healthcare supply chain. Our team comprises experienced professionals dedicated to making a positive impact on public health.
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <section className="py-16 px-4 md:px-6">
        <h2 className="text-4xl font-poppins font-bold tracking-tight text-center mb-12 text-magenta">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Stethoscope}
            title="Medical Equipment"
            description="A wide range of diagnostic, surgical, and patient care equipment for hospitals and clinics."
          />
          <FeatureCard
            icon={FlaskConical}
            title="Pharmaceutical Supplies"
            description="Distribution of essential medicines and pharmaceutical products to healthcare providers."
          />
          <FeatureCard
            icon={Heart}
            title="Health & Wellness Products"
            description="Supplies for personal health, hygiene, and preventative care for individuals and families."
          />
          <FeatureCard
            icon={Shield}
            title="Safety & PPE"
            description="Personal Protective Equipment and safety solutions for medical and industrial environments."
          />
          <FeatureCard
            icon={Truck}
            title="Efficient Logistics"
            description="Reliable and timely delivery of medical supplies across various regions."
          />
          <FeatureCard
            icon={Handshake}
            title="Partnership & Support"
            description="Dedicated customer service and technical support for all our products and solutions."
          />
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 px-4 md:px-6 bg-muted/40">
        <h2 className="text-4xl font-poppins font-bold tracking-tight text-center mb-8 text-magenta">Who We Are</h2>
        <p className="text-lg font-montserrat font-light text-muted-foreground max-w-3xl mx-auto text-center mb-12">
          TH-MED International is a South African company committed to advancing healthcare by providing access to high-quality medical and health products. We serve a diverse clientele, from large hospitals to individual practitioners.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Stethoscope}
            title="Expert Team"
            description="Our team consists of healthcare and logistics experts dedicated to your needs."
          />
          <FeatureCard
            icon={Globe}
            title="Extensive Network"
            description="Leveraging a broad network to source and deliver products efficiently nationwide."
          />
          <FeatureCard
            icon={LifeBuoy}
            title="Customer-Centric"
            description="We build lasting relationships through exceptional service and reliable support."
          />
        </div>
      </section>
    </div>
  );
};

export default About;