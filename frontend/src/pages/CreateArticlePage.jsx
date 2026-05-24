import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [published, setPublished] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setDraft(null);
    setError(null);
    setPublished(null);

    try {
      const res = await fetch(api("/articles/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      setDraft(await res.json());
    } catch (err) {
      setError(err.message || "Failed to generate article.");
    } finally {
      setGenerating(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("title", draft.title);
      form.append("summary", draft.summary);
      form.append("content", draft.content);
      form.append("category", draft.category);
      form.append("topic", topic);
      if (imageFile) {
        form.append("image", imageFile);
      } else {
        form.append("existing_image_url", draft.image_url || "");
      }

      const res = await fetch(api("/articles/publish"), {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Publish failed (${res.status})`);
      const data = await res.json();
      setPublished(data);
      setDraft(null);
    } catch (err) {
      setError(err.message || "Failed to publish article.");
    } finally {
      setPublishing(false);
    }
  };

  const resetAll = () => {
    setTopic("");
    setDraft(null);
    setPublished(null);
    setError(null);
    removeImage();
  };

  return (
    <div className="max-w-3xl">
      <p className="text-secondary text-sm leading-relaxed max-w-lg mb-8">
        Generate an article with AI, optionally upload a cover image, then
        publish when ready.
      </p>

      {/* Step 1 — Topic input */}
      {!draft && !published && (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="topic"
              className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-3"
            >
              Topic Brief
            </label>
            <textarea
              id="topic"
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handleGenerate();
              }}
              placeholder="e.g. The impact of autonomous systems on modern agriculture..."
              className="w-full border border-border rounded-lg px-5 py-4 text-[15px] text-primary leading-relaxed placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20 resize-vertical transition-all bg-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="bg-primary text-white px-8 py-3 text-sm font-medium tracking-wide rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-0"
            >
              {generating ? "Generating..." : "Generate Article"}
            </button>
            <span className="text-[11px] text-muted hidden sm:block">
              Cmd + Enter
            </span>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {generating && (
        <div className="py-16 text-center animate-fade-in">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            <div>
              <p className="text-primary text-sm font-medium">
                Generating your article
              </p>
              <p className="text-muted text-xs mt-1">
                This usually takes 5-10 seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Step 2 — Draft preview + image upload + publish */}
      {draft && !published && (
        <div className="animate-fade-in space-y-6">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Draft generated — review, upload an image, and publish below.
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-3">
              Cover Image (optional)
            </label>
            {imagePreview ? (
              <div className="relative group">
                <div className="overflow-hidden rounded-lg bg-surface aspect-2/1">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer border-0"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg py-10 text-center hover:border-primary/30 hover:bg-surface transition-all cursor-pointer bg-transparent"
              >
                <div className="text-3xl text-muted/40 mb-2">+</div>
                <p className="text-sm text-muted">
                  Click to upload a cover image
                </p>
                <p className="text-[11px] text-muted/60 mt-1">
                  JPG, PNG, WebP up to 10MB
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Draft content */}
          <div className="border-t-2 border-primary pt-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {draft.category}
            </span>
            <h2 className="font-serif text-3xl font-bold leading-tight mt-2 mb-4 text-primary">
              {draft.title}
            </h2>
            <p className="text-secondary text-lg leading-relaxed italic mb-6 pl-5 border-l-[3px] border-primary/20">
              {draft.summary}
            </p>
            <div className="text-secondary text-[15px] leading-[1.9] whitespace-pre-line">
              {draft.content}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-green-700 text-white px-8 py-3 text-sm font-medium tracking-wide rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 cursor-pointer border-0"
            >
              {publishing ? "Publishing..." : "Publish Article"}
            </button>
            <button
              onClick={resetAll}
              className="text-sm text-muted hover:text-primary transition-colors cursor-pointer bg-transparent border-0 underline underline-offset-4"
            >
              Discard & Start Over
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Published success */}
      {published && (
        <div className="animate-fade-in space-y-6">
          <div className="p-5 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-800 text-sm font-medium mb-1">
              Article published successfully!
            </p>
            <p className="text-green-700 text-xs">{published.title}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/article/${published.id}`)}
              className="bg-primary text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer border-0"
            >
              View Article
            </button>
            <button
              onClick={resetAll}
              className="text-sm text-muted hover:text-primary transition-colors cursor-pointer bg-transparent border-0 underline underline-offset-4"
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
