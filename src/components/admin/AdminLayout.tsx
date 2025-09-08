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
import { Home, Package, Users, ShoppingCart, BarChart, Store, Receipt, TrendingUp, ShoppingBag, FileText, Settings, GalleryHorizontal, LogOut, Image as ImageIcon, Menu } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import React from "react"; // Import React for Fragment

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loading } = useSettings();
  const isActive = (path: string) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.info("You have been logged out.");
      navigate("/login");
    }
  };

  return (
    <SidebarProvider>

      <Sidebar>
        <React.Fragment> {/* Wrap Sidebar's children in a Fragment */}
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <SidebarTrigger className="md:hidden" asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SidebarTrigger>
              <span className="text-lg font-semibold hidden md:block">
                {loading ? <Skeleton className="h-5 w-32" /> : 'Admin Panel'}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                  <Link to="/admin">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/products")}>
                  <Link to="/admin/products">
                    <Package />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/purchases")}>
                  <Link to="/admin/purchases">
                    <ShoppingBag />
                    <span>Purchases</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/customers")}>
                  <Link to="/admin/customers">
                    <Users />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/orders")}>
                  <Link to="/admin/orders">
                    <ShoppingCart />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/quotations")}>
                  <Link to="/admin/quotations">
                    <FileText />
                    <span>Quotations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/receipts")}>
                  <Link to="/admin/receipts">
                    <Receipt />
                    <span>Receipts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/profit-loss")}>
                  <Link to="/admin/profit-loss">
                    <TrendingUp />
                    <span>Profit & Loss</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/analytics")}>
                  <Link to="/admin/analytics">
                    <BarChart />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <React.Fragment> {/* Wrap SidebarFooter's children in a Fragment */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/hero-settings")}>
                    <Link to="/admin/hero-settings">
                      <GalleryHorizontal />
                      <span>Hero Section</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/banner-cards")}>
                    <Link to="/admin/banner-cards">
                      <ImageIcon />
                      <span>Promo Banners</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                    <Link to="/admin/settings">
                      <Settings />
                      <span>Settings</span>
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
            </React.Fragment>
          </SidebarFooter>
        </React.Fragment>
      </Sidebar>
      <SidebarInset>
        <React.Fragment>
          <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SidebarTrigger>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
              <span className="text-lg font-semibold hidden md:block">
                {loading ? <Skeleton className="h-5 w-32" /> : settings?.store_name || 'TH-MED International'}
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </React.Fragment>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;