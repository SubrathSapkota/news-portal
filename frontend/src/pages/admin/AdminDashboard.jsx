import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles/?limit=50")
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = articles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
            Total Articles
          </p>
          <p className="text-3xl font-bold text-primary">
            {loading ? "—" : articles.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
            Categories
          </p>
          <p className="text-3xl font-bold text-primary">
            {loading ? "—" : Object.keys(categoryCounts).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
            This Week
          </p>
          <p className="text-3xl font-bold text-primary">
            {loading
              ? "—"
              : articles.filter(
                  (a) =>
                    new Date(a.created_at) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
            AI Model
          </p>
          <p className="text-lg font-bold text-primary mt-1">Llama 3.3 70B</p>
        </div>
      </div>

      {/* Quick action */}
      <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">
            Generate a New Article
          </h3>
          <p className="text-sm text-muted">
            Use AI to create publication-ready content in seconds.
          </p>
        </div>
        <Link
          to="/admin/create"
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary transition-colors no-underline"
        >
          Create Article
        </Link>
      </div>

      {/* Recent articles */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-primary">
            Recent Articles
          </h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-muted text-sm">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm">
            No articles yet.{" "}
            <Link
              to="/admin/create"
              className="text-primary underline underline-offset-4"
            >
              Create your first one
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {articles.slice(0, 10).map((article, i) => (
              <div
                key={article.id || i}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {article.title}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {article.category} &middot;{" "}
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/article/${article.id}`}
                  className="shrink-0 text-[12px] text-muted hover:text-primary transition-colors no-underline"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
