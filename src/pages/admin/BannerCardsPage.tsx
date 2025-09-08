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
import { MoreHorizontal, PlusCircle, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BannerCardForm, BannerCardFormValues } from "@/components/admin/BannerCardForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type BannerCard = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  user_id: string;
};

const fetchBannerCards = async (): Promise<BannerCard[]> => {
  const { data, error } = await supabase.from("banner_cards").select("*").order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data as BannerCard[];
};

const BannerCardsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerCard, setEditingBannerCard] = useState<BannerCard | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: bannerCards, isLoading, error } = useQuery<BannerCard[]>({
    queryKey: ["banner_cards"],
    queryFn: fetchBannerCards,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner_cards"] });
      setIsDialogOpen(false);
      setEditingBannerCard(null);
    },
    onError: (error: Error) => {
      toast.error(`An error occurred: ${error.message}`);
    },
  };

  const addBannerCardMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (newBannerCard: BannerCardFormValues) => {
      if (!session) throw new Error("Not authenticated");
      let imageUrl: string | null = null;

      if (newBannerCard.image && newBannerCard.image.length > 0) {
        const file = newBannerCard.image[0];
        const fileName = `public/banner-cards/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("banner_cards").insert([{
        title: newBannerCard.title,
        description: newBannerCard.description,
        image_url: imageUrl,
        link_url: newBannerCard.link_url,
        order_index: newBannerCard.order_index,
        user_id: session.user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner card added successfully!");
      mutationOptions.onSuccess();
    },
  });

  const updateBannerCardMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (updatedValues: BannerCardFormValues) => {
      if (!editingBannerCard) throw new Error("No banner card selected for update.");
      let imageUrlToSave: string | null = editingBannerCard.image_url;

      if (updatedValues.image && updatedValues.image.length > 0) {
        const file = updatedValues.image[0];
        const fileName = `public/banner-cards/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(fileName);
        imageUrlToSave = publicUrl;
      }

      const { error } = await supabase.from("banner_cards").update({
        title: updatedValues.title,
        description: updatedValues.description,
        image_url: imageUrlToSave,
        link_url: updatedValues.link_url,
        order_index: updatedValues.order_index,
      }).eq("id", editingBannerCard.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner card updated successfully!");
      mutationOptions.onSuccess();
    },
  });

  const deleteBannerCardMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (bannerCardId: string) => {
      const { error } = await supabase.from("banner_cards").delete().eq("id", bannerCardId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner card deleted successfully!");
      mutationOptions.onSuccess();
    },
  });

  const handleSubmit = (values: BannerCardFormValues) => {
    if (editingBannerCard) {
      updateBannerCardMutation.mutate(values);
    } else {
      addBannerCardMutation.mutate(values);
    }
  };

  const handleEditClick = (bannerCard: BannerCard) => {
    setEditingBannerCard(bannerCard);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBannerCard(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Promotional Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Banner Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingBannerCard ? "Edit Banner Card" : "Add New Banner Card"}</DialogTitle>
              <DialogDescription>
                {editingBannerCard ? "Update the details for this banner card." : "Fill in the details for the new banner card."}
              </DialogDescription>
            </DialogHeader>
            <BannerCardForm
              onSubmit={handleSubmit}
              bannerCard={editingBannerCard || undefined}
              isSubmitting={addBannerCardMutation.isPending || updateBannerCardMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Banner Cards</CardTitle>
          <CardDescription>
            Add, edit, or delete promotional banner cards for your homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading banner cards...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>
              ) : bannerCards?.length ? (
                bannerCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>{card.order_index}</TableCell>
                    <TableCell>
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.title} className="h-10 w-16 rounded-md object-cover" />
                      ) : (
                        <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{card.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground line-clamp-1">{card.description || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-blue-500 hover:underline">
                      {card.link_url ? <a href={card.link_url} target="_blank" rel="noopener noreferrer">{card.link_url.substring(0, 30)}...</a> : 'N/A'}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(card)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteBannerCardMutation.mutate(card.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No banner cards found.
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

export default BannerCardsPage;