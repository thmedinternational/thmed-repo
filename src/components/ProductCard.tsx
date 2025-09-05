import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react"; // Import Share2 icon
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

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
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

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

  const handleShareOnWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const message = `Check out this product: ${product.name} for ${formatCurrency(product.price, currencyCode)}! ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${product.id}`} className="block h-[180px] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-2"> {/* Reduced padding */}
        <div className="flex-grow">
          <Link to={`/products/${product.id}`}>
            <CardTitle className="text-sm font-bold line-clamp-2 min-h-[40px]"> {/* Smaller font, bold, 2 lines */}
              {product.name}
            </CardTitle>
          </Link>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-base font-bold text-primary tracking-tight"> {/* 16px, bold, red, tight tracking */}
            {formatCurrency(product.price, currencyCode)}
          </p>
        </div>
        <div className="flex justify-end mt-2 space-x-2"> {/* Aligned to bottom right, added space-x-2 */}
          {product.stock > 0 && (
            <Button
              className="rounded-md px-2 py-1 text-xs bg-add-to-cart-button text-add-to-cart-button-foreground hover:bg-add-to-cart-button/90 shadow-md"
              onClick={handleAddToCart}
              size="sm"
            >
              <Plus className="mr-1 h-3 w-3" /> Add
            </Button>
          )}
          <Button
            variant="outline" // Using outline variant for distinction
            size="sm"
            className="rounded-md px-2 py-1 text-xs shadow-md"
            onClick={handleShareOnWhatsApp}
          >
            <Share2 className="h-3 w-3" />
            <span className="sr-only">Share on WhatsApp</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;