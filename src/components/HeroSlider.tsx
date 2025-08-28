import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const sliderItems = [
  {
    title: "Occupational Safety & Health Compliance",
    description: "We help businesses meet legal and regulatory health and safety obligations through detailed audits, policy guidance, and on-site inspections. From documentation to day-to-day practices, we make sure your workplace is compliant, safe, and audit-ready.",
    imageUrl: "https://placehold.co/1200x500/000000/FFFFFF?text=Health+Compliance",
  },
  {
    title: "Risk Management Solutions",
    description: "Identify, assess, and mitigate workplace risks with our expert support. We tailor risk management strategies for your specific industry—minimizing hazards, reducing downtime, and ensuring peace of mind across all operations.",
    imageUrl: "https://placehold.co/1200x500/1E40AF/FFFFFF?text=Risk+Management",
  },
  {
    title: "Workplace Safety Training",
    description: "Equip your team with essential safety knowledge through our online and in-person training programs. We offer toolbox talks, fire safety sessions, and SHEQ-focused workshops that are practical, engaging, and fully certified.",
    imageUrl: "https://placehold.co/1200x500/991B1B/FFFFFF?text=Safety+Training",
  },
  {
    title: "PPE & Safety Equipment Supply",
    description: "We supply certified, high-quality personal protective equipment (PPE) and safety gear from trusted brands. Whether you need boots, helmets, signage, or full PPE kits—we’ve got your team covered and protected.",
    imageUrl: "https://placehold.co/1200x500/78350F/FFFFFF?text=PPE+Supply",
  },
];

export function HeroSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {sliderItems.map((item, index) => (
            <CarouselItem key={index}>
              <Card className="border-none rounded-none shadow-none">
                <CardContent 
                  className="flex aspect-[16/7] items-center justify-center p-6 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-10 text-center text-white space-y-4 px-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{item.title}</h2>
                    <p className="text-md md:text-lg max-w-3xl mx-auto">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
      </Carousel>
    </section>
  );
}