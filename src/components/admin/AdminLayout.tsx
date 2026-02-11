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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Package, Users, ShoppingCart, BarChart, Store, Receipt, TrendingUp, ShoppingBag, FileText, Settings, GalleryHorizontal, LogOut, FileSpreadsheet, ChevronRight } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";

// Define Category type
type Category = {
  id: string;
  name: string;
};

// Fetch categories from Supabase
const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loading } = useSettings();
  const isActive = (path: string) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories_sidebar"],
    queryFn: fetchCategories,
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.info("You have been logged out.");
      navigate("/login");
    }
  };

  const isProductsActive = location.pathname.startsWith("/admin/products");

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
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <Collapsible asChild defaultOpen={isProductsActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Products" isActive={isProductsActive}>
                    <Package />
                    <span>Products</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={location.pathname === "/admin/products" && !location.search}>
                        <Link to="/admin/products">
                          <span>All Products</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {categories?.map((category) => (
                      <SidebarMenuSubItem key={category.id}>
                        <SidebarMenuSubButton asChild isActive={location.search.includes(`category=${category.id}`)}>
                          <Link to={`/admin/products?category=${category.id}`}>
                            <span>{category.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

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
              <SidebarMenuButton asChild isActive={isActive("/admin/employees")}>
                <Link to="/admin/employees">
                  <Users />
                  <span>Employees</span>
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
              <SidebarMenuButton asChild isActive={isActive("/admin/payslips")}>
                <Link to="/admin/payslips">
                  <FileSpreadsheet />
                  <span>Payslips</span>
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
                className="object-contain"
              />
            ) : (
              <Store className="size-6" />
            )}
            {loading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              settings?.show_store_name && ( // Conditionally display store name
                <span className="text-lg font-semibold hidden md:block">
                  {settings?.store_name || 'TH-MED International'}
                </span>
              )
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;