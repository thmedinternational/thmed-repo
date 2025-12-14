import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/pages/admin/ProductsPage";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageCropperDialog } from "./ImageCropperDialog";
import { toast } from "sonner";

// Define Category type
type Category = {
  id: string;
  name: string;
};

// Fetch categories from Supabase
const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  cost: z.coerce.number().min(0, { message: "Cost must be a positive number." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a positive integer." }),
  images: z.custom<FileList>().optional(),
  category_id: z.string().uuid({ message: "Please select a category." }), // Added category_id
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => void;
  product?: Product;
  isSubmitting?: boolean;
}

export function ProductForm({ onSubmit, product, isSubmitting }: ProductFormProps) {
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      stock: product?.stock ?? 0,
      category_id: product?.category_id ?? "", // Set default category_id
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_urls?.[0] ?? null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const watchedImage = form.watch("images");

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const newPreview = URL.createObjectURL(watchedImage[0]);
      setImagePreview(newPreview);
      // No need to revoke here, as it will be revoked when the component unmounts or a new image is selected
    } else if (!product) {
      setImagePreview(null); // Clear preview if no image and not editing
    }
  }, [watchedImage, product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setImageToCrop(fileUrl);
      setIsCropperOpen(true);
      // Store the original file in a temporary state or ref if needed,
      // but for now, we'll just pass the URL to the cropper.
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    // Create a new FileList containing only the cropped file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    form.setValue("image", dataTransfer.files, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(croppedFile)); // Update preview with cropped image
    setIsCropperOpen(false);
    setImageToCrop(null); // Clear image to crop
    toast.success("Image cropped successfully!");
  };

  const handleCropperClose = () => {
    setIsCropperOpen(false);
    setImageToCrop(null);
    // If the user cancels cropping, we might want to clear the selected file
    // or revert to the previous image. For now, it just closes.
    // If it's a new slide, the image input will effectively be cleared.
    // If it's an edit, the original image_url will remain.
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. T-Shirt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief description of the product." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="9.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="4.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Product Image</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} // Use custom handler
            />
          </FormControl>
          <FormDescription>
            Upload an image for the product.
          </FormDescription>
          <FormMessage />
        </FormItem>

        {imagePreview && (
          <div className="space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <div className="flex flex-wrap gap-2">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md object-cover" />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </form>

      {imageToCrop && (
        <ImageCropperDialog
          imageSrc={imageToCrop}
          isOpen={isCropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          aspectRatio={1} // Square aspect ratio for product images
        />
      )}
    </Form>
  );
}