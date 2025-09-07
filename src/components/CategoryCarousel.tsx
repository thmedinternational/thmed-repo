import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Link } from 'react-router-dom';
import { Syringe, Stethoscope, Pill, Bath, Baby, Sparkles, Microscope, Gift } from 'lucide-react'; // Updated icons

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  link: string;
}

const categories: Category[] = [
  { id: '1', name: 'Medical Consumables & Supplies', icon: Syringe, link: '#' },
  { id: '2', name: 'Medical Equipment', icon: Stethoscope, link: '#' },
  { id: '3', name: 'Supplements & Nutrition', icon: Pill, link: '#' },
  { id: '4', name: 'Personal Care & Hygiene', icon: Bath, link: '#' },
  { id: '5', name: 'Mom & Baby', icon: Baby, link: '#' },
  { id: '6', name: 'Cosmetics & Beauty', icon: Sparkles, link: '#' },
  { id: '7', name: 'Testing & Diagnostics', icon: Microscope, link: '#' },
  { id: '8', name: 'Gifts & Hampers', icon: Gift, link: '#' },
];

const CategoryCarousel: React.FC = () => {
  return (
    <section className="bg-white py-6">
      <div className="container mx-auto">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-1 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
                <div className="p-1">
                  <Link to={category.link} className="flex flex-col items-center text-center group">
                    <Card className="w-20 h-20 rounded-full flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors">
                      <CardContent className="flex aspect-square items-center justify-center p-0">
                        <category.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                      </CardContent>
                    </Card>
                    <p className="text-sm mt-2 text-foreground group-hover:text-primary transition-colors">{category.name}</p>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoryCarousel;