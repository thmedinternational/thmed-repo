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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { Button } from "@/components/ui/button"; // Import Button
import { Link } from "react-router-dom"; // Import Link

type HeroSlide = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  slide_order: number;
  show_text: boolean;
  text_position: "left" | "center" | "right";
  overlay_opacity: number | null;
};

const fetchSlides = async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, title, description, image_url, slide_order, show_text, text_position, overlay_opacity")
    .order("slide_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export function HeroSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const { data: slides, isLoading, isError } = useQuery({
    queryKey: ["hero_slides_public"],
    queryFn: fetchSlides,
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[150px]" />
      </div>
    );
  }

  if (isError || !slides || slides.length === 0) {
    return (
        <div className="w-full">
            <div className="flex h-[150px] items-center justify-center bg-muted">
                <p className="text-muted-foreground">Could not load slides. Please add slides in the admin dashboard.</p>
            </div>
        </div>
    );
  }

  const getTextAlignmentClass = (position: "left" | "center" | "right") => {
    switch (position) {
      case "center":
        return "text-center items-center";
      case "right":
        return "text-right items-end";
      case "left":
      default:
        return "text-left items-start";
    }
  };

  return (
    <div className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {slides.map((item) => (
            <CarouselItem key={item.id}>
              <Card className="border-none rounded-none shadow-none">
                <CardContent 
                  className="flex h-[150px] items-center justify-start p-6 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${item.image_url})` }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg" 
                    style={{ backgroundColor: `rgba(0, 0, 0, ${item.overlay_opacity ?? 0.5})` }}
                  />
                  {item.show_text && (
                    <div className={`relative z-10 text-white space-y-1 px-4 max-w-3xl flex flex-col ${getTextAlignmentClass(item.text_position)}`}>
                      <h2 className="text-xl md:text-2xl font-poppins font-extrabold tracking-tight">{item.title}</h2>
                      <p className="text-xs md:text-sm font-montserrat font-light line-clamp-2">{item.description}</p>
                      <Link to="/products">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-sm rounded-full mt-2">
                          Buy now
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
      </Carousel>
    </div>
  );
}