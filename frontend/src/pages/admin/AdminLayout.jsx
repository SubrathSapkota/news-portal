import { Outlet, Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: "◫" },
  { path: "/admin/create", label: "Create Article", icon: "✎" },
  { path: "/admin/ads", label: "Advertisements", icon: "▣" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/admin" className="no-underline">
            <h2 className="font-serif text-xl font-bold text-white leading-tight">
              The AI News
            </h2>
          </Link>
          <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors no-underline ${
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors no-underline"
          >
            <span>←</span>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-primary">
            {NAV_ITEMS.find(
              (i) =>
                i.path === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(i.path)
            )?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>

        <footer className="px-8 py-4 text-[11px] text-muted border-t border-border bg-white">
          &copy; {new Date().getFullYear()} The AI News — Admin Panel
        </footer>
      </div>
    </div>
  );
}
