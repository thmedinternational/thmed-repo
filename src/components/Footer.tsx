import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { Facebook, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const Footer = () => {
  const { settings, loading } = useSettings();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        {/* Store Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {loading ? <Skeleton className="h-6 w-32 bg-gray-700" /> : settings?.store_name || 'MyStore'}
          </h3>
          <p className="text-sm text-secondary-foreground/70">
            Your one-stop shop for high-quality products and exceptional service.
          </p>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-secondary-foreground/70 hover:text-primary">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="WhatsApp" className="text-secondary-foreground/70 hover:text-primary">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-secondary-foreground/70 hover:text-primary">Home</Link></li>
            <li><Link to="/about" className="text-secondary-foreground/70 hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="text-secondary-foreground/70 hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Services</h3>
           <ul className="space-y-2 text-sm">
            <li><span className="text-secondary-foreground/70">Product Sales</span></li>
            <li><span className="text-secondary-foreground/70">Customer Support</span></li>
            <li><span className="text-secondary-foreground/70">Order Management</span></li>
          </ul>
        </div>

        {/* Get In Touch */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Get In Touch</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <MapPin size={16} className="mr-2 mt-1 shrink-0" />
              <span className="text-secondary-foreground/70">Regus, Johannesburg South Africa</span>
            </li>
            <li className="flex items-center">
              <Phone size={16} className="mr-2 shrink-0" />
              <span className="text-secondary-foreground/70">+27 76 112 0900</span>
            </li>
             <li className="flex items-center">
              <Phone size={16} className="mr-2 shrink-0" />
              <span className="text-secondary-foreground/70">+27 76 817 0495</span>
            </li>
            <li className="flex items-center">
              <Mail size={16} className="mr-2 shrink-0" />
              <span className="text-secondary-foreground/70">Suzan@sueguard.com</span>
            </li>
             <li className="flex items-center">
              <Mail size={16} className="mr-2 shrink-0" />
              <span className="text-secondary-foreground/70">info@sueguard.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto text-center text-sm mt-12 pt-6 border-t border-gray-700">
        <p>
          Website design by{' '}
          <a
            href="https://www.camsnett.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-primary"
          >
            www.camsnett.com
          </a>
        </p>
        <p className="mt-2">
          © 2025 SueGuard Risk & Management (Pty) Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;