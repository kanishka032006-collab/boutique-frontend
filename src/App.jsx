import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SiteLayout from './components/SiteLayout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import { AboutPage, ContactPage, PolicyPage } from './pages/InfoPages';
import { CartPage, CheckoutPage, ForgotPasswordPage, LoginPage, OrdersPage, ProfilePage, RegisterPage, ResetPasswordPage, WishlistPage } from './pages/CustomerPages';
import QuotePage from './pages/QuotePage';
import ReturnGiftsPage from './pages/ReturnGiftsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { AdminCategoriesPage, AdminCustomersPage, AdminDeliveryChargeSettingsPage, AdminMessagesPage, AdminOrdersPage, AdminOverviewPage, AdminProductsPage, AdminQuotationsPage, AdminReportsPage } from './pages/AdminPages';

function AdminGuard({ children }) {
  const { admin } = useAuth();
  const location = useLocation();
  return admin ? children : <Navigate to="/admin/login" state={{ from: location }} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return <>
    <ScrollToTop />
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="collections" element={<ProductsPage />} />
        <Route path="return-gifts" element={<ReturnGiftsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="quote" element={<QuotePage />} />
        <Route path="shipping" element={<PolicyPage type="shipping" />} />
        <Route path="returns" element={<PolicyPage type="returns" />} />
        <Route path="privacy" element={<PolicyPage type="privacy" />} />
        <Route path="terms" element={<PolicyPage type="terms" />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="quotations" element={<AdminQuotationsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="delivery-charge-settings" element={<AdminDeliveryChargeSettingsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
