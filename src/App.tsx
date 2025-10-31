import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminPage } from "./pages/AdminPage";
import { AdminUserManagementPage } from "./pages/AdminUserManagementPage";
import { AdminMonitoringPage } from "./pages/AdminMonitoringPage";
import { ArtistsPage } from "./pages/ArtistsPage";
import { ArtistProfilePage } from "./pages/ArtistProfilePage";
import { ArtworkDetailPage } from "./pages/ArtworkDetailPage";
import { GalleryPage } from "./pages/GalleryPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CartCheckoutPage } from "./pages/CartCheckoutPage";
import { ConsolidatedOrderStatusPage } from "./pages/ConsolidatedOrderStatusPage";
import { WishlistPage } from "./pages/WishlistPage";
import { CertificatePage } from "./pages/CertificatePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";
import { PurchaseHistoryPage } from "./pages/PurchaseHistoryPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthDebug } from "./components/AuthDebug";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CartProvider } from "./features/cart/CartContext";
import { WishlistProvider } from "./features/wishlist/WishlistContext";
import { CartErrorBoundary } from "./features/cart/CartErrorBoundary";
import { WishlistErrorBoundary } from "./features/wishlist/WishlistErrorBoundary";
import { CartNotificationProvider } from "./features/cart/CartNotifications";
import { WishlistNotificationProvider } from "./features/wishlist/WishlistNotifications";
import { CartExpirationWarning } from "./components/CartExpirationWarning";

function NotFound() {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">404</p>
      <h2 className="font-brand text-3xl uppercase tracking-[0.2em]">Page not found</h2>
      <p className="text-sm text-ink-muted">We could not locate that route. Use the sidebar to get back on track.</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CartNotificationProvider>
        <WishlistNotificationProvider>
          <CartErrorBoundary>
            <WishlistErrorBoundary>
              <CartProvider>
                <WishlistProvider>
                  <BrowserRouter>
                    {/* Debug component - remove in production */}
                    {import.meta.env.DEV && <AuthDebug />}
                    
                    {/* Cart expiration warning */}
                    <CartExpirationWarning />
                    
                    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<RootLayout />}>
          <Route index element={<GalleryPage />} />
          <Route path="artworks/:artworkId" element={<ArtworkDetailPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route 
            path="cart-checkout" 
            element={
              <ProtectedRoute>
                <CartCheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="cart-orders/:sessionId" 
            element={
              <ProtectedRoute>
                <ConsolidatedOrderStatusPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="wishlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          <Route path="artists/:artistId" element={<ArtistProfilePage />} />
          <Route
            path="artists"
            element={
              <ProtectedRoute requiredRoles={['artist']}>
                <ArtistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/*"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminPage />} />
            {/* Admin sub-pages */}
            <Route path="users" element={<AdminUserManagementPage />} />
            <Route path="artworks" element={<div>Artwork Oversight - Coming Soon</div>} />
            <Route path="monitoring" element={<AdminMonitoringPage />} />
            <Route path="system" element={<div>System Health - Coming Soon</div>} />
          </Route>
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <PurchaseHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="certificate/:orderId"
            element={
              <ProtectedRoute>
                <CertificatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<NotFound />}
          />
        </Route>
                    </Routes>
                  </BrowserRouter>
                </WishlistProvider>
              </CartProvider>
            </WishlistErrorBoundary>
          </CartErrorBoundary>
        </WishlistNotificationProvider>
      </CartNotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
