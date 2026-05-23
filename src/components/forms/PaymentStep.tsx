"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  registrationId: string;
  onSuccess: () => void;
};

export default function PaymentStep({ registrationId, onSuccess }: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null); // QR dinamis dengan nominal sudah terinjeksi
  const [amount, setAmount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const generateQris = useCallback(async () => {
    const res = await fetch("/api/payment/generate-qris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId }),
    });
    const json = await res.json();
    if (res.ok) {
      setQrImage(json.qrImage);
      setAmount(json.amount);
    } else {
      setError(json.error);
    }
  }, [registrationId]);

  useEffect(() => {
    generateQris();
  }, [generateQris]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("registrationId", registrationId);

    const res = await fetch("/api/payment/upload", { method: "POST", body: formData });
    const json = await res.json();

    if (res.ok) {
      onSuccess();
    } else {
      setError(json.error);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Pembayaran</h2>
        <p className="text-slate-500 text-sm mt-0.5">Scan QRIS lalu upload bukti bayar</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!qrImage && !error && (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {qrImage && (
        <div className="text-center space-y-3">
          {/* QR Code dinamis — nominal sudah terinjeksi, peserta tinggal scan */}
          <div className="bg-white p-3 rounded-2xl inline-block shadow-xl shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImage}
              alt="QRIS Pembayaran"
              className="w-56 h-56 rounded-lg"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 text-xs">QRIS</span>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-3xl">
            Rp {amount.toLocaleString("id-ID")}
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
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-slate-600 text-xs mt-2 text-center">JPG, PNG, atau WebP. Maksimal 5MB</p>
      </div>
    </div>
  );
}
