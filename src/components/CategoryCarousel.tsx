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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
}

// Fetch categories from Supabase
const fetchAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const iconMap: { [key: string]: React.ElementType } = {
  "Medical Consumables & Supplies": Syringe,
  "Medical Equipment": Stethoscope,
  "Supplements & Nutrition": Pill,
  "Personal Care & Hygiene": Bath,
  "Mom & Baby": Baby,
  "Cosmetics & Beauty": Sparkles,
  "Testing & Diagnostics": Microscope,
  "Gifts & Hampers": Gift,
  // Add more mappings as needed for your categories
};

const CategoryCarousel: React.FC = () => {
  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["allCategories"],
    queryFn: fetchAllCategories,
  });

  if (isLoading) {
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
              {Array.from({ length: 8 }).map((_, index) => (
                <CarouselItem key={index} className="pl-1 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
                  <div className="p-1">
                    <div className="flex flex-col items-center text-center group">
                      <Card className="w-20 h-20 rounded-full flex items-center justify-center bg-muted">
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </CardContent>
                      </Card>
                      <Skeleton className="h-4 w-20 mt-2" />
                    </div>
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
  }

  if (isError || !categories || categories.length === 0) {
    return (
      <section className="bg-white py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          No categories available.
        </div>
      </section>
    );
  }

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
            {categories.map((category) => {
              const Icon = iconMap[category.name] || Syringe; // Default icon if not found
              return (
                <CarouselItem key={category.id} className="pl-1 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
                  <div className="p-1">
                    <Link to={`/categories/${category.id}`} className="flex flex-col items-center text-center group">
                      <Card className="w-20 h-20 rounded-full flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors">
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                        </CardContent>
                      </Card>
                      <p className="text-sm mt-2 text-foreground group-hover:text-primary transition-colors">{category.name}</p>
                    </Link>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoryCarousel;