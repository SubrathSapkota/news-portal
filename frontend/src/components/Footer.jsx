import { Link } from "react-router-dom";

const CATEGORIES = [
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

const COMPANY_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="no-underline">
              <h3 className="font-serif text-2xl font-bold text-white mb-3">
                The AI News
              </h3>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              Intelligent reporting powered by artificial intelligence.
              Delivering accurate, timely news with automated insight.
            </p>
            <div className="flex gap-4">
              {["Twitter", "Facebook", "LinkedIn", "RSS"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-[11px] text-white/70 no-underline"
                  title={platform}
                >
                  {platform[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
              Sections
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    className="text-sm text-white/60 hover:text-white transition-colors no-underline"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
              Company
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Subscribe to our daily briefing and never miss a story.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 text-sm border border-white/15 rounded-lg bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <button className="w-full px-4 py-2.5 text-sm font-medium bg-white text-primary rounded-lg hover:bg-white/90 transition-colors cursor-pointer border-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-white/40 tracking-wider">
            &copy; {new Date().getFullYear()} The AI News. All rights reserved.
          </p>
          <p className="text-[11px] text-white/30 tracking-wider">
            Powered by AI &middot; Built with integrity
          </p>
        </div>
      </div>
    </footer>
  );
}
