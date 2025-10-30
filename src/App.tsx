import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { AdminPage } from "./pages/AdminPage";
import { ArtistsPage } from "./pages/ArtistsPage";
import { ArtworkDetailPage } from "./pages/ArtworkDetailPage";
import { GalleryPage } from "./pages/GalleryPage";
import { CertificatePage } from "./pages/CertificatePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<RootLayout />}>
          <Route index element={<GalleryPage />} />
          <Route path="artworks/:artworkId" element={<ArtworkDetailPage />} />
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
            path="admin"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminPage />
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
  );
}

export default App;
