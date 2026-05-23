"use client";

import { useEffect, useRef, useState } from "react";

type Settings = {
  paid_plan_price?: string;
  registration_open?: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // QRIS Image state
  const [qrisImageUrl, setQrisImageUrl] = useState<string | null>(null);
  const [qrisUploading, setQrisUploading] = useState(false);
  const [qrisDeleting, setQrisDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/qris-image").then((r) => r.json()),
    ]).then(([settingsData, qrisData]) => {
      setSettings(settingsData);
      if (qrisData.imagePath) {
        setQrisImageUrl(
          qrisData.imagePath.replace(/^\/uploads\/qris\//, "/api/uploads/qris/")
        );
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
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      showMessage("Settings berhasil disimpan");
    } else {
      showMessage("Gagal menyimpan settings", "error");
    }
    setSaving(false);
  };

  const handleQrisUpload = async (file: File) => {
    if (!file) return;
    setQrisUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/admin/qris-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const url = data.imagePath.replace(
        /^\/uploads\/qris\//,
        "/api/uploads/qris/"
      );
      setQrisImageUrl(url + "?t=" + Date.now()); // bust cache
      showMessage("Gambar QRIS berhasil diupload");
    } else {
      const data = await res.json();
      showMessage(data.error || "Gagal upload gambar QRIS", "error");
    }
    setQrisUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleQrisUpload(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleQrisUpload(file);
  };

  const handleDeleteQris = async () => {
    if (!confirm("Hapus gambar QRIS? Pengguna tidak akan bisa membayar sampai gambar baru diupload.")) return;
    setQrisDeleting(true);
    const res = await fetch("/api/admin/qris-image", { method: "DELETE" });
    if (res.ok) {
      setQrisImageUrl(null);
      showMessage("Gambar QRIS berhasil dihapus");
    } else {
      showMessage("Gagal menghapus gambar QRIS", "error");
    }
    setQrisDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurasi pendaftaran &amp; pembayaran</p>
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

      <div className="space-y-5">
        {/* Registration Settings */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Pendaftaran</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div>
              <p className="text-white text-sm font-medium">Status Pendaftaran</p>
              <p className="text-slate-500 text-xs mt-0.5">Buka atau tutup form pendaftaran</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, registration_open: settings.registration_open === "true" ? "false" : "true" })}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                settings.registration_open === "true" ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                settings.registration_open === "true" ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Harga Plan Berbayar (Rp)</label>
            <input
              type="number"
              value={settings.paid_plan_price || ""}
              onChange={(e) => setSettings({ ...settings, paid_plan_price: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all"
            />
          </div>
        </div>

        {/* QRIS Settings */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Gambar QRIS</h2>
              <p className="text-slate-500 text-xs mt-0.5">Upload gambar QR code QRIS untuk pembayaran</p>
            </div>
          </div>

          {/* Preview gambar yang sudah diupload */}
          {qrisImageUrl ? (
            <div className="space-y-4">
              <div className="relative flex flex-col items-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white p-4 shadow-xl shadow-black/30 w-fit mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrisImageUrl}
                    alt="Gambar QRIS"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  QRIS aktif
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={qrisUploading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 text-sm hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {qrisUploading ? (
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
                  onClick={handleDeleteQris}
                  disabled={qrisDeleting}
                  className="py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-sm hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {qrisDeleting ? (
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
            /* Area upload — drag & drop */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !qrisUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-purple-400/60 bg-purple-500/[0.08]"
                  : "border-white/[0.10] bg-white/[0.02] hover:border-purple-400/40 hover:bg-purple-500/[0.04]"
              }`}
            >
              {qrisUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-10 h-10 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-400 text-sm">Mengupload gambar QRIS...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isDragging ? "bg-purple-500/20" : "bg-white/[0.04]"
                  }`}>
                    <svg className={`w-7 h-7 transition-colors duration-200 ${isDragging ? "text-purple-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {isDragging ? "Lepas untuk upload" : "Klik atau drag gambar QRIS di sini"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG, atau WebP · Maks 10MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Status info */}
          {!qrisImageUrl && !qrisUploading && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
              <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-amber-400 text-xs">
                Belum ada gambar QRIS. Pengguna yang memilih paket berbayar tidak dapat melanjutkan pembayaran.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98]"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </span>
          ) : "Simpan Settings"}
        </button>
      </div>
    </div>
  );
}
