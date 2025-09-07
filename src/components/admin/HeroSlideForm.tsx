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
import { HeroSlide } from "@/pages/admin/HeroSettingsPage";

const heroSlideFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.custom<FileList>().optional(),
  slide_order: z.coerce.number().int().optional(),
});

export type HeroSlideFormValues = z.infer<typeof heroSlideFormSchema>;

interface HeroSlideFormProps {
  onSubmit: (values: HeroSlideFormValues) => void;
  slide?: HeroSlide;
  isSubmitting?: boolean;
}

export function HeroSlideForm({ onSubmit, slide, isSubmitting }: HeroSlideFormProps) {
  const form = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideFormSchema),
    defaultValues: {
      title: slide?.title ?? "",
      description: slide?.description ?? "",
      slide_order: slide?.slide_order ?? 0,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(slide?.image_url ?? null);
  const watchedImage = form.watch("image");

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const newPreview = URL.createObjectURL(watchedImage[0]);
      setImagePreview(newPreview);

      return () => {
        URL.revokeObjectURL(newPreview);
      };
    } else {
      setImagePreview(slide?.image_url ?? null);
    }
  }, [watchedImage, slide]);

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
                <Input placeholder="e.g. Summer Sale" {...field} />
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
                <Textarea placeholder="A brief description for the slide." {...field} />
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
              <FormLabel>Slide Image</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...restField} 
                />
              </FormControl>
              <FormDescription>
                Upload an image for the slide. Recommended aspect ratio 16:7.
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
          name="slide_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slide Order</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormDescription>
                Slides will be ordered from low to high.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Slide"}
        </Button>
      </form>
    </Form>
  );
}