import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const WhatsAppFloatingButton: React.FC = () => {
  const openWhatsApp = () => {
    const phoneNumber = "27761120900"; // Your specified WhatsApp number
    const message = "Hello! I'm interested in your products.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg bg-[#25D366] hover:bg-[#1DAE52] text-white"
      size="icon"
      aria-label="Chat on WhatsApp"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};

export default WhatsAppFloatingButton;