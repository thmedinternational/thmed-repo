import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroSlider } from "@/components/HeroSlider";
import CategoryCarousel from "@/components/CategoryCarousel";
import CategoryProductSection from "@/components/CategoryProductSection"; // Import the new component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

type Category = {
  id: string;
  name: string;
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const Index = () => {
  const { data: categories, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isCategoriesError) {
    return <div className="text-center text-destructive">Error loading categories: {categoriesError?.message}</div>;
  }

  return (
    <div>
      <CategoryCarousel />
      <HeroSlider />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center space-y-4 mb-16"> {/* Increased bottom margin */}
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta">Welcome to TH-MED International</h1>
          <p className="text-lg font-montserrat font-light text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality medical equipment and health products. We are committed to excellence and customer satisfaction.
          </p>
        </div>

        <h2 className="text-3xl font-poppins font-bold text-center mb-8 text-magenta">Our Products</h2>
        
        {isLoadingCategories ? (
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, i) => ( // Show a few skeleton categories
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
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
          <div className="space-y-16"> {/* Add space between category sections */}
            {categories?.map((category) => (
              <CategoryProductSection
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;