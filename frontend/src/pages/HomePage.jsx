import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdPlaceholder from "../components/AdPlaceholder";

const CATEGORIES = [
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

const TRENDING = [
  "AI Regulation Debate Intensifies",
  "Space Tourism Industry Expands",
  "Global Chip Shortage Easing",
  "Renewable Energy Records Broken",
  "Digital Currency Adoption Grows",
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(content) {
  const words = (content || "").split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get("category") || "All";

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/articles/");
      if (!res.ok) throw new Error(`Failed to load articles (${res.status})`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    currentCategory === "All"
      ? articles
      : articles.filter((a) => a.category === currentCategory);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-muted text-sm mt-4">Loading articles...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="py-20 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchArticles}
              className="text-sm text-primary underline underline-offset-4 cursor-pointer bg-transparent border-0"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl text-primary mb-2">
              {articles.length === 0
                ? "No articles yet"
                : "No articles in this category"}
            </p>
            <p className="text-muted text-sm">
              {articles.length === 0
                ? "Articles will appear here once created via the admin panel."
                : "Try selecting a different category above."}
            </p>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Hero article */}
            {hero && (
              <Link
                to={`/article/${hero.id}`}
                className="block no-underline mb-10 animate-fade-in"
              >
                <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center group">
                  <div className="overflow-hidden rounded-lg bg-surface aspect-3/2">
                    <img
                      src={hero.image_url || DEFAULT_IMAGE}
                      alt={hero.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {hero.category}
                    </span>
                    <h2 className="font-serif text-3xl lg:text-4xl font-bold leading-tight mt-2 mb-4 text-primary group-hover:underline decoration-1 underline-offset-4">
                      {hero.title}
                    </h2>
                    <p className="text-secondary text-base leading-relaxed mb-4">
                      {hero.summary}
                    </p>
                    <div className="flex items-center gap-3 text-[12px] text-muted">
                      <span>{formatDate(hero.created_at)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted" />
                      <span>{estimateReadTime(hero.content)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Leaderboard ad between hero and grid */}
            <AdPlaceholder
              variant="leaderboard"
              className="mb-8"
            />

            {/* Divider */}
            <div className="border-t-2 border-primary mb-8" />

            {/* Articles grid + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {rest.map((article, idx) => (
                    <Link
                      key={article.id || `${article.title}-${idx}`}
                      to={`/article/${article.id}`}
                      className="block no-underline"
                    >
                      <article
                        className="group animate-fade-in"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className="overflow-hidden rounded-lg bg-surface aspect-16/10 mb-4">
                          <img
                            src={article.image_url || DEFAULT_IMAGE}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          {article.category}
                        </span>
                        <h3 className="font-serif text-xl font-bold leading-snug mt-1.5 mb-2 text-primary group-hover:underline decoration-1 underline-offset-4">
                          {article.title}
                        </h3>
                        <p className="text-secondary text-sm leading-relaxed mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted">
                          <span>{formatDate(article.created_at)}</span>
                          <span className="w-1 h-1 rounded-full bg-muted" />
                          <span>{estimateReadTime(article.content)}</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Mid-content ad after every 4 articles */}
                {rest.length > 4 && (
                  <AdPlaceholder
                    variant="leaderboard"
                    className="mt-8"
                  />
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-16 space-y-8">
                  {/* Sidebar ad */}
                  <AdPlaceholder variant="sidebar" />

                  {/* Trending */}
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-5 pb-3 border-b-2 border-primary">
                      Trending
                    </h3>
                    <ol className="list-none p-0 m-0 space-y-5">
                      {TRENDING.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-4 items-start group cursor-pointer"
                        >
                          <span className="font-serif text-3xl font-bold text-border-dark leading-none">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm text-primary font-medium leading-snug pt-1 group-hover:underline decoration-1 underline-offset-4">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Newsletter CTA */}
                  <div className="p-5 bg-warm rounded-lg border border-border">
                    <h4 className="font-serif text-lg font-bold text-primary mb-1">
                      Stay Informed
                    </h4>
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      Get the best AI-curated news delivered to your inbox.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="flex-1 px-3 py-2 text-xs border border-border rounded bg-white focus:outline-none focus:border-primary/30"
                      />
                      <button className="px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-secondary transition-colors cursor-pointer border-0">
                        Subscribe
                      </button>
                    </div>
                  </div>

                  {/* Second sidebar ad */}
                  <AdPlaceholder variant="sidebar-small" />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
