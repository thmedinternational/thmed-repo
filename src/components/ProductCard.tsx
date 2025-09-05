import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_urls: string[] | null;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const imageUrl = product.image_urls?.[0] || "https://placehold.co/600x400?text=No+Image";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    } else {
      toast.error(`${product.name} is out of stock.`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl h-full">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${product.id}`} className="block aspect-square w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        {product.stock > 0 && (
          <Button
            className="absolute top-2 right-2 rounded-lg px-3 py-1.5 text-sm bg-add-to-cart-button text-add-to-cart-button-foreground hover:bg-add-to-cart-button/90 shadow-md"
            onClick={handleAddToCart}
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="mt-2 text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;