"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  registrationId: string;
  onSuccess: () => void;
};

export default function PaymentStep({ registrationId, onSuccess }: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("PENDING");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

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
      setProvider(json.provider);
    } else {
      setError(json.error);
    }
  }, [registrationId]);

  useEffect(() => {
    generateQris();
  }, [generateQris]);

  useEffect(() => {
    if (!uploaded && status !== "UPLOADED") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/status/${registrationId}`);
      const json = await res.json();
      setStatus(json.paymentStatus);
      if (json.paymentStatus === "PAID") {
        clearInterval(interval);
        onSuccess();
      }
      if (json.paymentStatus === "REJECTED") {
        setRejectionReason(json.rejectionReason);
        setUploaded(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [uploaded, status, registrationId, onSuccess]);

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
      setUploaded(true);
      setStatus("UPLOADED");
      setRejectionReason(null);
    } else {
      setError(json.error);
    }
    setUploading(false);
  };

  if (uploaded || status === "UPLOADED") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">Menunggu Verifikasi</h2>
        <p className="text-slate-400 text-sm">Bukti pembayaran sedang diperiksa oleh admin. Halaman ini akan otomatis berpindah setelah diverifikasi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Pembayaran</h2>

      {rejectionReason && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Bukti ditolak: {rejectionReason}. Silakan upload ulang.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {qrImage && (
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-lg inline-block">
            <img src={qrImage} alt="QRIS" className="w-64 h-64" />
          </div>
          <p className="text-slate-400 text-sm">Scan QRIS via {provider}</p>
          <p className="text-white font-bold text-2xl">
            Rp {amount.toLocaleString("id-ID")}
          </p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <p className="text-slate-400 text-sm mb-3">Setelah bayar, upload bukti pembayaran:</p>
        <label className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center cursor-pointer">
          {uploading ? "Mengupload..." : "Upload Bukti Bayar"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-slate-500 text-xs mt-2 text-center">Format: JPG, PNG, WebP. Maks 5MB</p>
      </div>
    </div>
  );
}
