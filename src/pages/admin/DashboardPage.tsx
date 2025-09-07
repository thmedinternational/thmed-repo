import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Package, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Function to fetch the count of products
const fetchProductsCount = async () => {
  const { count, error } = await supabase.from("products").select("*", { count: "exact" });
  if (error) throw new Error(error.message);
  return count;
};

// Function to fetch the count of users
const fetchUsersCount = async () => {
  const { count, error } = await supabase.from("auth.users").select("*", { count: "exact" });
  if (error) throw new Error(error.message);
  return count;
};

const DashboardPage = () => {
  const { data: productsCount, isLoading: isLoadingProducts } = useQuery<number>({
    queryKey: ["productsCount"],
    queryFn: fetchProductsCount,
  });

  const { data: usersCount, isLoading: isLoadingUsers } = useQuery<number>({
    queryKey: ["usersCount"],
    queryFn: fetchUsersCount,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome to your Store Manager</CardTitle>
          <CardDescription>
            Here you can manage your products, customers, orders, and view analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Select an option from the sidebar to get started.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{productsCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{usersCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">All systems are online.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;