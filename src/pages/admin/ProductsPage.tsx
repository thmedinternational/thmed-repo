import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { MoreHorizontal, PlusCircle, Package, ArrowUpDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
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
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductImporter } from "@/components/admin/ProductImporter";

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
  sortDirection: 'asc' | 'desc',
  categoryId: string | null
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name)", { count: "exact" });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  if (sortColumn === 'category') {
    query = query.order('name', { foreignTable: 'categories', ascending: sortDirection === 'asc' });
  } else {
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);
  return { data: data as Product[], count: count || 0 };
};

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const navigate = useNavigate();

  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", currentPage, searchTerm, sortColumn, sortDirection, categoryId],
    queryFn: () => fetchProducts(currentPage, PRODUCTS_PER_PAGE, searchTerm, sortColumn, sortDirection, categoryId),
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

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <ProductImporter />
          <Button onClick={() => navigate("/admin/products/new")} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List {categoryId ? "(Filtered)" : ""}</CardTitle>
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
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-hidden rounded-md border w-full">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead className="w-[180px] sm:w-[250px]">
                    <Button variant="ghost" onClick={() => handleSort('name')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Name
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden md:table-cell">
                    <Button variant="ghost" onClick={() => handleSort('category')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Category
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[70px]">
                    <Button variant="ghost" onClick={() => handleSort('stock')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Stock
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[90px]">
                    <Button variant="ghost" onClick={() => handleSort('price')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Price
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[90px] hidden lg:table-cell">
                    <Button variant="ghost" onClick={() => handleSort('cost')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Cost
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[110px] hidden xl:table-cell">
                    <Button variant="ghost" onClick={() => handleSort('created_at')} className="p-0 hover:bg-transparent text-left font-semibold">
                      Created At
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px] text-right">
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
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
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
                            className="h-10 w-10 rounded-md object-cover min-w-[40px]"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center min-w-[40px]">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="truncate font-medium max-w-[160px] sm:max-w-[240px]" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[90px]" title={product.categories?.name || 'N/A'}>
                          {product.categories?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{formatCurrency(product.price, currencyCode)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatCurrency(product.cost, currencyCode)}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="truncate">
                          {new Date(product.created_at).toLocaleDateString()}
                        </div>
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
                            <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${product.id}`)}>Edit</DropdownMenuItem>
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
          </div>
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