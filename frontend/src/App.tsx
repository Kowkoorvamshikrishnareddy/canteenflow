import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { CartDrawer } from './components/cart/CartDrawer';

// Public Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage, LegalPage } from './pages/auth/LegalPage';

// Student Pages
import { StudentHomePage } from './pages/student/StudentHomePage';
import { StudentMenuPage } from './pages/student/StudentMenuPage';
import { StudentCheckoutPage } from './pages/student/StudentCheckoutPage';
import { StudentOrdersPage } from './pages/student/StudentOrdersPage';
import { StudentOrderDetailsPage } from './pages/student/StudentOrderDetailsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffOrdersPage } from './pages/staff/StaffOrdersPage';
import { StaffPickupPage } from './pages/staff/StaffPickupPage';
import { StaffMenuPage } from './pages/staff/StaffMenuPage';
import { StaffInventoryPage } from './pages/staff/StaffInventoryPage';
import { StaffReportsPage } from './pages/staff/StaffReportsPage';
import { StaffSettingsPage } from './pages/staff/StaffSettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCanteensPage } from './pages/admin/AdminCanteensPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-canvas-warm flex flex-col antialiased selection:bg-brand-blue/20">
              {/* Top Persona Switcher Header */}
              <DemoModeBanner />

              {/* White Liquid Glass Navbar */}
              <Navbar />

              {/* Global Slide-Over Cart Drawer */}
              <CartDrawer />

              {/* Main Content Area */}
              <main className="flex-1 pb-16 md:pb-8">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />

                  {/* Student routes */}
                  <Route path="/student/home" element={<StudentHomePage />} />
                  <Route path="/student/menu" element={<StudentMenuPage />} />
                  <Route path="/student/checkout" element={<StudentCheckoutPage />} />
                  <Route path="/student/orders" element={<StudentOrdersPage />} />
                  <Route path="/student/orders/:id" element={<StudentOrderDetailsPage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />

                  {/* Staff routes */}
                  <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
                  <Route path="/staff/orders" element={<StaffOrdersPage />} />
                  <Route path="/staff/pickup" element={<StaffPickupPage />} />
                  <Route path="/staff/menu" element={<StaffMenuPage />} />
                  <Route path="/staff/inventory" element={<StaffInventoryPage />} />
                  <Route path="/staff/reports" element={<StaffReportsPage />} />
                  <Route path="/staff/settings" element={<StaffSettingsPage />} />

                  {/* Admin routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/canteens" element={<AdminCanteensPage />} />
                  <Route path="/admin/audit" element={<AdminAuditPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Mobile Student Navigation */}
              <MobileNav />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
