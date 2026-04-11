import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import AdminLayout from "./layouts/AdminLayout";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const POSCheckoutPage = lazy(() => import("./pages/pos/POSCheckoutPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const SalesHistoryPage = lazy(() => import("./pages/admin/SalesHistoryPage"));
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const BrandsPage = lazy(() => import("./pages/admin/BrandsPage"));

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");
  
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/pos"} replace />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* POS Routes - Cashier & Admin */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={["cashier", "admin"]}>
              <POSCheckoutPage />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <ProductsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales-history"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <SalesHistoryPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <InventoryPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <CategoriesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <BrandsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
