import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";
import { Stethoscope, Heart, FlaskConical, Shield, Truck, Handshake, Globe, LifeBuoy, ShoppingBag, Package, MapPin, Tag, Info, MessageCircle, Mail, Phone } from "lucide-react"; // Updated icons
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

const About = () => {
  const { settings } = useSettings();
  const whatsAppNumber = "263775224209"; // Your WhatsApp number
  const emailAddress = "info@thmed.store"; // Your email address

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
              TH-MED International is a modern health and wellness store — built for both individuals and institutions. We supply essential medical, personal care, and baby products, all available online and delivered fast across Zimbabwe and the region.
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
          <h1 className="text-4xl font-poppins font-bold tracking-tight text-magenta">About TH-MED International</h1>
          
          {/* Who We Are */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Who We Are</h2>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              TH-MED International is a modern health and wellness store — built for both individuals and institutions. We supply essential medical, personal care, and baby products, all available online and delivered fast across Zimbabwe and the region.
            </p>
          </div>

          {/* What We Offer */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">What We Offer</h2>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              We stock certified, affordable products across multiple categories:
            </p>
            <ul className="list-disc list-inside space-y-1 font-montserrat font-light text-muted-foreground">
              <li>First Aid & Emergency Kits</li>
              <li>PPE (Masks, Gloves, Sanitizers)</li>
              <li>OTC Medications & Supplements</li>
              <li>Hospital & Surgical Equipment</li>
              <li>Skin Care & Cosmetics</li>
              <li>Personal Care Essentials</li>
              <li>Mom & Baby Products</li>
              <li>Stationery & Themed Gift Bags (seasonal)</li>
            </ul>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              All items are available with clear pricing, easy ordering, and flexible payment options.
            </p>
          </div>

          {/* Where We Deliver */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Where We Deliver</h2>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              We currently serve:
            </p>
            <ul className="list-disc list-inside space-y-1 font-montserrat font-light text-muted-foreground">
              <li>Pharmacies</li>
              <li>Hospitals & Clinics</li>
              <li>Schools</li>
              <li>Retailers</li>
              <li>General customers across Zimbabwe and nearby regions</li>
            </ul>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              Delivery options include pickup, courier, and same-day dispatch where possible.
            </p>
          </div>

          {/* Our Mission */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Our Mission</h2>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              To make healthcare essentials and daily-use products:
            </p>
            <ul className="list-disc list-inside space-y-1 font-montserrat font-light text-muted-foreground">
              <li>More accessible</li>
              <li>More affordable</li>
              <li>More trustworthy</li>
            </ul>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              We aim to empower individuals, families, and businesses to shop health products without stress or delays.
            </p>
          </div>

          {/* Why Choose TH-MED? */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Why Choose TH-MED?</h2>
            <ul className="list-disc list-inside space-y-1 font-montserrat font-light text-muted-foreground">
              <li>Verified & Calibrated Medical Tools</li>
              <li>Mobile-friendly online store</li>
              <li>Easy product browsing with categories</li>
              <li>Affordable prices + seasonal promotions</li>
              <li>Responsive support and clear return policies</li>
              <li>VAT-registered and compliant</li>
            </ul>
          </div>

          {/* Additional Perks */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Additional Perks</h2>
            <p className="text-lg font-montserrat font-light text-muted-foreground">
              When you visit our pickup point:
            </p>
            <ul className="list-disc list-inside space-y-1 font-montserrat font-light text-muted-foreground">
              <li>Free WiFi & refreshments</li>
              <li>Restroom access</li>
              <li>Product returns & exchanges accepted</li>
              <li>24hr online assistance</li>
              <li>Delivery errands available on request</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h2 className="text-3xl font-poppins font-bold">Contact Us</h2>
            <ul className="space-y-1 font-montserrat font-light text-muted-foreground">
              <li className="flex items-center"><MessageCircle className="mr-2 h-5 w-5" /> WhatsApp: <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{whatsAppNumber}</a></li>
              <li className="flex items-center"><Mail className="mr-2 h-5 w-5" /> Email: <a href={`mailto:${emailAddress}`} className="ml-1 text-primary hover:underline">{emailAddress}</a></li>
              <li className="flex items-center"><Globe className="mr-2 h-5 w-5" /> Socials: <a href="https://www.facebook.com/thmedinternational" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">Facebook</a> | <a href="https://www.instagram.com/thmedinternational" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">Instagram</a> | <a href="#" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">TikTok</a></li>
              <li className="flex items-start"><MapPin className="mr-2 h-5 w-5 mt-1" /> Location: <span className="ml-1">cs07-cs08 Sunshine bazaar complex simon mazorodze Harare</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* What We Offer Section (using FeatureCards) */}
      <section className="py-16 px-4 md:px-6">
        <h2 className="text-4xl font-poppins font-bold tracking-tight text-center mb-12 text-magenta">Our Core Offerings</h2>
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

      {/* Who We Are Section (using FeatureCards) */}
      <section className="py-16 px-4 md:px-6 bg-muted/40">
        <h2 className="text-4xl font-poppins font-bold tracking-tight text-center mb-8 text-magenta">Our Commitment</h2>
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