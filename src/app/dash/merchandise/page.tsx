"use client";

import { useEffect, useRef, useState } from "react";

type MerchOption = {
  name: string;
  imagePath: string | null;
};

type MerchConfig = {
  imagePath: string | null;
  title: string;
  description: string;
  options: MerchOption[];
  open: boolean;
  price: string;
  stats: Record<string, number>;
};

function resolveUrl(rawPath: string | null, prefix: "merch" | "merch-options"): string | null {
  if (!rawPath) return null;
  if (rawPath.startsWith("/api/")) return rawPath;
  const uploadPrefix = `/uploads/${prefix}/`;
  const apiPrefix = `/api/uploads/${prefix}/`;
  if (rawPath.startsWith(uploadPrefix)) {
    return rawPath.replace(uploadPrefix, apiPrefix) + "?t=" + Date.now();
  }
  return rawPath;
}

export default function MerchandisePage() {
  const [config, setConfig] = useState<MerchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Image upload state (gambar utama)
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<MerchOption[]>([]);
  const [open, setOpen] = useState(true);
  const [price, setPrice] = useState("");
  const [newOption, setNewOption] = useState("");

  // Per-option image upload
  const [optionUploading, setOptionUploading] = useState<string | null>(null); // option name
  const [optionDeleting, setOptionDeleting] = useState<string | null>(null); // option name
  const optionFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/merch", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: MerchConfig) => {
        setConfig(data);
        setTitle(data.title);
        setDescription(data.description);
        setOptions(data.options);
        setOpen(data.open);
        setPrice(data.price);
        if (data.imagePath) {
          setImageUrl(resolveUrl(data.imagePath, "merch"));
        }
        setLoading(false);
      });
  }, []);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/merch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, options, open, price }),
    });

    if (res.ok) {
      showMessage("Pengaturan merchandise berhasil disimpan");
    } else {
      showMessage("Gagal menyimpan pengaturan", "error");
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/admin/merch", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setImageUrl(resolveUrl(data.imagePath, "merch"));
      showMessage("Gambar merchandise berhasil diupload");
    } else {
      const data = await res.json();
      showMessage(data.error || "Gagal upload gambar", "error");
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDeleteImage = async () => {
    if (!confirm("Hapus gambar merchandise?")) return;
    setDeleting(true);
    const res = await fetch("/api/admin/merch", { method: "DELETE" });
    if (res.ok) {
      setImageUrl(null);
      showMessage("Gambar merchandise berhasil dihapus");
    } else {
      showMessage("Gagal menghapus gambar", "error");
    }
    setDeleting(false);
  };

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.some((o) => o.name === trimmed)) {
      showMessage("Varian sudah ada", "error");
      return;
    }
    setOptions([...options, { name: trimmed, imagePath: null }]);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Upload gambar per opsi varian
  const handleOptionImageUpload = async (file: File, optName: string) => {
    setOptionUploading(optName);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("optionName", optName);

    const res = await fetch("/api/admin/merch/option-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setOptions((prev) =>
        prev.map((o) => (o.name === optName ? { ...o, imagePath: data.imagePath } : o))
      );
      showMessage(`Gambar varian "${optName}" berhasil diupload`);
    } else {
      const data = await res.json();
      showMessage(data.error || "Gagal upload gambar varian", "error");
    }
    setOptionUploading(null);
  };

  // Hapus gambar opsi varian
  const handleOptionImageDelete = async (optName: string, imagePath: string) => {
    setOptionDeleting(optName);
    await fetch("/api/admin/merch/option-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagePath }),
    });
    setOptions((prev) =>
      prev.map((o) => (o.name === optName ? { ...o, imagePath: null } : o))
    );
    setOptionDeleting(null);
    showMessage(`Gambar varian "${optName}" dihapus`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Merchandise</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola gambar, opsi varian, dan pengaturan merchandise</p>
      </div>

      {message && (
        <div
          className={`mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2 border ${
            messageType === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {messageType === "success" ? (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {message}
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        {/* Status & Harga */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Pengaturan Umum</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div>
              <p className="text-white text-sm font-medium">Pemilihan Merchandise</p>
              <p className="text-slate-500 text-xs mt-0.5">Buka atau tutup halaman pemilihan merch</p>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${open ? "bg-emerald-500" : "bg-slate-600"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${open ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Judul Merchandise</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ISCOM Welcome Kit"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pilih varian merchandise eksklusif ISCOM"
              rows={2}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Harga Merchandise (Rp) — untuk peserta FREE</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="15000"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Gambar Utama Merchandise */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Gambar / Poster Merchandise</h2>
              <p className="text-slate-500 text-xs mt-0.5">Gambar utama yang tampil jika varian tidak punya gambar</p>
            </div>
          </div>

          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative flex flex-col items-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white p-4 shadow-xl shadow-black/30 w-fit mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Gambar Merchandise" className="w-48 sm:w-64 h-auto object-contain" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Gambar merchandise aktif
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 text-sm hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Ganti Gambar
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteImage}
                  disabled={deleting}
                  className="py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-sm hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {deleting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-purple-400/60 bg-purple-500/[0.08]"
                  : "border-white/[0.10] bg-white/[0.02] hover:border-purple-400/40 hover:bg-purple-500/[0.04]"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-10 h-10 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-400 text-sm">Mengupload gambar...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${isDragging ? "bg-purple-500/20" : "bg-white/[0.04]"}`}>
                    <svg className={`w-7 h-7 transition-colors duration-200 ${isDragging ? "text-purple-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {isDragging ? "Lepas untuk upload" : "Klik atau drag gambar merchandise"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG, atau WebP · Maks 10MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Opsi Varian Merchandise */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Opsi Varian Merchandise</h2>
              <p className="text-slate-500 text-xs mt-0.5">Tambah varian dan opsional upload gambar tiap varian</p>
            </div>
          </div>

          {/* List varian */}
          {options.length > 0 ? (
            <div className="space-y-3">
              {options.map((opt, i) => {
                const count = config?.stats?.[opt.name] || 0;
                const optImageUrl = resolveUrl(opt.imagePath, "merch-options");
                const isUploadingThis = optionUploading === opt.name;
                const isDeletingThis = optionDeleting === opt.name;

                return (
                  <div key={i} className="p-3 sm:p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    {/* Row atas: nomor + nama + delete varian */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{opt.name}</p>
                        <p className="text-slate-500 text-xs">{count} peserta memilih</p>
                      </div>
                      <button
                        onClick={() => removeOption(i)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Row bawah: gambar varian */}
                    <div className="flex items-center gap-3">
                      {optImageUrl ? (
                        <>
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={optImageUrl} alt={opt.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <button
                              onClick={() => optionFileRefs.current[opt.name]?.click()}
                              disabled={isUploadingThis}
                              className="py-2 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 text-xs hover:border-white/[0.15] hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[36px]"
                            >
                              {isUploadingThis ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              )}
                              Ganti
                            </button>
                            <button
                              onClick={() => opt.imagePath && handleOptionImageDelete(opt.name, opt.imagePath)}
                              disabled={isDeletingThis}
                              className="py-2 px-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] text-red-400 text-xs hover:border-red-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[36px]"
                            >
                              {isDeletingThis ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              Hapus
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => optionFileRefs.current[opt.name]?.click()}
                          disabled={isUploadingThis}
                          className="flex items-center gap-2 py-2 px-3 rounded-lg border border-dashed border-white/[0.10] bg-white/[0.02] text-slate-400 text-xs hover:border-white/[0.20] hover:text-slate-300 transition-all disabled:opacity-50 min-h-[44px]"
                        >
                          {isUploadingThis ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                          {isUploadingThis ? "Mengupload..." : "Upload gambar varian"}
                        </button>
                      )}

                      {/* Hidden file input per opsi */}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        ref={(el) => { optionFileRefs.current[opt.name] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleOptionImageUpload(file, opt.name);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
              <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-amber-400 text-xs">
                Belum ada varian merchandise. Tambahkan setidaknya satu varian agar peserta bisa memilih.
              </p>
            </div>
          )}

          {/* Add new varian */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOption()}
              placeholder="Nama varian baru, misal: Ganci Logo ISCOM"
              className="flex-1 min-w-0 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
            />
            <button
              onClick={addOption}
              className="px-4 sm:px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-cyan-600/20 active:scale-[0.98] text-sm flex items-center gap-1.5 shrink-0 min-h-[48px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* Statistik Ringkasan */}
        {config && Object.keys(config.stats).length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white">Rekap Pemilih</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(config.stats).map(([variant, count]) => (
                <div key={variant} className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <p className="text-slate-400 text-xs font-medium mb-1 truncate">{variant}</p>
                  <p className="text-white text-2xl font-bold">{count}</p>
                  <p className="text-slate-500 text-xs">peserta</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] min-h-[52px]"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </span>
          ) : "Simpan Pengaturan Merchandise"}
        </button>
      </div>
    </div>
  );
}
