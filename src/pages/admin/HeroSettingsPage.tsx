import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeroSlideForm, HeroSlideFormValues } from "@/components/admin/HeroSlideForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type HeroSlide = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  slide_order: number;
  created_at: string;
  user_id: string;
  show_text: boolean; // New field
  text_position: "left" | "center" | "right"; // New field
};

const fetchSlides = async () => {
  const { data, error } = await supabase.from("hero_slides").select("*").order("slide_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as HeroSlide[];
};

const initialSlidesData = [
  {
    title: "Occupational Safety & Health Compliance",
    description: "We help businesses meet legal and regulatory health and safety obligations through detailed audits, policy guidance, and on-site inspections. From documentation to day-to-day practices, we make sure your workplace is compliant, safe, and audit-ready.",
    imageUrl: "/images/slide1.jpg",
    showText: true,
    textPosition: "left",
  },
  {
    title: "Risk Management Solutions",
    description: "Identify, assess, and mitigate workplace risks with our expert support. We tailor risk management strategies for your specific industry—minimizing hazards, reducing downtime, and ensuring peace of mind across all operations.",
    imageUrl: "/images/slide2.jpg",
    showText: true,
    textPosition: "left",
  },
  {
    title: "Workplace Safety Training",
    description: "Equip your team with essential safety knowledge through our online and in-person training programs. We offer toolbox talks, fire safety sessions, and SHEQ-focused workshops that are practical, engaging, and fully certified.",
    imageUrl: "/images/slide3.jpg",
    showText: true,
    textPosition: "left",
  },
  {
    title: "PPE & Safety Equipment Supply",
    description: "We supply certified, high-quality personal protective equipment (PPE) and safety gear from trusted brands. Whether you need boots, helmets, signage, or full PPE kits—we’ve got your team covered and protected.",
    imageUrl: "/images/slide4.jpg",
    showText: true,
    textPosition: "left",
  },
];

const HeroSettingsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: slides, isLoading, error } = useQuery<HeroSlide[]>({
    queryKey: ["hero_slides"],
    queryFn: fetchSlides,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_slides"] });
      queryClient.invalidateQueries({ queryKey: ["hero_slides_public"] });
      setIsDialogOpen(false);
      setEditingSlide(null);
    },
    onError: (error: Error) => {
      toast.error(`An error occurred: ${error.message}`);
    },
  };

  const addSlideMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (newSlide: HeroSlideFormValues) => {
      if (!session) throw new Error("Not authenticated");
      let imageUrl = "";

      if (newSlide.image && newSlide.image.length > 0) {
        const file = newSlide.image[0];
        const fileName = `public/hero/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(fileName);
        imageUrl = publicUrl;
      } else {
        throw new Error("An image is required for a new slide.");
      }

      const { error } = await supabase.from("hero_slides").insert([{
        title: newSlide.title,
        description: newSlide.description,
        slide_order: newSlide.slide_order,
        image_url: imageUrl,
        user_id: session.user.id,
        show_text: newSlide.show_text, // Save new field
        text_position: newSlide.text_position, // Save new field
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Slide added successfully!");
      mutationOptions.onSuccess();
    },
  });

  const updateSlideMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (updatedValues: HeroSlideFormValues) => {
      if (!editingSlide) throw new Error("No slide selected for update.");
      let imageUrl = editingSlide.image_url;

      if (updatedValues.image && updatedValues.image.length > 0) {
        const file = updatedValues.image[0];
        const fileName = `public/hero/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("hero_slides").update({
        title: updatedValues.title,
        description: updatedValues.description,
        slide_order: updatedValues.slide_order,
        image_url: imageUrl,
        show_text: updatedValues.show_text, // Update new field
        text_position: updatedValues.text_position, // Update new field
      }).eq("id", editingSlide.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Slide updated successfully!");
      mutationOptions.onSuccess();
    },
  });

  const deleteSlideMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (slideId: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", slideId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Slide deleted successfully!");
      mutationOptions.onSuccess();
    },
  });
  
  const importSlidesMutation = useMutation({
    ...mutationOptions,
    mutationFn: async () => {
        if (!session) throw new Error("Not authenticated");
        const slidesToInsert = initialSlidesData.map((slide, index) => ({
            title: slide.title,
            description: slide.description,
            image_url: slide.imageUrl,
            slide_order: index,
            user_id: session.user.id,
            show_text: slide.showText,
            text_position: slide.textPosition,
        }));

        const { error } = await supabase.from("hero_slides").insert(slidesToInsert);
        if (error) throw error;
    },
    onSuccess: () => {
        toast.success("Initial slides imported successfully!");
        mutationOptions.onSuccess();
    }
  });

  const handleSubmit = (values: HeroSlideFormValues) => {
    if (editingSlide) {
      updateSlideMutation.mutate(values);
    } else {
      addSlideMutation.mutate(values);
    }
  };

  const handleEditClick = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingSlide(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hero Slider Settings</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
              <DialogDescription>
                {editingSlide ? "Update the details for this slide." : "Fill in the details for the new slide."}
              </DialogDescription>
            </DialogHeader>
            <HeroSlideForm
              onSubmit={handleSubmit}
              slide={editingSlide || undefined}
              isSubmitting={addSlideMutation.isPending || updateSlideMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Slides</CardTitle>
          <CardDescription>
            Add, edit, or delete slides for your homepage hero section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Text Visible</TableHead> {/* New column */}
                <TableHead>Text Position</TableHead> {/* New column */}
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading slides...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : slides?.length ? (
                slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>{slide.slide_order}</TableCell>
                    <TableCell>
                      <img src={slide.image_url} alt={slide.title} className="h-10 w-16 rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{slide.title}</TableCell>
                    <TableCell>{slide.show_text ? "Yes" : "No"}</TableCell> {/* Display new field */}
                    <TableCell className="capitalize">{slide.text_position}</TableCell> {/* Display new field */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(slide)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteSlideMutation.mutate(slide.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <p className="mb-4">No slides found.</p>
                    <Button onClick={() => importSlidesMutation.mutate()} disabled={importSlidesMutation.isPending}>
                        Import Default Slides
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default HeroSettingsPage;