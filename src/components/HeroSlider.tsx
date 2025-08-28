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
    title: "SUEGUARD SECURITY",
    description: "Providing top-tier security services to protect your assets and ensure peace of mind.",
    imageUrl: "https://placehold.co/1200x500/000000/FFFFFF?text=Security",
  },
  {
    title: "SUEGUARD CLEANING",
    description: "Professional cleaning services for commercial and residential properties, ensuring a spotless environment.",
    imageUrl: "https://placehold.co/1200x500/1E40AF/FFFFFF?text=Cleaning",
  },
  {
    title: "SUEGUARD TRAINING",
    description: "Comprehensive training programs to equip individuals with the skills needed for success.",
    imageUrl: "https://placehold.co/1200x500/991B1B/FFFFFF?text=Training",
  },
  {
    title: "SUEGUARD CONSTRUCTION",
    description: "High-quality construction services, from planning to completion, for projects of all sizes.",
    imageUrl: "https://placehold.co/1200x500/78350F/FFFFFF?text=Construction",
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