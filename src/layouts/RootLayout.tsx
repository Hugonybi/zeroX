import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { DevAuthBanner } from "../components/DevAuthBanner";
import { CartSidebar } from "../components/CartSidebar";
import { CartExpirationWarning } from "../components/CartExpirationWarning";

export function RootLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Prevent a flash of the wrong (fallback) font by hiding content
  // until the webfonts declared in CSS have loaded. This uses the
  // Font Loading API when available and falls back to a short timeout.
  useEffect(() => {
    const docEl = document.documentElement;
    docEl.classList.add("fonts-loading");

    const removeLoading = () => {
      docEl.classList.remove("fonts-loading");
      docEl.classList.add("fonts-loaded");
    };

    if (document.fonts && document.fonts.ready) {
      // Wait for fonts to be ready, then remove the loading class.
      document.fonts.ready.then(removeLoading).catch(() => {
        // If something goes wrong, ensure we still remove the class after a timeout.
        setTimeout(removeLoading, 3000);
      });
    } else {
      // Older browsers: remove after a short timeout to avoid permanent hidden UI.
      const t = setTimeout(removeLoading, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-ink">
      <div className="container mx-auto flex min-h-screen flex-col px-6 pb-16 sm:px-1 lg:px-16">
        <SiteHeader onToggleCart={() => setIsCartOpen(!isCartOpen)} />
        
        {/* Cart expiration warning - shows globally when items are expiring */}
        <CartExpirationWarning className="mt-4" />

        <main className="flex-1 py-14">
          <Outlet />
        </main>
      </div>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <DevAuthBanner />
    </div>
  );
}
