"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BannerSection: React.FC = () => {
  return (
    <section className="bg-secondary text-secondary-foreground px-4 md:px-6 text-center">
      <div 
        className="container mx-auto max-w-3xl space-y-6 py-12 md:py-16 relative bg-cover bg-center rounded-lg shadow-lg"
        style={{ backgroundImage: `url('/images/summer-banner.png')` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 rounded-lg" /> 
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* The content (button) will be placed here */}
          <Link to="/contact">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;