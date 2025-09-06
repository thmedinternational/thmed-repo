"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";

type BannerCard = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  order_index: number;
};

const fetchBannerCards = async (): Promise<BannerCard[]> => {
  const { data, error } = await supabase.from("banner_cards").select("*").order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data as BannerCard[];
};

const BannerSection: React.FC = () => {
  const { data: bannerCards, isLoading, isError, error } = useQuery<BannerCard[]>({
    queryKey: ["bannerCards"],
    queryFn: fetchBannerCards,
  });

  if (isLoading) {
    return (
      <section className="bg-background text-foreground px-4 md:px-6 text-center py-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="min-h-[150px] w-full" />
          <Skeleton className="min-h-[150px] w-full" />
        </div>
      </section>
    );
  }

  if (isError) {
    console.error("Error fetching banner cards:", error);
    return null; // Or display a fallback UI
  }

  if (!bannerCards || bannerCards.length === 0) {
    return null; // No banner cards configured, display nothing
  }

  return (
    <section className="bg-background text-foreground px-4 md:px-6 text-center py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {bannerCards.map((card) => (
          <Card key={card.id} className="relative overflow-hidden rounded-lg shadow-lg flex items-center justify-center min-h-[150px]">
            {card.image_url ? (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${card.image_url}')` }}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="relative z-10 p-6 text-left text-white flex flex-col justify-center items-start w-full h-full bg-black/50 rounded-lg">
              <h3 className="text-2xl font-bold">{card.title}</h3>
              {card.description && <p className="text-sm mt-1 mb-4">{card.description}</p>}
              {card.link_url && (
                <Link to={card.link_url}>
                  <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                    LEARN MORE
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default BannerSection;