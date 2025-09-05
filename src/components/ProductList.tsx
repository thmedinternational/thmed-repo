import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select("*").order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Product[];
};

const ProductList = () => {
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Changed to grid-cols-2 for mobile, and gap-4 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
             <div className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-destructive">Error fetching products: {error.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground">No products found.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Changed to grid-cols-2 for mobile, and gap-4 */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;