"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BannerSection: React.FC = () => {
  return (
    <section className="bg-secondary text-secondary-foreground py-12 md:py-16 px-4 md:px-6 text-center">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h2 className="text-3xl md:text-4xl font-poppins font-bold tracking-tight">
          Need a Custom Solution?
        </h2>
        <p className="text-lg font-montserrat font-light opacity-90">
          Our team is ready to assist you with tailored medical equipment and health product solutions.
          Contact us today for a personalized consultation.
        </p>
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