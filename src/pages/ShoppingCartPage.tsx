import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, MessageSquare, FileText, Truck, Minus, Plus, MapPin, Tag, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const ShoppingCartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const whatsAppNumber = "27768170495";
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD";

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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:underline">Home</Link> / Cart
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Location, Delivery Info, Cart Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Your Location Card */}
          <Card className="p-4">
            <CardContent className="p-0 flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">Your location</h3>
                <p className="text-muted-foreground">c/o Gauteng, Midrand, 1682</p>
                <p className="text-sm text-blue-500">We need your address to check item availability</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-md">Add address</Button>
            </CardContent>
          </Card>

          {/* Free Delivery Banner */}
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md border border-blue-200 text-blue-700">
            <Truck className="h-5 w-5" />
            <p className="text-sm font-medium">Get free delivery on orders above {formatCurrency(500, currencyCode)}</p>
          </div>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4 shadow-sm">
              <CardContent className="p-0 flex items-center">
                {/* Placeholder for discount badge */}
                {/* <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">Save R400.00</span> */}
                
                <Link to={`/products/${item.id}`} className="flex-shrink-0">
                  <img
                    src={item.image_urls?.[0] || "https://placehold.co/100x100?text=No+Image"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                </Link>
                <div className="flex-grow space-y-1">
                  <Link to={`/products/${item.id}`}>
                    <h2 className="text-base md:text-lg font-semibold hover:underline">{item.name}</h2>
                  </Link>
                  <p className="text-sm md:text-base text-magenta font-bold">{formatCurrency(item.price, currencyCode)}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground hover:text-primary">Remove</Button>
                    {/* <span className="text-muted-foreground">|</span>
                    <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground hover:text-primary">Move to wishlist</Button> */}
                  </div>
                </div>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-none border-y-0 border-l-0"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-12 h-8 text-center border-y-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-none border-y-0 border-r-0"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Column: Coupon, Order Summary */}
        <div className="md:col-span-1 space-y-6">
          {/* Apply Coupon Card */}
          <Card className="p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Tag className="h-5 w-5" />
                <span>Apply coupon</span>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Enter coupon code" className="flex-grow" />
                <Button variant="outline" className="text-magenta hover:text-magenta/80">APPLY</Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="p-4 bg-white text-muted-foreground shadow-sm border border-gray-200">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-poppins font-bold">Price details</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex justify-between text-base">
                <span>Items ({cartItems.length})</span>
                <span>{formatCurrency(cartTotal, currencyCode)}</span>
              </div>
              {/* <div className="flex justify-between text-base text-green-500">
                <span>Promotional Savings</span>
                <span>- {formatCurrency(400, currencyCode)}</span>
              </div> */}
              <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                <span>Sub Total</span>
                <span>{formatCurrency(cartTotal, currencyCode)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Delivery fee</span>
                <span>Delivery fee may be added</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-xl font-poppins font-bold tracking-tight">
                <span>Total amount:</span>
                <span>{formatCurrency(cartTotal, currencyCode)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-4 pt-4 border-t border-gray-200">
                <Info className="h-4 w-4" />
                <p>Get free delivery on orders above {formatCurrency(500, currencyCode)}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <Button className="w-full py-3 text-lg bg-secondary hover:bg-secondary/80" onClick={() => handleWhatsAppAction('checkout')}>
              <MessageSquare className="mr-2 h-5 w-5" /> Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-3 text-lg border-secondary-foreground text-secondary-foreground hover:bg-secondary/80" 
              onClick={() => handleWhatsAppAction('quotation')}
            >
              <FileText className="mr-2 h-5 w-5" /> Request Quotation
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-3 text-lg border-secondary-foreground text-secondary-foreground hover:bg-secondary/80" 
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