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
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BannerCard } from "@/pages/admin/BannerSettingsPage";

const bannerCardFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.custom<FileList>().optional(),
  link_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  order_index: z.coerce.number().int().min(0, "Order must be a non-negative integer.").optional(),
});

export type BannerCardFormValues = z.infer<typeof bannerCardFormSchema>;

interface BannerCardFormProps {
  onSubmit: (values: BannerCardFormValues) => void;
  defaultValues?: BannerCard;
  isSubmitting: boolean;
}

export function BannerCardForm({ onSubmit, defaultValues, isSubmitting }: BannerCardFormProps) {
  const form = useForm<BannerCardFormValues>({
    resolver: zodResolver(bannerCardFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      link_url: defaultValues?.link_url ?? "",
      order_index: defaultValues?.order_index ?? 0,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url ?? null);
  const watchedImage = form.watch("image");

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const newPreview = URL.createObjectURL(watchedImage[0]);
      setImagePreview(newPreview);

      return () => {
        URL.revokeObjectURL(newPreview);
      };
    } else {
      setImagePreview(defaultValues?.image_url ?? null);
    }
  }, [watchedImage, defaultValues?.image_url]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. More Ways to Pay" {...field} />
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
                <Textarea placeholder="A brief description for the banner card." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...restField} 
                />
              </FormControl>
              <FormDescription>
                Upload an image for the banner card background.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreview && (
          <div className="space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <div className="flex flex-wrap gap-2">
              <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded-md object-cover" />
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. /contact" {...field} />
              </FormControl>
              <FormDescription>
                The URL this banner card will link to when clicked.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order_index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Index</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormDescription>
                Cards will be ordered from low to high.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Banner Card" : "Create Banner Card"}
        </Button>
      </form>
    </Form>
  );
}