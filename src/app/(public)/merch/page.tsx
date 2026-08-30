"use client";

import { useState, useEffect, useCallback } from "react";
import WhatsAppBubble from "@/components/WhatsAppBubble";

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
};

type ParticipantData = {
  exists: boolean;
  message?: string;
  id?: string;
  nama?: string;
  npm?: string;
  prodi?: string;
  plan?: string;
  paymentStatus?: string;
  merchChoice?: string | null;
  merchSelectedAt?: string | null;
};

function resolveImageUrl(rawPath: string | null | undefined, prefix: "merch" | "merch-options"): string | null {
  if (!rawPath) return null;
  // Already an API url or data: uri
  if (rawPath.startsWith("/api/") || rawPath.startsWith("data:")) return rawPath;
  const uploadPrefix = `/uploads/${prefix}/`;
  const apiPrefix = `/api/uploads/${prefix}/`;
  if (rawPath.startsWith(uploadPrefix)) {
    return rawPath.replace(uploadPrefix, apiPrefix) + "?t=" + Date.now();
  }
  return rawPath;
}

export default function MerchPage() {
  // Step: "verify" | "not-found" | "free-offer" | "free-payment" | "select" | "success"
  const [step, setStep] = useState<string>("verify");
  const [npm, setNpm] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [merchConfig, setMerchConfig] = useState<MerchConfig | null>(null);
  const [selectedMerch, setSelectedMerch] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Payment state (untuk upgrade FREE)
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrAmount, setQrAmount] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Load merch config
  useEffect(() => {
    fetch("/api/merch/config", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMerchConfig)
      .catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (!npm.trim() || !noWhatsapp.trim()) {
      setError("NPM dan Nomor WhatsApp wajib diisi");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/merch/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm: npm.trim(), noWhatsapp: noWhatsapp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengecek data");
        setLoading(false);
        return;
      }

      if (!data.exists) {
        setParticipant(data);
        setStep("not-found");
      } else {
        setParticipant(data);
        if (data.merchChoice) {
          setSelectedMerch(data.merchChoice);
          setStep("success");
        } else if (data.plan === "PAID" && data.paymentStatus === "DONE") {
          setStep("select");
        } else if (data.plan === "FREE") {
          setStep("free-offer");
        } else {
          setStep("select");
        }
      }
    } catch {
      setError("Gagal terhubung ke server");
    }
    setLoading(false);
  };

  const generateQris = useCallback(async () => {
    const res = await fetch("/api/payment/generate-qris", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) {
      setQrImage(json.qrImage);
      setQrAmount(json.amount);
    } else {
      setError(json.error);
    }
  }, []);

  const handleStartPayment = () => {
    setStep("free-payment");
    generateQris();
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/payment/upload", { method: "POST", body: formData });
      let json;
      try {
        json = await uploadRes.json();
      } catch {
        setError(`Terjadi kesalahan di server. Status HTTP: ${uploadRes.status}`);
        setUploading(false);
        return;
      }

      if (uploadRes.ok && json.filePath) {
        const upgradeRes = await fetch("/api/merch/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationId: participant?.id,
            paymentProofUrl: json.filePath,
          }),
        });

        if (upgradeRes.ok) {
          setStep("select");
        } else {
          const upgradeData = await upgradeRes.json();
          setError(upgradeData.error || "Gagal memproses pembayaran");
        }
      } else {
        setError(json.error || "Gagal upload bukti bayar");
      }
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    }
    setUploading(false);
  };

  const handleSelectMerch = async () => {
    if (!selectedMerch || !participant?.id) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/merch/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: participant.id,
          merchChoice: selectedMerch,
        }),
      });

      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan pilihan merchandise");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }
    setSaving(false);
  };

  // Cari gambar untuk opsi yang sedang dipilih / highlighted
  const selectedOptionImage = merchConfig?.options.find(
    (o) => o.name === selectedMerch
  )?.imagePath ?? null;

  // Gambar yang ditampilkan: gambar opsi dipilih → fallback gambar utama
  const displayImagePath = selectedOptionImage || merchConfig?.imagePath || null;
  const displayImagePrefix = selectedOptionImage ? "merch-options" : "merch";

  if (!merchConfig) {
    return (
      <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!merchConfig.open) {
    return (
      <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ISCOM" className="h-14 sm:h-16 w-auto mx-auto mb-4 object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Merchandise ISCOM 2026</h1>
          </div>
          <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-6 sm:p-7">
            <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Pemilihan Merchandise Belum Dibuka</h2>
            <p className="text-slate-400 text-sm">Pemilihan merchandise saat ini belum tersedia. Silakan cek kembali nanti.</p>
          </div>
        </div>
        <WhatsAppBubble />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ISCOM" className="h-14 sm:h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">{merchConfig.title}</h1>
        </div>

        {/* Card */}
        <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-5 sm:p-7">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step: Verify */}
          {step === "verify" && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">Verifikasi Data</h2>
                <p className="text-slate-500 text-sm mt-0.5">Masukkan NPM dan nomor WhatsApp yang terdaftar</p>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">NPM</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={npm}
                  onChange={(e) => setNpm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="Masukkan NPM kamu"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={noWhatsapp}
                  onChange={(e) => setNoWhatsapp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengecek...
                  </span>
                ) : "Cek Status"}
              </button>
            </div>
          )}

          {/* Step: Not Found */}
          {step === "not-found" && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Data Tidak Ditemukan</h2>
                <p className="text-slate-400 text-sm">
                  {participant?.message || "NPM atau nomor WhatsApp tidak cocok dengan data pendaftaran. Pastikan data yang kamu masukkan sudah benar."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setStep("verify"); setError(""); }}
                  className="flex-1 py-3 border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-200 text-sm"
                >
                  Coba Lagi
                </button>
                <a
                  href="/open-recruitment"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] text-sm text-center"
                >
                  Daftar Sekarang
                </a>
              </div>
            </div>
          )}

          {/* Step: Free Offer */}
          {step === "free-offer" && participant && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-500/[0.06] border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-sm font-medium">Halo, {participant.nama}!</p>
                <p className="text-slate-400 text-xs mt-1">Kamu terdaftar di Paket Gratis. Untuk mendapatkan merchandise, kamu perlu melakukan pembayaran terlebih dahulu.</p>
              </div>

              {/* Preview Merchandise */}
              {merchConfig.imagePath && (
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/20 mx-auto w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(merchConfig.imagePath, "merch") ?? ""}
                    alt="Merchandise"
                    className="w-full max-w-[220px] sm:max-w-[280px] h-auto rounded-lg"
                  />
                </div>
              )}

              <div className="text-center">
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-2xl">
                  Rp {parseInt(merchConfig.price).toLocaleString("id-ID")}
                </p>
                <p className="text-slate-500 text-xs mt-1">Harga Welcome Kit ISCOM</p>
              </div>

              <button
                onClick={handleStartPayment}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] text-sm"
              >
                Beli Merchandise
              </button>

              <button
                onClick={() => { setStep("verify"); setError(""); }}
                className="w-full py-3 border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-200 text-sm"
              >
                Kembali
              </button>
            </div>
          )}

          {/* Step: Free Payment */}
          {step === "free-payment" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Pembayaran</h2>
                <p className="text-slate-500 text-sm mt-0.5">Scan QRIS lalu upload bukti bayar</p>
              </div>

              {!qrImage && !error && (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {qrImage && (
                <div className="text-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-xl shadow-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImage} alt="QRIS Pembayaran" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg" />
                  </div>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-2xl sm:text-3xl">
                    Rp {qrAmount.toLocaleString("id-ID")}
                  </p>
                  <p className="text-slate-500 text-xs">Nominal sudah terisi otomatis — langsung scan &amp; bayar</p>
                </div>
              )}

              <div className="border-t border-white/[0.06] pt-5">
                <p className="text-slate-400 text-sm mb-3 text-center">Setelah bayar, upload bukti pembayaran</p>
                <label className={`block w-full py-4 px-4 rounded-xl text-center transition-all duration-200 ${
                  uploading
                    ? "bg-slate-700 text-slate-400"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]"
                }`}>
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengupload...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Bukti Bayar
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadProof}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-slate-600 text-xs mt-2 text-center">JPG, PNG, atau WebP. Maksimal 5MB</p>
              </div>
            </div>
          )}

          {/* Step: Select Merch */}
          {step === "select" && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">Pilih Varian Merchandise</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {participant?.nama ? `Halo ${participant.nama}! ` : ""} <br /> {merchConfig.description}
                </p>
              </div>

              {/* Preview gambar — berubah sesuai pilihan */}
              {displayImagePath && (
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/20 mx-auto w-fit transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={displayImagePath}
                    src={resolveImageUrl(displayImagePath, displayImagePrefix) ?? ""}
                    alt={selectedMerch ?? "Merchandise"}
                    className="w-full max-w-[220px] sm:max-w-[280px] h-auto rounded-lg transition-opacity duration-300"
                  />
                </div>
              )}

              {/* Divider section */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider shrink-0">Pilih Varian</p>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {merchConfig.options.map((opt) => {
                  const isSelected = selectedMerch === opt.name;
                  return (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedMerch(opt.name)}
                      className={`w-full rounded-xl border text-left transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-500/[0.08] shadow-lg shadow-blue-500/10"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                      }`}
                    >
                      {opt.imagePath ? (
                        <div className="aspect-square w-full overflow-hidden bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveImageUrl(opt.imagePath, "merch-options") ?? ""}
                            alt={opt.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full bg-white/[0.03] flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-3 flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-blue-500 bg-blue-500" : "border-white/20"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <p className="text-white font-medium text-xs leading-tight">{opt.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {merchConfig.options.length === 0 && (
                <div className="p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl text-amber-400 text-sm text-center">
                  Belum ada varian merchandise tersedia. Silakan hubungi panitia.
                </div>
              )}

              <button
                onClick={handleSelectMerch}
                disabled={!selectedMerch || saving}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : "Konfirmasi Pilihan"}
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white">Pilihan Tersimpan!</h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                  Terima kasih{participant?.nama ? `, ${participant.nama}` : ""}! Pilihan merchandise kamu telah tersimpan:
                </p>
                {selectedMerch && (
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-lg">{selectedMerch}</p>
                  </div>
                )}
                <p className="text-slate-400 text-sm">
                  Merchandise akan dibagikan saat acara. Pantau Instagram{" "}
                  <a
                    href="https://www.instagram.com/iscom_upnjatim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                  >
                    @iscom_upnjatim
                  </a>{" "}
                  untuk info lebih lanjut!
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-5 text-slate-600 text-xs text-center">&copy; 2026 ISCOM UPN Veteran Jawa Timur</p>
      </div>
      <WhatsAppBubble />
    </main>
  );
}
