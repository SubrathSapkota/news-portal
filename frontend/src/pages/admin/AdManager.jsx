import { useState, useEffect, useRef } from "react";

const SIZE_OPTIONS = [
  { value: "leaderboard", label: "Leaderboard (728 x 90)", w: 728, h: 90 },
  { value: "sidebar", label: "Sidebar (300 x 250)", w: 300, h: 250 },
];

export default function AdManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formSize, setFormSize] = useState("leaderboard");
  const [formText, setFormText] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const fileRef = useRef(null);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/");
      if (res.ok) setAds(await res.json());
    } catch (_) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFormPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormSize("leaderboard");
    setFormText("");
    setFormLink("");
    setFormImage(null);
    setFormPreview(null);
    setShowForm(false);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCreate = async () => {
    if (!formImage) {
      setError("Please select an image.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("size", formSize);
      form.append("overlay_text", formText);
      form.append("link_url", formLink);
      form.append("image", formImage);

      const res = await fetch("/api/ads/", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      resetForm();
      await fetchAds();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    const form = new FormData();
    form.append("is_active", (!ad.is_active).toString());
    await fetch(`/api/ads/${ad.id}`, { method: "PUT", body: form });
    await fetchAds();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this ad?")) return;
    await fetch(`/api/ads/${id}`, { method: "DELETE" });
    await fetchAds();
  };

  const startEdit = (ad) => {
    setEditId(ad.id);
    setEditText(ad.overlay_text);
    setEditLink(ad.link_url);
  };

  const saveEdit = async () => {
    setEditSaving(true);
    try {
      const form = new FormData();
      form.append("overlay_text", editText);
      form.append("link_url", editLink);
      await fetch(`/api/ads/${editId}`, { method: "PUT", body: form });
      setEditId(null);
      await fetchAds();
    } finally {
      setEditSaving(false);
    }
  };

  const sizeConf = SIZE_OPTIONS.find((s) => s.value === formSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            Manage banner and sidebar advertisements. Two sizes available.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer border-0"
          >
            + New Ad
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-primary">
            Create New Advertisement
          </h3>

          {/* Size selector */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              Ad Size
            </label>
            <div className="flex gap-3">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormSize(opt.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                    formSize === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-secondary hover:border-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              Ad Image
            </label>
            {formPreview ? (
              <div className="relative inline-block">
                <div
                  className="relative overflow-hidden rounded-lg border border-border bg-surface"
                  style={{
                    width: Math.min(sizeConf.w, 600),
                    aspectRatio: `${sizeConf.w}/${sizeConf.h}`,
                  }}
                >
                  <img
                    src={formPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {formText && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <p className="text-white font-bold text-lg px-4 text-center drop-shadow-lg">
                        {formText}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFormImage(null);
                    setFormPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center cursor-pointer border-0 hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg py-8 px-12 text-center hover:border-primary/30 hover:bg-surface transition-all cursor-pointer bg-transparent"
              >
                <p className="text-sm text-muted">Click to upload image</p>
                <p className="text-[11px] text-muted/60 mt-1">
                  Recommended: {sizeConf.w} x {sizeConf.h}px
                </p>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Overlay text */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              Overlay Text (optional)
            </label>
            <input
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="e.g. Shop the Summer Collection"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20 bg-white"
            />
            <p className="text-[11px] text-muted mt-1.5">
              This text appears centered over the image.
            </p>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              Click-Through URL (optional)
            </label>
            <input
              value={formLink}
              onChange={(e) => setFormLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20 bg-white"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-6 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 cursor-pointer border-0"
            >
              {saving ? "Uploading..." : "Create Ad"}
            </button>
            <button
              onClick={resetForm}
              className="text-sm text-muted hover:text-primary transition-colors cursor-pointer bg-transparent border-0 underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing ads list */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">
            All Advertisements
          </h3>
          <span className="text-[11px] text-muted">
            {ads.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            No ads yet. Click &quot;+ New Ad&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ads.map((ad) => (
              <div key={ad.id} className="p-5 hover:bg-surface/50 transition-colors">
                <div className="flex gap-5 items-start">
                  {/* Ad preview */}
                  <div
                    className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
                    style={{
                      width: ad.size === "leaderboard" ? 240 : 150,
                      aspectRatio:
                        ad.size === "leaderboard" ? "728/90" : "300/250",
                    }}
                  >
                    <img
                      src={ad.image_url}
                      alt="Ad"
                      className="w-full h-full object-cover"
                    />
                    {ad.overlay_text && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <p className="text-white font-bold text-[10px] leading-tight px-2 text-center drop-shadow-lg">
                          {ad.overlay_text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ad details */}
                  <div className="flex-1 min-w-0">
                    {editId === ad.id ? (
                      <div className="space-y-3">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="Overlay text..."
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/30 bg-white"
                        />
                        <input
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="Link URL..."
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/30 bg-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={editSaving}
                            className="px-4 py-1.5 text-xs bg-primary text-white rounded hover:bg-secondary transition-colors cursor-pointer border-0"
                          >
                            {editSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-4 py-1.5 text-xs text-muted hover:text-primary cursor-pointer bg-transparent border-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                              ad.size === "leaderboard"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {ad.size}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                              ad.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {ad.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {ad.overlay_text && (
                          <p className="text-sm text-primary font-medium truncate">
                            &quot;{ad.overlay_text}&quot;
                          </p>
                        )}
                        {ad.link_url && (
                          <p className="text-[11px] text-muted truncate mt-0.5">
                            {ad.link_url}
                          </p>
                        )}
                        <p className="text-[11px] text-muted mt-1">
                          {new Date(ad.created_at).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editId !== ad.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(ad)}
                        className="text-[11px] text-muted hover:text-primary cursor-pointer bg-transparent border-0 underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(ad)}
                        className={`text-[11px] cursor-pointer bg-transparent border-0 underline underline-offset-4 ${
                          ad.is_active
                            ? "text-amber-600 hover:text-amber-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {ad.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-0 underline underline-offset-4"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
