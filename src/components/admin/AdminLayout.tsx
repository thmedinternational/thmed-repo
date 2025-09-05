import { Outlet, Link, useLocation } from "react-router-dom";
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
import { Home, Package, Users, ShoppingCart, BarChart, Store, Receipt, TrendingUp, ShoppingBag, FileText, Settings, GalleryHorizontal } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "../ui/skeleton";

const AdminLayout = () => {
  const location = useLocation();
  const { settings, loading } = useSettings();
  const isActive = (path: string) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
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
            <span className="text-lg font-semibold">
              {loading ? <Skeleton className="h-5 w-32" /> : settings?.store_name || 'SueGuard Admin'}
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
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
                <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                  <Link to="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
           <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-600">
              <Link to="/">Back to Store</Link>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">
              {loading ? <Skeleton className="h-5 w-40" /> : settings?.store_name || 'SueGuard Dashboard'}
            </h1>
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