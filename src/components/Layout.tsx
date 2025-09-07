import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import TopBar from "./TopBar"; // Import TopBar
import SubHeader from "./SubHeader"; // Import SubHeader

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopBar /> {/* Add TopBar here */}
      <Header />
      <SubHeader /> {/* Add SubHeader here */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default Layout;