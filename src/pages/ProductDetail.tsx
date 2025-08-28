import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/integrations/supabase/client";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const fetchProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Product not found");
  }
  return data as Product;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id, // Only run query if id is available
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-destructive">Error: {error?.message || "Product not found."}</div>;
  }

  if (!product) {
    return <div className="text-center text-muted-foreground">Product not found.</div>;
  }

  const imageUrl = product.image_urls?.[0] || "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex justify-center items-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-w-full h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
        <div className="space-y-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          <div className="text-md text-muted-foreground">
            Stock: <span className="font-semibold">{product.stock} available</span>
          </div>
          <Button className="w-full py-6 text-lg" disabled={product.stock === 0}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;