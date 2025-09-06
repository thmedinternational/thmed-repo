import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, MessageSquare, FileText, Truck } from "lucide-react"; // Added new icons
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext"; // Import useSettings

const ShoppingCartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const whatsAppNumber = "27768170495"; // Updated WhatsApp number
  const { settings } = useSettings(); // Use the hook
  const currencyCode = settings?.currency || "USD"; // Get currency code

  const generateWhatsAppMessage = (type: 'checkout' | 'quotation' | 'delivery') => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return "";
    }

    let message = "";
    const productList = cartItems.map(item => `- ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity, currencyCode)}`).join("\n");

    switch (type) {
      case 'checkout':
        message = `Hello, I'd like to proceed with my order from TH-MED International. My cart details are:\n\n${productList}\n\nTotal: ${formatCurrency(cartTotal, currencyCode)}\n\nPlease confirm my order and delivery options.`;
        break;
      case 'quotation':
        message = `Hello, I'd like to request a quotation for the following items from TH-MED International:\n\n${productList}\n\nEstimated Total: ${formatCurrency(cartTotal, currencyCode)}\n\nPlease provide a formal quote.`;
        break;
      case 'delivery':
        message = `Hello, I'd like to discuss delivery arrangements for my order from TH-MED International. My cart details are:\n\n${productList}\n\nTotal: ${formatCurrency(cartTotal, currencyCode)}\n\nPlease assist with delivery options.`;
        break;
      default:
        message = "Hello, I have a question about my cart from TH-MED International.";
    }
    return encodeURIComponent(message);
  };

  const handleWhatsAppAction = (type: 'checkout' | 'quotation' | 'delivery') => {
    const encodedMessage = generateWhatsAppMessage(type);
    if (encodedMessage) {
      window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, "_blank");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-4xl font-poppins font-bold tracking-tight mb-4 text-magenta">Your Cart is Empty</h1>
        <p className="text-lg font-montserrat font-light text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-poppins font-bold tracking-tight mb-8 text-center text-magenta">Your Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center border rounded-lg p-4 shadow-sm">
              <Link to={`/products/${item.id}`} className="flex-shrink-0">
                <img
                  src={item.image_urls?.[0] || "https://placehold.co/100x100?text=No+Image"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
              </Link>
              <div className="flex-grow">
                <Link to={`/products/${item.id}`}>
                  <h2 className="text-base md:text-xl font-semibold hover:underline">{item.name}</h2>
                </Link>
                <p className="text-sm md:text-base text-muted-foreground">{formatCurrency(item.price, currencyCode)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-1 bg-secondary p-6 rounded-lg shadow-md sticky top-20 text-secondary-foreground">
          <h2 className="text-2xl font-poppins font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between text-lg font-medium mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(cartTotal, currencyCode)}</span>
          </div>
          <div className="flex justify-between text-lg font-medium mb-4">
            <span>Shipping:</span>
            <span>Free</span> {/* For now, assuming free shipping */}
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between text-xl font-poppins font-bold tracking-tight">
            <span>Total:</span>
            <span>{formatCurrency(cartTotal, currencyCode)}</span>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button className="w-full py-3 text-lg bg-primary hover:bg-primary/90" onClick={() => handleWhatsAppAction('checkout')}>
              <MessageSquare className="mr-2 h-5 w-5" /> Proceed to Checkout
            </Button>
            <Button 
              className="w-full py-3 text-lg bg-secondary text-secondary-foreground border border-white hover:bg-secondary/80" 
              onClick={() => handleWhatsAppAction('quotation')}
            >
              <FileText className="mr-2 h-5 w-5" /> Request Quotation
            </Button>
            <Button 
              className="w-full py-3 text-lg bg-secondary text-secondary-foreground border border-white hover:bg-secondary/80" 
              onClick={() => handleWhatsAppAction('delivery')}
            >
              <Truck className="mr-2 h-5 w-5" /> Arrange Delivery
            </Button>
            <Button variant="ghost" className="w-full mt-3 text-destructive hover:bg-destructive/10" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;