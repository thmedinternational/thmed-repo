import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Import Button for "View All"

interface CategoryProductSectionProps {
  categoryId: string;
  categoryName: string;
}

const PRODUCTS_PER_SECTION = 4; // Display a fixed number of products per section on the homepage

const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("name", { ascending: true })
    .limit(PRODUCTS_PER_SECTION); // Limit to a fixed number

  if (error) {
    throw new Error(error.message);
  }
  return data as Product[];
};

const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({ categoryId, categoryName }) => {
  // Removed currentPage state as pagination is removed
  // Removed fetchProductsCountByCategory as it's no longer needed for pagination here

  const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useQuery<Product[]>({
    queryKey: ["productsByCategoryHomepage", categoryId], // Changed query key to avoid conflict with full category page
    queryFn: () => fetchProductsByCategory(categoryId),
  });

  if (isProductsError) {
    return <div className="text-center text-destructive">Error loading products for {categoryName}: {productsError?.message}</div>;
  }

  return (
    <section className="mb-12 text-left">
      <h2 className="text-3xl font-poppins font-bold mb-6 text-magenta">
        <Link to={`/categories/${categoryId}`} className="hover:underline">
          {categoryName}
        </Link>
      </h2>

      {isLoadingProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: PRODUCTS_PER_SECTION }).map((_, i) => (
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
      ) : products?.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg py-8">
          No products found in this category yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to={`/categories/${categoryId}`}>
              <Button variant="outline">View All {categoryName} Products</Button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default CategoryProductSection;