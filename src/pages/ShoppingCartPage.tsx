import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const ShoppingCartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">
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
      <h1 className="text-4xl font-bold tracking-tight mb-8 text-center">Your Shopping Cart</h1>

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
                  <h2 className="text-xl font-semibold hover:underline">{item.name}</h2>
                </Link>
                <p className="text-muted-foreground">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
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

        <div className="md:col-span-1 bg-secondary p-6 rounded-lg shadow-md sticky top-20">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between text-lg font-medium mb-2">
            <span>Subtotal:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-medium mb-4">
            <span>Shipping:</span>
            <span>Free</span> {/* For now, assuming free shipping */}
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <Button className="w-full mt-6 py-3 text-lg">Proceed to Checkout</Button>
          <Button variant="outline" className="w-full mt-3" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;