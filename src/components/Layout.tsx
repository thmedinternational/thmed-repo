import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton"; // Import the new component

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton /> {/* Add the floating button here */}
    </div>
  );
};

export default Layout;