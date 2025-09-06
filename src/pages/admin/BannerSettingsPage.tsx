import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { BannerCardForm, BannerCardFormValues } from "@/components/admin/BannerCardForm";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export type BannerCard = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
};

const fetchBannerCards = async () => {
  const { data, error } = await supabase.from("banner_cards").select("*").order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data as BannerCard[];
};

const BannerSettingsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<BannerCard | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: bannerCards, isLoading, error } = useQuery<BannerCard[]>({
    queryKey: ["bannerCards"],
    queryFn: fetchBannerCards,
  });

  const upsertBannerCardMutation = useMutation({
    mutationFn: async (values: BannerCardFormValues & { id?: string }) => {
      if (!session) throw new Error("User not authenticated.");

      let imageUrl = values.id ? bannerCards?.find(c => c.id === values.id)?.image_url : null;

      if (values.image && values.image.length > 0) {
        const file = values.image[0];
        const fileName = `public/${session.user.id}/${Date.now()}-${file.name}`;
        
        // If editing and a new image is uploaded, delete the old one
        if (values.id && imageUrl) {
            const oldImagePath = imageUrl.split('/banner-images/')[1];
            if (oldImagePath) {
              await supabase.storage.from('banner-images').remove([oldImagePath]);
            }
        }

        const { error: uploadError } = await supabase.storage.from("banner-images").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("banner-images").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const payload = {
        title: values.title,
        description: values.description,
        image_url: imageUrl,
        link_url: values.link_url,
        order_index: values.order_index,
        user_id: session.user.id,
      };

      if (values.id) {
        const { error } = await supabase.from("banner_cards").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banner_cards").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Banner card saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["bannerCards"] });
      setIsDialogOpen(false);
      setEditingCard(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to save banner card: ${err.message}`);
    },
  });

  const deleteBannerCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const cardToDelete = bannerCards?.find(card => card.id === id);
      if (cardToDelete?.image_url) {
        const imagePath = cardToDelete.image_url.split('/banner-images/')[1];
        if (imagePath) {
          await supabase.storage.from('banner-images').remove([imagePath]);
        }
      }
      const { error } = await supabase.from("banner_cards").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Banner card deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["bannerCards"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete banner card: ${err.message}`);
    },
  });

  const handleEditClick = (card: BannerCard) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCard(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Banner Settings</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCard(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Banner Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCard ? "Edit Banner Card" : "Add New Banner Card"}</DialogTitle>
              <DialogDescription>
                {editingCard ? "Update the details for this banner card." : "Create a new banner card for your homepage."}
              </DialogDescription>
            </DialogHeader>
            <BannerCardForm
              onSubmit={(values) => upsertBannerCardMutation.mutate({ ...values, id: editingCard?.id })}
              defaultValues={editingCard || undefined}
              isSubmitting={upsertBannerCardMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banner Cards</CardTitle>
          <CardDescription>Manage the banner cards displayed on your homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-red-500">
                    Error loading banner cards: {error.message}
                  </TableCell>
                </TableRow>
              ) : bannerCards?.length ? (
                bannerCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.title} className="h-10 w-10 object-cover rounded-md" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{card.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{card.description || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-blue-500">{card.link_url || 'N/A'}</TableCell>
                    <TableCell>{card.order_index}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(card)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBannerCardMutation.mutate(card.id)} disabled={deleteBannerCardMutation.isPending}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No banner cards found. Add a new one to get started!
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

export default BannerSettingsPage;