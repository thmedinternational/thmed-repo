import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { Facebook, Phone, Mail, MapPin, MessageCircle, Instagram } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const Footer = () => {
  const { settings, loading } = useSettings();

  // This component is no longer used in the footer, but kept for reference if needed elsewhere.
  const StoreLogoAndName = () => (
    <div className="flex items-center space-x-2">
      {loading ? (
        <Skeleton className="h-5 w-24 bg-gray-500" />
      ) : (
        settings?.show_store_name && (
          <span className="font-bold text-white">
            {settings?.store_name || 'TH-MED International'}
          </span>
        )
      )}
    </div>
  );

  const StoreNameTitle = () => (
    <div className="flex items-center space-x-2">
      {loading ? (
        <Skeleton className="h-6 w-48 bg-gray-500" />
      ) : (
        <span className="font-bold text-xl text-foreground"> {/* Applied text-xl and text-foreground for title styling */}
          TH-MED International
        </span>
      )}
    </div>
  );

  return (
    <footer className="mt-auto">
      {/* Top Bar */}
      <div className="bg-foreground text-background py-3">
        <div className="container mx-auto flex items-center justify-end space-x-4">
          <a href="https://www.instagram.com/thmedinternational" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-primary">
            <Instagram size={20} />
          </a>
          <a href="https://www.facebook.com/thmedinternational" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-primary">
            <Facebook size={20} />
          </a>
          <a href="https://wa.me/27768170495" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white hover:text-primary">
            <MessageCircle size={20} />
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {/* Store Info */}
          <div className="space-y-0">
            <Link to="/" className="flex items-center space-x-2 mb-0 py-0">
              <StoreNameTitle /> {/* Using the new StoreNameTitle component */}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mt-0">
              Your trusted partner for high-quality medical and health products.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-magenta">Quick Links</h3>
            <ul className="space-y-0.5 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Talk to Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-magenta">Services</h3>
            <ul className="space-y-0.5 text-sm">
              <li><span className="text-muted-foreground">Medical Equipment Sales</span></li>
              <li><span className="text-muted-foreground">Health Product Distribution</span></li>
              <li><span className="text-muted-foreground">Customer Support</span></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-magenta">Get In Touch</h3>
            <ul className="space-y-0.5 text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 shrink-0" />
                <span className="text-muted-foreground">cs07-cs08 Sunshine bazaar complex simon mazorodze Harare</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 shrink-0" />
                <span className="text-muted-foreground">+263 775 224 209</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 shrink-0" />
                <span className="text-muted-foreground">info@thmed.store</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-muted text-muted-foreground text-center text-sm py-4 border-t border-gray-300">
        <p className="mt-2">
          © 2025 TH-MED International. All rights reserved.
        </p>
        <p className="mt-1">
          Designed by <a href="https://camsnett.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">camsnett.com</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;