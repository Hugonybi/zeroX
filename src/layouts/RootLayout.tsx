import { Outlet } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="container mx-auto flex min-h-screen flex-col px-6 pb-16 pt-10 sm:px-10 lg:px-16">
        <SiteHeader />

        <main className="flex-1 py-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
