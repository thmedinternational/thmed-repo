import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm, ProductFormValues } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/pages/admin/ProductsPage";
import { Skeleton } from "@/components/ui/skeleton";

const fetchProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!session) throw new Error("User not authenticated.");

      let imageUrls: string[] | null = isEditMode && product ? product.image_urls : [];

      if (values.images && values.images.length > 0) {
        const uploadPromises = Array.from(values.images).map(async (file) => {
          const fileName = `public/${session.user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          return publicUrl;
        });

        const newUrls = await Promise.all(uploadPromises);
        // Replace existing images or append? Typically replace for single thumbnail view, but data structure supports array.
        // For this design (Thumbnail), we'll treat it as primary image replacement if new one is uploaded.
        imageUrls = newUrls; 
      }

      const payload = {
        name: values.name,
        description: values.description,
        price: values.price,
        cost: values.cost,
        stock: values.stock,
        category_id: values.category_id,
        image_urls: imageUrls,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast.error(`Failed to save product: ${error.message}`);
    },
  });

  if (isEditMode && isLoadingProduct) {
    return <div className="p-8"><Skeleton className="h-[500px] w-full" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
      </div>

      <ProductForm 
        onSubmit={(values) => mutation.mutate(values)} 
        product={product} 
        isSubmitting={mutation.isPending}
      />
    </div>
  );
};

export default ProductFormPage;