import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "@/components/ProductCard";
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const PRODUCTS_PER_PAGE = 12; // Display 12 products per page

const fetchAllProducts = async (page: number): Promise<Product[]> => {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }
  return data as Product[];
};

const fetchAllProductsCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact" });

  if (error) {
    throw new Error(error.message);
  }
  return count || 0;
};

const AllProductsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useQuery<Product[]>({
    queryKey: ["allProducts", currentPage],
    queryFn: () => fetchAllProducts(currentPage),
  });

  const { data: totalProducts, isLoading: isLoadingCount, isError: isCountError, error: countError } = useQuery<number>({
    queryKey: ["allProductsCount"],
    queryFn: fetchAllProductsCount,
  });

  const totalPages = totalProducts ? Math.ceil(totalProducts / PRODUCTS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoadingProducts || isLoadingCount) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isProductsError || isCountError) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center text-destructive">
        Error loading products: {productsError?.message || countError?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta mb-8">
        All Products
      </h1>

      {products?.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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
    </div>
  );
};

export default AllProductsPage;