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

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  cost: z.coerce.number().min(0, { message: "Cost must be a positive number." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a positive integer." }),
  images: z.custom<FileList>().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => void;
  product?: Product;
  isSubmitting?: boolean;
}

export function ProductForm({ onSubmit, product, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      stock: product?.stock ?? 0,
    },
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.image_urls ?? []);
  const watchedImages = form.watch("images");

  useEffect(() => {
    if (watchedImages && watchedImages.length > 0) {
      const newPreviews = Array.from(watchedImages).map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);

      return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setImagePreviews(product?.image_urls ?? []);
    }
  }, [watchedImages, product]);

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
          name="images"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...restField} 
                />
              </FormControl>
              <FormDescription>
                Upload one or more images for the product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreviews.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Image Previews</FormLabel>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
              ))}
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </form>
    </Form>
  );
}