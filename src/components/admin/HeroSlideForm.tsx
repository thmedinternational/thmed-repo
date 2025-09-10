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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ImageCropperDialog } from "./ImageCropperDialog"; // Import the new cropper dialog
import { toast } from "sonner";

const heroSlideFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.custom<FileList>().optional(), // This will hold the original file or the cropped file
  slide_order: z.coerce.number().int().optional(),
  show_text: z.boolean().default(true),
  text_position: z.enum(["left", "center", "right"]).default("left"),
  overlay_opacity: z.number().min(0).max(1).default(0.5),
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
      show_text: slide?.show_text ?? true,
      text_position: slide?.text_position ?? "left",
      overlay_opacity: slide?.overlay_opacity ?? 0.5,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(slide?.image_url ?? null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const watchedImage = form.watch("image");

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const newPreview = URL.createObjectURL(watchedImage[0]);
      setImagePreview(newPreview);
      // No need to revoke here, as it will be revoked when the component unmounts or a new image is selected
    } else if (!slide) {
      setImagePreview(null); // Clear preview if no image and not editing
    }
  }, [watchedImage, slide]);

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
        <FormItem>
          <FormLabel>Slide Image</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} // Use custom handler
            />
          </FormControl>
          <FormDescription>
            Upload an image for the slide. Recommended aspect ratio 16:7. Images with different aspect ratios will be cropped to fit.
          </FormDescription>
          <FormMessage />
        </FormItem>

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

        <FormField
          control={form.control}
          name="show_text"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show Text Overlay</FormLabel>
                <FormDescription>
                  Toggle to display the title and description on the slide.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="text_position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select text alignment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Align the text content (title and description) on the slide.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="overlay_opacity" render={({ field }) => (
          <FormItem>
            <FormLabel>Image Overlay Opacity: {field.value?.toFixed(1)}</FormLabel>
            <FormControl>
              <Slider 
                defaultValue={[0.5]} 
                value={[field.value ?? 0.5]} 
                onValueChange={v => field.onChange(v[0])} 
                min={0} 
                max={1} 
                step={0.1} 
              />
            </FormControl>
            <FormDescription>
              Adjust the darkness of the overlay on this slide's image (0.0 = transparent, 1.0 = opaque).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Slide"}
        </Button>
      </form>

      {imageToCrop && (
        <ImageCropperDialog
          imageSrc={imageToCrop}
          isOpen={isCropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 7}
        />
      )}
    </Form>
  );
}