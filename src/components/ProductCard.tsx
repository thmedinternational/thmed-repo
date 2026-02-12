import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Share2, Heart, ShoppingCart } from "lucide-react"; 
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext"; 

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number;
  stock: number;
  image_urls: string[] | null;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { settings } = useSettings(); 
  const currencyCode = settings?.currency || "USD"; 

  const imageUrl = product.image_urls?.[0] || "https://placehold.co/600x400?text=No+Image";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
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

  const hasDiscount = product.original_price && product.original_price > product.price;
  const savings = hasDiscount ? (product.original_price! - product.price) : 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
      <CardHeader className="p-0 relative">
        {/* Top Badges & Actions */}
        <div className="absolute top-2 left-2 z-10">
          {hasDiscount && (
            <span className="inline-block bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded-sm">
              Save {formatCurrency(savings, currencyCode)}
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 z-10">
           <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Added to wishlist (demo)");
            }}
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to Wishlist</span>
          </Button>
        </div>

        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="block h-[200px] w-full p-4 bg-white flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow p-4 pt-2">
        <Link to={`/products/${product.id}`} className="flex-grow">
          {/* Star Rating Placeholder */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400 text-xs">
              {'★'.repeat(4)}{'☆'.repeat(1)}
            </div>
            <span className="text-xs text-muted-foreground">(0)</span>
          </div>

          <CardTitle className="text-sm font-medium line-clamp-2 min-h-[40px] mb-2 text-gray-700 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          
          <div className="mt-auto">
            <p className="text-lg font-extrabold text-pink-600 tracking-tight">
              {formatCurrency(product.price, currencyCode)}
            </p>
            {hasDiscount && (
               <p className="text-xs text-gray-400 line-through font-medium">
                {formatCurrency(product.original_price!, currencyCode)}
              </p>
            )}
            {!hasDiscount && <div className="h-4"></div>} {/* Spacer for alignment */}
          </div>
        </Link>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
           {product.stock > 0 ? (
            <Button
              className="w-full rounded-full border-2 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 font-semibold transition-all"
              onClick={handleAddToCart}
              size="sm"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add
            </Button>
          ) : (
            <Button
              className="w-full rounded-full bg-muted text-muted-foreground cursor-not-allowed"
              disabled
              size="sm"
            >
              Out of Stock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;