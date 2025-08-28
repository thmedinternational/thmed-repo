import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "./ui/skeleton";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { settings, loading } = useSettings();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 text-lg ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`;

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
      <span className="font-bold">
        {loading ? <Skeleton className="h-5 w-24" /> : settings?.store_name || 'MyStore'}
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <StoreLogoAndName />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Talk to Us
            </NavLink>
          </nav>
        </div>

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
                  <span className="font-bold text-xl">{settings?.store_name || 'MyStore'}</span>
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

        <div className="flex flex-1 items-center justify-end space-x-2">
           <div className="md:hidden flex-1">
             <Link to="/" className="flex items-center justify-center space-x-2">
                <span className="font-bold">{settings?.store_name || 'MyStore'}</span>
              </Link>
           </div>
          <Link to="/cart"> {/* Added Link here */}
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;