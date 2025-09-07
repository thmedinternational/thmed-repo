import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  console.log("ProtectedRoute: Rendered with session:", session, "loading:", loading);

  if (loading) {
    console.log("ProtectedRoute: Showing loading skeleton.");
    return (
       <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
       </div>
    );
  }

  if (!session) {
    console.log("ProtectedRoute: No session found, navigating to /login.");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Session found, rendering Outlet.");
  return <Outlet />;
};

export default ProtectedRoute;