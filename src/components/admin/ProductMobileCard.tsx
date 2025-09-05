import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Package, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/pages/admin/ProductsPage';

interface ProductMobileCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductMobileCard: React.FC<ProductMobileCardProps> = ({ product, onEdit, onDelete }) => {
  const imageUrl = product.image_urls?.[0] || "https://placehold.co/600x400?text=No+Image";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="flex items-center space-x-3">
          {product.image_urls && product.image_urls.length > 0 ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-muted-foreground">Price:</p>
            <p className="font-medium">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost:</p>
            <p className="font-medium">{formatCurrency(product.cost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stock:</p>
            <p className="font-medium">{product.stock}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Added On:</p>
            <p className="font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductMobileCard;