import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Link } from 'react-router-dom';

interface CategoryProductSectionProps {
  categoryId: string;
  categoryName: string;
}

const PRODUCTS_PER_PAGE = 8; // 2 rows x 4 columns

const fetchProductsByCategory = async (categoryId: string, page: number): Promise<Product[]> => {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }
  return data as Product[];
};

const fetchProductsCountByCategory = async (categoryId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("category_id", categoryId);

  if (error) {
    throw new Error(error.message);
  }
  return count || 0;
};

const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({ categoryId, categoryName }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useQuery<Product[]>({
    queryKey: ["productsByCategory", categoryId, currentPage],
    queryFn: () => fetchProductsByCategory(categoryId, currentPage),
  });

  const { data: totalProducts, isLoading: isLoadingCount, isError: isCountError, error: countError } = useQuery<number>({
    queryKey: ["productsCountByCategory", categoryId],
    queryFn: () => fetchProductsCountByCategory(categoryId),
  });

  const totalPages = totalProducts ? Math.ceil(totalProducts / PRODUCTS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isProductsError || isCountError) {
    return <div className="text-center text-destructive">Error loading products for {categoryName}: {productsError?.message || countError?.message}</div>;
  }

  return (
    <section className="mb-12 text-left">
      <h2 className="text-3xl font-poppins font-bold mb-6 text-magenta">
        <Link to={`/categories/${categoryId}`} className="hover:underline">
          {categoryName}
        </Link>
      </h2>

      {isLoadingProducts || isLoadingCount ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
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

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </section>
  );
};

export default CategoryProductSection;