import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const brandLogos = [
  "/brands/1.png", "/brands/2.png", "/brands/3.png", "/brands/4.png",
  "/brands/5.png", "/brands/6.png", "/brands/7.png", "/brands/8.png",
  "/brands/9.png", "/brands/10.png", "/brands/11.png", "/brands/12.png",
  "/brands/13.png", "/brands/14.png", "/brands/15.png", "/brands/16.png",
  "/brands/17.png", "/brands/18.png", "/brands/19.png", "/brands/20.png",
  "/brands/21.png", "/brands/22.png", "/brands/23.png", "/brands/24.png",
  "/brands/25.png", "/brands/26.png", "/brands/27.png", "/brands/28.png",
  "/brands/29.png",
];

const BrandLogos: React.FC = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <section className="py-12 bg-white"> {/* Changed bg-muted/40 to bg-white */}
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-poppins font-bold tracking-tight text-magenta mb-8">
          Our Trusted Brands
        </h2>
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {brandLogos.map((logoSrc, index) => (
              <CarouselItem key={index} className="pl-1 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                <div className="p-1">
                  <Card className="flex items-center justify-center h-24 w-full border-none shadow-none bg-transparent">
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <img src={logoSrc} alt={`Brand Logo ${index + 1}`} className="max-h-full max-w-full object-contain" />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default BrandLogos;