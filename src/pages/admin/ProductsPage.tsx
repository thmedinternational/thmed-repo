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
import { MoreHorizontal, PlusCircle, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm, ProductFormValues } from "@/components/admin/ProductForm";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  image_urls: string[] | null;
  created_at: string;
};

const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Product[];
};

const ProductsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // New state for editing
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      let imageUrls: string[] = [];

      if (newProduct.images && newProduct.images.length > 0) {
        const uploadPromises = Array.from(newProduct.images).map(async (file) => {
          const fileName = `public/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("store-assets")
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("store-assets")
            .getPublicUrl(fileName);
          
          if (!publicUrl) {
            throw new Error("Could not get public URL for uploaded image.");
          }

          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const { error } = await supabase.from("products").insert([
        {
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          cost: newProduct.cost,
          stock: newProduct.stock,
          image_urls: imageUrls,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updatedValues: ProductFormValues) => {
      if (!editingProduct) throw new Error("No product selected for update.");

      let imageUrlsToSave: string[] | null = editingProduct.image_urls; // Start with existing images

      if (updatedValues.images && updatedValues.images.length > 0) {
        // New images provided, upload them
        const uploadPromises = Array.from(updatedValues.images).map(async (file) => {
          const fileName = `public/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("store-assets")
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("store-assets")
            .getPublicUrl(fileName);

          if (!publicUrl) {
            throw new Error("Could not get public URL for uploaded image.");
          }
          return publicUrl;
        });
        imageUrlsToSave = await Promise.all(uploadPromises);
      }
      // If updatedValues.images is undefined/empty, imageUrlsToSave remains editingProduct.image_urls

      const { error } = await supabase
        .from("products")
        .update({
          name: updatedValues.name,
          description: updatedValues.description,
          price: updatedValues.price,
          cost: updatedValues.cost,
          stock: updatedValues.stock,
          image_urls: imageUrlsToSave,
        })
        .eq("id", editingProduct.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      setEditingProduct(null); // Clear editing state
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const handleAddProduct = (values: ProductFormValues) => {
    addProductMutation.mutate(values);
  };

  const handleUpdateProduct = (values: ProductFormValues) => {
    updateProductMutation.mutate(values);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // Reset editingProduct when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProduct(null); // Clear editing state when dialog closes
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}> {/* Use handleDialogChange */}
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}> {/* Clear editing state when opening for new product */}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle> {/* Dynamic title */}
              <DialogDescription>
                {editingProduct ? "Update the details for this product." : "Fill in the details below to add a new product to your store."} {/* Dynamic description */}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              product={editingProduct || undefined} // Pass product for editing
              isSubmitting={addProductMutation.isPending || updateProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all products in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-red-500">
                    Error loading products: {error.message}
                  </TableCell>
                </TableRow>
              ) : products?.length ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>${product.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>Edit</DropdownMenuItem> {/* Add onClick */}
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found.
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

export default ProductsPage;