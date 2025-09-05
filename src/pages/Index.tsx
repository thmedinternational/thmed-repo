"use client";

import ProductList from "@/components/ProductList";
import { HeroSlider } from "@/components/HeroSlider";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to SueGuard Risk &amp; Management</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our collection of high-quality products. We are committed to excellence and customer satisfaction.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Products</h2>
          <ProductList searchQuery={searchQuery} category={category} />
        </div>
      </div>
    </div>
  );
};

export default Index;