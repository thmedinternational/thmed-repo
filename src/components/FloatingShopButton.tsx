import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface FloatingShopButtonProps {
  onClick: () => void;
}

const FloatingShopButton: React.FC<FloatingShopButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 left-6 z-50 rounded-full p-4 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-subtle"
      size="icon"
      aria-label="Shop by Category"
    >
      <ShoppingBag className="h-6 w-6" />
    </Button>
  );
};

export default FloatingShopButton;