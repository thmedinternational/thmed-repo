import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

type Category = {
  id: string;
  name: string;
};

const fetchCategoryName = async (categoryId: string): Promise<string> => {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (error) throw new Error(error.message);
  return data.name;
};

const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Product[];
};

const CategoryProductsPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const { data: categoryName, isLoading: isLoadingCategoryName, error: categoryNameError } = useQuery<string>({
    queryKey: ["categoryName", categoryId],
    queryFn: () => fetchCategoryName(categoryId!),
    enabled: !!categoryId,
  });

  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
    queryKey: ["productsByCategory", categoryId],
    queryFn: () => fetchProductsByCategory(categoryId!),
    enabled: !!categoryId,
  });

  if (isLoadingCategoryName || isLoadingProducts) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

  if (categoryNameError || productsError) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center text-destructive">
        Error loading products: {categoryNameError?.message || productsError?.message}
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
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta mb-8">
        {categoryName}
      </h1>

      {products?.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage;