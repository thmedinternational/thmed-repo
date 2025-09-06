import ProductList from "@/components/ProductList";
import BannerSection from "@/components/BannerSection"; // Import the new banner component

const Index = () => {
  return (
    <div>
      {/* <HeroSlider /> */}
      <BannerSection /> {/* Add the banner section here */}
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight text-magenta">Welcome to TH-MED International</h1>
          <p className="text-lg font-montserrat font-light text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality medical equipment and health products. We are committed to excellence and customer satisfaction.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-poppins font-bold text-center mb-8 text-magenta">Our Products</h2>
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default Index;