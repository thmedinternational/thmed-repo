"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card'; // Import Card components

const BannerSection: React.FC = () => {
  return (
    <section className="bg-background text-foreground px-4 md:px-6 text-center py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: More Ways to Pay */}
        <Card className="relative overflow-hidden rounded-lg shadow-lg flex items-center justify-center min-h-[100px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/images/more-ways-to-pay.png')` }}
          ></div>
          <div className="relative z-10 p-6 text-left text-white flex flex-col justify-center items-start w-full h-full">
            <h3 className="text-2xl font-bold">MORE WAYS TO PAY.</h3>
            <p className="text-sm mt-1 mb-4">Simply swipe your Game mystore credit or pay using any of these payment options.</p>
            <Link to="/contact"> {/* Link to a relevant page, e.g., contact or a payment info page */}
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                LEARN MORE
              </Button>
            </Link>
          </div>
        </Card>

        {/* Card 2: Ready Today! */}
        <Card className="relative overflow-hidden rounded-lg shadow-lg flex items-center justify-center min-h-[100px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/images/ready-today.png')` }}
          ></div>
          <div className="relative z-10 p-6 text-left text-white flex flex-col justify-center items-start w-full h-full">
            <h3 className="text-2xl font-bold">READY TODAY!</h3>
            <p className="text-sm mt-1 mb-4">Order before 11am and Pickup in-store the same day after 2pm.</p>
            <Link to="/contact"> {/* Link to a relevant page, e.g., contact or a pickup info page */}
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                LEARN MORE
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BannerSection;