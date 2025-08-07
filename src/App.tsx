import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/pages/LoginPage";
import Dashboard from "@/components/pages/Dashboard";
import StockManagement from "@/components/pages/StockManagement";
import Layout from "@/components/layout/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="sales" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Sales Entry - Coming Soon</h2></div>} />
              <Route path="stocktaking" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Stocktaking - Coming Soon</h2></div>} />
              <Route path="reports" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Reports - Coming Soon</h2></div>} />
              <Route path="analytics" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Analytics - Coming Soon</h2></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
