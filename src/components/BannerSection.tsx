"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BannerSection: React.FC = () => {
  return (
    <section className="bg-secondary text-secondary-foreground py-12 md:py-16 px-4 md:px-6 text-center">
      <div className="container mx-auto max-w-3xl space-y-6">
        <img 
          src="/images/summer-banner.png" 
          alt="From Sun Care to Supplements: Everything for a Healthier Summer" 
          className="w-full h-auto object-cover mx-auto rounded-lg shadow-lg"
        />
        <Link to="/contact">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get in Touch
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default BannerSection;