import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // ✅ import
import DashboardLayout from "@/components/dashboard_layout";

import InventoryOverview from '@/pages/inventorystock.jsx';
import Signup from "@/pages/login_signup.jsx";
import Landing from "@/pages/landing_page.jsx";
import Home from "@/pages/home_page.jsx";
import MainDashboard from "@/pages/dashboard";
import Product from "@/pages/product_page.jsx";
import BrandPage from "@/pages/brand_page";
import CategoryPage from "@/pages/category_page";
import UnitPage from "@/pages/unit_page";
import StaffStockRequestPage from "@/pages/stock_transfer/staff_stock_transfer_page";
import OwnerPendingTransactionsPage from "@/pages/stock_transfer/owner_stock_transfer";
import StaffManagementPage from "@/pages/staff_management_page";
import SellersPage from '@/pages/sellerpage.jsx';
import BuyersPage from '@/pages/buyerspage.jsx';
import SendPurchaseOrder from '@/pages/purchase_order.jsx';
import ReportsDashboard from '@/pages/report_dashboard.jsx';
import TransactionsPage from '@/pages/transaction_history_page.jsx';
import ForecastDashboard from "@/pages/forecasting_page";
import  Warehouse  from "@/pages/Warehouse_page.jsx";
import  Attributes  from "@/pages/Attributemanagement_page.jsx";

import { Toaster } from 'react-hot-toast';

import SubscriptionPlansPage from '@/pages/subscription/SubscriptionPage.jsx';
import CurrentSubscriptionPage from '@/pages/subscription/CurrentSubscriptionPage.jsx';
import UsageDashboardPage from '@/pages/subscription/UsageDashboardPage.jsx';
// ============================================================================
// ✅ PROTECTED ROUTE — now uses context instead of localStorage directly
// allowedRoles optional — pass ["OWNER"] or ["STAFF"] to restrict access
// ============================================================================
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  // Wait for context to finish reading localStorage on first load
  // Prevents brief flash of redirect before session is restored
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → send to login page
  if (!user) {
    return <Navigate to="/login_signup" replace />;
  }

  // Role check — if page requires specific role and user doesn't have it
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// ============================================================================
// MAIN APP ROUTES
// ============================================================================
function AppRoutes() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login_signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        {/* PROTECTED — any logged in user */}
        <Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/product" element={<ProtectedRoute><Product /></ProtectedRoute>} />
        <Route path="/inventory-overview"element={<ProtectedRoute><InventoryOverview /></ProtectedRoute>}/>


        {/* OWNER ONLY */}
        <Route path="/brand" element={<ProtectedRoute allowedRoles={["OWNER"]}><BrandPage /></ProtectedRoute>} />
        <Route path="/category" element={<ProtectedRoute allowedRoles={["OWNER"]}><CategoryPage /></ProtectedRoute>} />
        <Route path="/unit" element={<ProtectedRoute allowedRoles={["OWNER"]}><UnitPage /></ProtectedRoute>} />
        <Route path="/owner_stocktransfer" element={<ProtectedRoute allowedRoles={["OWNER"]}><OwnerPendingTransactionsPage /></ProtectedRoute>} />
        <Route path="/staff_management" element={<ProtectedRoute allowedRoles={["OWNER"]}><StaffManagementPage /></ProtectedRoute>} />
        <Route path="/Warehouse_management" element={<ProtectedRoute allowedRoles={["OWNER"]}><Warehouse /></ProtectedRoute>} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <ReportsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attributes"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <Attributes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forecasting"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <ForecastDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouse"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <Warehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <SendPurchaseOrder />
            </ProtectedRoute>
          }
        />
        


        {/* STAFF ONLY */}
        <Route path="/staff_stocktransfer" element={<ProtectedRoute allowedRoles={["STAFF"]}><StaffStockRequestPage /></ProtectedRoute>} />
        <Route
          path="/sellers"
          element={
            <ProtectedRoute allowedRoles={["OWNER","STAFF"]}>
              <SellersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyers"
          element={
            <ProtectedRoute allowedRoles={["OWNER","STAFF"]}>
              <BuyersPage />
            </ProtectedRoute>
          }
        />

          {/* Subscription Routes */}
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPlansPage /></ProtectedRoute>} />
        <Route path="/subscription/current" element={<ProtectedRoute><CurrentSubscriptionPage /></ProtectedRoute>} />
        <Route path="/subscription/usage" element={<ProtectedRoute><UsageDashboardPage /></ProtectedRoute>} />



        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;