import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Package, Users, ShoppingCart, BarChart, Store, Receipt, TrendingUp, ShoppingBag, FileText, Settings, LogOut, Image as ImageIcon } from "lucide-react"; // Added ImageIcon
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { toast } from "sonner"; // Import toast for notifications

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const { settings, loading } = useSettings();
  const isActive = (path: string) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.info("You have been logged out.");
      navigate("/login"); // Redirect to login page after logout
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <SidebarTrigger className="md:hidden" /> {/* Only show trigger on mobile */}
            <span className="text-lg font-semibold hidden md:block"> {/* Show generic title on desktop sidebar */}
              {loading ? <Skeleton className="h-5 w-32" /> : 'Admin Panel'}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                <Link to="/admin">
                  <span> {/* Wrapper added */}
                    <Home />
                    <span>Dashboard</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/products")}>
                <Link to="/admin/products">
                  <span> {/* Wrapper added */}
                    <Package />
                    <span>Products</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/purchases")}>
                <Link to="/admin/purchases">
                  <span> {/* Wrapper added */}
                    <ShoppingBag />
                    <span>Purchases</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/customers")}>
                <Link to="/admin/customers">
                  <span> {/* Wrapper added */}
                    <Users />
                    <span>Customers</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/orders")}>
                <Link to="/admin/orders">
                  <span> {/* Wrapper added */}
                    <ShoppingCart />
                    <span>Orders</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/quotations")}>
                <Link to="/admin/quotations">
                  <span> {/* Wrapper added */}
                    <FileText />
                    <span>Quotations</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/receipts")}>
                <Link to="/admin/receipts">
                  <span> {/* Wrapper added */}
                    <Receipt />
                    <span>Receipts</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/profit-loss")}>
                <Link to="/admin/profit-loss">
                  <span> {/* Wrapper added */}
                    <TrendingUp />
                    <span>Profit & Loss</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/analytics")}>
                <Link to="/admin/analytics">
                  <span> {/* Wrapper added */}
                    <BarChart />
                    <span>Analytics</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/banner-settings")}> {/* New navigation item */}
                <Link to="/admin/banner-settings">
                  <span> {/* Wrapper added */}
                    <ImageIcon />
                    <span>Banner Settings</span>
                  </span> {/* Wrapper added */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                  <Link to="/admin/settings">
                    <span> {/* Wrapper added */}
                      <Settings />
                      <span>Settings</span>
                    </span> {/* Wrapper added */}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
           <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <Link to="/">Back to Store</Link>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">Dashboard</h1> {/* Generic Dashboard title */}
          </div>
          <div className="ml-auto flex items-center gap-2"> {/* Logo on the far right */}
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-md" />
            ) : settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Store Logo" 
                style={{ width: settings.logo_width || 32, height: 'auto' }}
                className="max-h-8 object-contain"
              />
            ) : (
              <Store className="size-6" />
            )}
            <span className="text-lg font-semibold hidden md:block"> {/* Store name next to logo on larger screens */}
              {loading ? <Skeleton className="h-5 w-32" /> : settings?.store_name || 'TH-MED International'}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;