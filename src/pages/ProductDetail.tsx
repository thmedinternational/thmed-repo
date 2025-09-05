import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Changed from ShoppingCart to Plus
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Import toast for notifications

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
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

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

  const handleAddToCart = () => {
    if (product) {
      if (quantity <= 0) {
        toast.error("Quantity must be at least 1.");
        return;
      }
      if (quantity > product.stock) {
        toast.error(`Cannot add more than ${product.stock} of ${product.name} to cart.`);
        return;
      }
      addToCart(product, quantity);
    }
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
          <div className="flex items-center space-x-4">
            <Label htmlFor="quantity" className="sr-only">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 text-center"
              disabled={product.stock === 0}
            />
            <Button 
              className="flex-grow py-6 text-lg" 
              onClick={handleAddToCart} 
              disabled={product.stock === 0 || quantity > product.stock || quantity <= 0}
            >
              <Plus className="mr-2 h-5 w-5" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;