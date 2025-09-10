import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ShopCategoriesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const fetchAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const ShopCategoriesPanel: React.FC<ShopCategoriesPanelProps> = ({ isOpen, onClose }) => {
  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["allCategories"],
    queryFn: fetchAllCategories,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="text-2xl font-poppins font-bold text-magenta">Shop</SheetTitle>
          <SheetDescription>
            Explore our products by category or get in touch.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col py-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Shop by Category</h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : isError || !categories || categories.length === 0 ? (
              <p className="text-muted-foreground">No categories available.</p>
            ) : (
              <nav className="flex flex-col space-y-2">
                {categories.map((category) => (
                  <Button key={category.id} variant="ghost" className="justify-start px-2" asChild>
                    <Link to={`/categories/${category.id}`} onClick={onClose}>
                      {category.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Need Help?</h3>
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start px-2" asChild>
                <Link to="/contact" onClick={onClose}>
                  <Mail className="mr-2 h-4 w-4" /> Contact Us
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start px-2" asChild>
                <a href="tel:+263775224209" onClick={onClose}>
                  <Phone className="mr-2 h-4 w-4" /> Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopCategoriesPanel;