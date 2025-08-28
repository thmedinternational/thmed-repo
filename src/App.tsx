import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CustomersPage from "./pages/admin/CustomersPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ReceiptsPage from "./pages/admin/ReceiptsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ProfitLossPage from "./pages/admin/ProfitLossPage";
import PurchasesPage from "./pages/admin/PurchasesPage";
import QuotationsPage from "./pages/admin/QuotationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import HeroSettingsPage from "./pages/admin/HeroSettingsPage";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<ShoppingCartPage />} />
                </Route>

                {/* Auth Route */}
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="purchases" element={<PurchasesPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="quotations" element={<QuotationsPage />} />
                    <Route path="receipts" element={<ReceiptsPage />} />
                    <Route path="profit-loss" element={<ProfitLossPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="hero-settings" element={<HeroSettingsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;