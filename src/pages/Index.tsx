// Update this page (the content is just a fallback if you fail to update the page)

import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to MyStore</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our collection of high-quality products. We are committed to excellence and customer satisfaction.
        </p>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center">Our Products</h2>
        <div className="mt-8 text-center p-4 border rounded-lg bg-secondary">
          <p className="text-muted-foreground">Our product listing is coming soon! We're working on bringing you an amazing selection.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;