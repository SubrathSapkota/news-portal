import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdPlaceholder from "../components/AdPlaceholder";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(content) {
  const words = (content || "").split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticle();
  }, [id]);

  async function fetchArticle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error(`Article not found (${res.status})`);
      const data = await res.json();
      setArticle(data);

      const relRes = await fetch(
        `/api/articles/?category=${encodeURIComponent(data.category)}&limit=4`
      );
      if (relRes.ok) {
        const relData = await relRes.json();
        setRelated(relData.filter((a) => a.id !== id).slice(0, 3));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-muted text-sm mt-4">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-primary mb-2">
          Article not found
        </p>
        <p className="text-muted text-sm mb-6">
          {error || "This article may have been removed."}
        </p>
        <Link
          to="/"
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const paragraphs = article.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-[12px] text-muted">
          <Link
            to="/"
            className="hover:text-primary transition-colors no-underline text-muted"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-primary">{article.category}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main article */}
          <article>
            <div className="mb-5">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-white bg-primary px-3 py-1 rounded-full">
                {article.category}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight text-primary mb-5">
              {article.title}
            </h1>

            <p className="text-secondary text-lg lg:text-xl leading-relaxed mb-6 font-serif italic">
              {article.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted pb-6 mb-8 border-b border-border">
              <span>{formatDate(article.created_at)}</span>
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span>{estimateReadTime(article.content)}</span>
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span>AI Generated</span>
            </div>

            {/* Hero image */}
            <div className="overflow-hidden rounded-xl bg-surface aspect-2/1 mb-10">
              <img
                src={article.image_url || DEFAULT_IMAGE}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article body with mid-article ad */}
            <div className="text-secondary text-[16px] leading-[1.85] font-light">
              {paragraphs.map((para, idx) => (
                <div key={idx}>
                  <p className="mb-6">{para}</p>
                  {idx === Math.floor(paragraphs.length / 2) - 1 &&
                    paragraphs.length > 2 && (
                      <AdPlaceholder
                        variant="mid-article"
                        className="my-8"
                      />
                    )}
                </div>
              ))}
            </div>

            {/* Tags / share bar */}
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted uppercase tracking-wider">
                  Tags:
                </span>
                <span className="text-[12px] px-3 py-1 bg-surface rounded-full text-secondary">
                  {article.category}
                </span>
                <span className="text-[12px] px-3 py-1 bg-surface rounded-full text-secondary">
                  AI News
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted uppercase tracking-wider">
                  Share:
                </span>
                {["Twitter", "Facebook", "LinkedIn"].map((s) => (
                  <button
                    key={s}
                    className="text-[12px] text-muted hover:text-primary transition-colors bg-transparent border-0 cursor-pointer underline underline-offset-4"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-8">
              <AdPlaceholder variant="sidebar" />

              {/* Related articles */}
              {related.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-5 pb-3 border-b-2 border-primary">
                    Related Stories
                  </h3>
                  <div className="space-y-5">
                    {related.map((rel, i) => (
                      <Link
                        key={rel.id || i}
                        to={`/article/${rel.id}`}
                        className="group block no-underline"
                      >
                        <div className="overflow-hidden rounded-lg bg-surface aspect-16/10 mb-2">
                          <img
                            src={rel.image_url || DEFAULT_IMAGE}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h4 className="font-serif text-sm font-bold text-primary leading-snug group-hover:underline decoration-1 underline-offset-4">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-muted mt-1">
                          {formatDate(rel.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="p-5 bg-warm rounded-lg border border-border">
                <h4 className="font-serif text-lg font-bold text-primary mb-1">
                  Stay Informed
                </h4>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Get the best AI-curated news delivered to your inbox every
                  morning.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 text-xs border border-border rounded bg-white focus:outline-none focus:border-primary/30"
                  />
                  <button className="px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-secondary transition-colors cursor-pointer border-0">
                    Go
                  </button>
                </div>
              </div>

              <AdPlaceholder variant="sidebar-small" />
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom banner ad */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <AdPlaceholder variant="banner" />
      </div>
    </div>
  );
}
