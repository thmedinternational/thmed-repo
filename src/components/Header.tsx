import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Search, User, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "./ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { Input } from "./ui/input"; // Import Input for the search bar

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { settings, loading } = useSettings();
  const { cartItemCount } = useCart();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-primary/80 ${isActive ? 'text-primary font-semibold' : 'text-foreground/60'}`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 text-lg ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`;

  const StoreLogoAndName = () => (
    <div className="flex items-center space-x-2">
      {loading ? (
        <Skeleton className="h-8 w-8 rounded-md" />
      ) : (
        settings?.logo_url && (
          <img 
            src={settings.logo_url} 
            alt="Store Logo" 
            style={{ width: settings.logo_width || 120, height: 'auto' }}
            className="max-h-8 object-contain"
          />
        )
      )}
      <span className="font-bold text-xl">
        {loading ? <Skeleton className="h-5 w-24" /> : settings?.store_name || 'TH-MED International'}
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left section: Logo and Browse Departments (mobile toggle) */}
        <div className="flex items-center">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="p-4">
                  <Link to="/" className="mb-8 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <StoreLogoAndName />
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>
                      Home
                    </NavLink>
                    <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>
                      About
                    </NavLink>
                    <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>
                      Talk to Us
                    </NavLink>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="flex items-center space-x-2 mr-4">
            <StoreLogoAndName />
          </Link>
          {/* Placeholder for "Browse Departments" dropdown on desktop */}
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-foreground/60 hover:text-foreground">
            <Button variant="ghost" className="flex items-center space-x-1">
              <Menu className="h-5 w-5" />
              <span>Browse Departments</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center section: Search Bar */}
        <div className="flex-1 mx-4 hidden md:flex max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-input focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right section: Services, Sign In, Cart */}
        <div className="flex items-center space-x-2">
          {/* Search icon for mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          {/* Sign In icon for mobile, text for desktop */}
          <Link to="/login" className="hidden md:flex items-center space-x-1 text-foreground/60 hover:text-foreground">
            <User className="h-5 w-5" />
            <span>Sign In</span>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;