"use client";

import { Link, NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Instagram, Facebook, Youtube, Search, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "./ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Added import

const fetchCategories = async () => {
  const { data, error } = await supabase.from("products").select("category").distinct("category");
  if (error) throw new Error(error.message);
  return data.map((item) => item.category).filter(Boolean) as string[];
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, loading } = useSettings();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: fetchCategories,
  });

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
        {loading ? <Skeleton className="h-5 w-24" /> : settings?.store_name || 'SueGuard'}
      </span>
    </div>
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    } else {
      navigate('/');
    }
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
    setIsOpen(false);
  };

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
            {/* Shop by Department Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground/60 hover:text-foreground/80">
                  Shop by Department <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {isLoadingCategories ? (
                  <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
                ) : categories?.length ? (
                  categories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => handleCategorySelect(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No departments found</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Other Services Link */}
            <Link to="/about" className={navLinkClass}>
              Other Services
            </Link>
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
                  <span className="font-bold text-xl">{settings?.store_name || 'SueGuard'}</span>
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
                  {/* Mobile Shop by Department */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Shop by Department</h3>
                    {isLoadingCategories ? (
                      <p className="text-muted-foreground">Loading categories...</p>
                    ) : categories?.length ? (
                      categories.map((category) => (
                        <Button
                          key={category}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No departments found</p>
                    )}
                  </div>
                  {/* Mobile Other Services Link */}
                  <Link to="/about" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>
                    Other Services
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
           <div className="md:hidden flex-1">
             <Link to="/" className="flex items-center justify-center space-x-2">
                <span className="font-bold">{settings?.store_name || 'SueGuard'}</span>
              </Link>
           </div>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-8 pr-2 py-1 rounded-md text-sm w-40 md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
          </form>

          {/* Social Media Icons */}
          <a href="https://www.instagram.com/sueguard" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Button>
          </a>
          <a href="https://www.facebook.com/sueguard" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </Button>
          </a>
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