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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";

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
  category_id: z.string().uuid({ message: "Please select a category." }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => void;
  product?: Product;
  isSubmitting?: boolean;
  defaultCategoryId?: string;
}

export function ProductForm({ onSubmit, product, isSubmitting, defaultCategoryId }: ProductFormProps) {
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
      category_id: product?.category_id ?? defaultCategoryId ?? "",
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
    } else if (!product && (!watchedImage || watchedImage.length === 0)) {
      setImagePreview(null);
    }
  }, [watchedImage, product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setImageToCrop(fileUrl);
      setIsCropperOpen(true);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    form.setValue("images", dataTransfer.files, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(croppedFile));
    setIsCropperOpen(false);
    setImageToCrop(null);
    toast.success("Image cropped successfully!");
  };

  const handleCropperClose = () => {
    setIsCropperOpen(false);
    setImageToCrop(null);
    // Reset file input if needed or handle cancellation logic
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    form.setValue("images", undefined);
    setImagePreview(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Surgical Mask Pack" {...field} />
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
                      <Textarea 
                        placeholder="Type your product description here..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Inventory Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
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
                      <FormLabel>Cost Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Available quantity in warehouse</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Thumbnail Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-full aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/5 flex items-center justify-center overflow-hidden hover:bg-muted/10 transition-colors">
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Product thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                         <Button 
                           type="button" 
                           variant="destructive" 
                           size="icon" 
                           className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                           onClick={clearImage}
                         >
                           <X className="h-4 w-4" />
                         </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImagePlus className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-sm">No image uploaded</span>
                    </div>
                  )}
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
                    disabled={!!imagePreview} // Disable input if image exists (force delete first)
                    title={imagePreview ? "Remove image to upload new" : "Upload image"}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Details / Category Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
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
                    <FormDescription>Add product to a category.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Future: Add "Create New Category" button here if requested */}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Saving..." : (product ? "Save Changes" : "Publish Product")}
            </Button>
          </div>
        </div>

      </form>

      {imageToCrop && (
        <ImageCropperDialog
          imageSrc={imageToCrop}
          isOpen={isCropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          aspectRatio={1} 
        />
      )}
    </Form>
  );
}