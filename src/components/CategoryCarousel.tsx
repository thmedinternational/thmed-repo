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
import { Shirt, Monitor, Smartphone, Home, Utensils, Sparkles } from 'lucide-react'; // Example icons

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  link: string;
}

const categories: Category[] = [
  { id: '1', name: 'Electronics Clearance', icon: Sparkles, link: '#' },
  { id: '2', name: 'Shop Spring Deals', icon: Shirt, link: '#' },
  { id: '3', name: 'Get more, Spend less', icon: Utensils, link: '#' },
  { id: '4', name: 'Brands By Us', icon: Home, link: '#' },
  { id: '5', name: 'Groceries', icon: Utensils, link: '#' },
  { id: '6', name: 'Electronics & Entertainment', icon: Monitor, link: '#' },
  { id: '7', name: 'Cellphones', icon: Smartphone, link: '#' },
  { id: '8', name: 'Home Appliances', icon: Home, link: '#' },
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