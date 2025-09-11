import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroSlider } from "@/components/HeroSlider";
import CategoryCarousel from "@/components/CategoryCarousel";
import CategoryProductSection from "@/components/CategoryProductSection";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Category = {
  id: string;
  name: string;
};

const CATEGORIES_PER_PAGE = 2; // Display 2 categories per page

const fetchCategoriesPaginated = async (page: number): Promise<Category[]> => {
  const from = (page - 1) * CATEGORIES_PER_PAGE;
  const to = from + CATEGORIES_PER_PAGE - 1;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }
  return data as Category[];
};

const fetchTotalCategoriesCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact" });

  if (error) {
    throw new Error(error.message);
  }
  return count || 0;
};

const Index = () => {
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);

  const { data: categories, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["categoriesPaginated", currentCategoryPage],
    queryFn: () => fetchCategoriesPaginated(currentCategoryPage),
  });

  const { data: totalCategories, isLoading: isLoadingTotalCategories, isError: isTotalCategoriesError, error: totalCategoriesError } = useQuery<number>({
    queryKey: ["totalCategoriesCount"],
    queryFn: fetchTotalCategoriesCount,
  });

  const totalCategoryPages = totalCategories ? Math.ceil(totalCategories / CATEGORIES_PER_PAGE) : 0;

  const handleCategoryPageChange = (page: number) => {
    if (page > 0 && page <= totalCategoryPages) {
      setCurrentCategoryPage(page);
    }
  };

  if (isCategoriesError || isTotalCategoriesError) {
    return <div className="text-center text-destructive">Error loading categories: {categoriesError?.message || totalCategoriesError?.message}</div>;
  }

  return (
    <div>
      <CategoryCarousel />
      <HeroSlider />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta">Welcome to TH-MED International</h1>
          <p className="text-lg font-montserrat font-light text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality medical equipment and health products. We are committed to excellence and customer satisfaction.
          </p>
        </div>

        <h2 className="text-3xl font-poppins font-bold text-center mb-8 text-magenta">Our Products</h2>
        
        {(isLoadingCategories || isLoadingTotalCategories) ? (
          <div className="space-y-12">
            {/* Skeleton for categories */}
            {Array.from({ length: CATEGORIES_PER_PAGE }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => ( // Show 4 product skeletons per category section
                    <div key={j} className="flex flex-col space-y-3">
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
              </div>
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-8">
            No categories found. Please add some categories and products in the admin dashboard.
          </div>
        ) : (
          <div className="space-y-16">
            {categories?.map((category) => (
              <CategoryProductSection
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
              />
            ))}
            {totalCategoryPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handleCategoryPageChange(currentCategoryPage - 1)} disabled={currentCategoryPage === 1} />
                  </PaginationItem>
                  {Array.from({ length: totalCategoryPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => handleCategoryPageChange(index + 1)}
                        isActive={currentCategoryPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => handleCategoryPageChange(currentCategoryPage + 1)} disabled={currentCategoryPage === totalCategoryPages} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;