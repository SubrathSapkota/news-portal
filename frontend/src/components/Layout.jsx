import { Outlet, Link, useSearchParams } from "react-router-dom";
import Footer from "./Footer";

const NAV_CATEGORIES = [
  "All",
  "World",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Arts",
  "Opinion",
];

export default function Layout() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top thin bar */}
      <div className="bg-primary text-white text-[11px] tracking-wide">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center">
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="opacity-70">AI-Powered Journalism</span>
        </div>
      </div>

      {/* Main header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <Link to="/" className="no-underline">
            <h1 className="font-serif text-5xl font-bold tracking-tight text-primary m-0 leading-none">
              {/* The AI News */}
              {/* The Gen Wire */}
              {/* The Valley Post */}
              {/* New Gen News */}
              {/* The GEN-Z Post */}
              {/* The Young Post */}
              The New Wave
              {/* The Kathmandu Wire */}
            </h1>
          </Link>
          <p className="text-[11px] text-muted tracking-[0.3em] uppercase mt-2 mb-0">
            Intelligent Reporting &middot; Automated Insight
          </p>
        </div>

        {/* Single category navigation */}
        <div className="border-t border-border">
          <nav className="max-w-7xl mx-auto px-6 flex justify-center gap-8 text-[13px] font-medium tracking-wide uppercase overflow-x-auto no-scrollbar">
            {NAV_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const to = cat === "All" ? "/" : `/?category=${cat}`;
              return (
                <Link
                  key={cat}
                  to={to}
                  className={`no-underline py-3 border-b-2 transition-colors shrink-0 ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
