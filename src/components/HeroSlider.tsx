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
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

type HeroSlide = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  slide_order: number;
  show_text: boolean;
  text_position: "left" | "center" | "right";
  overlay_opacity: number | null; // New field
};

const fetchSlides = async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, title, description, image_url, slide_order, show_text, text_position, overlay_opacity") // Select new field
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

  // Removed useSettings and overlayOpacity from here as it's now per slide

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full aspect-[3/1]" />
      </div>
    );
  }

  if (isError || !slides || slides.length === 0) {
    return (
        <div className="w-full">
            <div className="flex aspect-[3/1] items-center justify-center bg-muted">
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
                  className="flex aspect-[3/1] items-center justify-start p-6 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${item.image_url})` }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg" 
                    style={{ backgroundColor: `rgba(0, 0, 0, ${item.overlay_opacity ?? 0.5})` }} // Apply slide-specific opacity
                  />
                  {item.show_text && (
                    <div className={`relative z-10 text-white space-y-4 px-4 max-w-3xl flex flex-col ${getTextAlignmentClass(item.text_position)}`}>
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{item.title}</h2>
                      <p className="text-md md:text-lg">{item.description}</p>
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