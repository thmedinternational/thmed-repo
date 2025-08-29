import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext"; // Import useCart
import { toast } from "sonner"; // Import toast for notifications

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
  const { addToCart } = useCart(); // Use the cart context

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const imageUrl = product.image_urls?.[0] || "https://placehold.co/600x400?text=No+Image";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default link behavior
    e.stopPropagation(); // Stop event from propagating to parent elements (like a potential outer Link)
    if (product.stock > 0) {
      addToCart(product, 1);
    } else {
      toast.error(`${product.name} is out of stock.`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl h-full">
      <CardHeader className="p-0">
        <Link to={`/products/${product.id}`} className="block aspect-square w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        <p className="mt-2 text-2xl font-bold">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;