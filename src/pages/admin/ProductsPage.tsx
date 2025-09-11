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
import { MoreHorizontal, PlusCircle, Package, ArrowUpDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm, ProductFormValues } from "@/components/admin/ProductForm";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  image_urls: string[] | null;
  created_at: string;
  category_id: string | null;
  categories: { name: string } | null;
};

const PRODUCTS_PER_PAGE = 10;

const fetchProducts = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name)", { count: "exact" });

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);
  return { data: data as Product[], count: count || 0 };
};

const ProductsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { session } = useAuth();
  const currencyCode = settings?.currency || "USD";

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", currentPage, searchTerm, sortColumn, sortDirection],
    queryFn: () => fetchProducts(currentPage, PRODUCTS_PER_PAGE, searchTerm, sortColumn, sortDirection),
  });

  const products = data?.data || [];
  const totalProducts = data?.count || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      if (!session) throw new Error("User not authenticated.");

      let imageUrls: string[] = [];

      if (newProduct.images && newProduct.images.length > 0) {
        const uploadPromises = Array.from(newProduct.images).map(async (file) => {
          const fileName = `public/${session.user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
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
          category_id: newProduct.category_id,
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
      if (!session) throw new Error("User not authenticated.");

      let imageUrlsToSave: string[] | null = editingProduct.image_urls;

      if (updatedValues.images && updatedValues.images.length > 0) {
        // New images provided, upload them
        const uploadPromises = Array.from(updatedValues.images).map(async (file) => {
          const fileName = `public/${session.user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          if (!publicUrl) {
            throw new Error("Could not get public URL for uploaded image.");
          }
          return publicUrl;
        });
        imageUrlsToSave = await Promise.all(uploadPromises);
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: updatedValues.name,
          description: updatedValues.description,
          price: updatedValues.price,
          cost: updatedValues.cost,
          stock: updatedValues.stock,
          image_urls: imageUrlsToSave,
          category_id: updatedValues.category_id,
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
      setEditingProduct(null);
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

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the details for this product." : "Fill in the details below to add a new product to your store."}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              product={editingProduct || undefined}
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
          <div className="relative mt-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Image</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('stock')}>
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('price')}>
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('cost')}>
                    Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('created_at')}>
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-red-500">
                    Error loading products: {error.message}
                  </TableCell>
                </TableRow>
              ) : products.length ? (
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
                    <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{formatCurrency(product.price, currencyCode)}</TableCell>
                    <TableCell>{formatCurrency(product.cost, currencyCode)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProductsPage;