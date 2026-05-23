"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Registration = {
  id: string;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
  plan: string;
  paymentStatus: string;
  paymentProofUrl: string | null;
  paymentProvider: string | null;
  paymentUploadedAt: string | null;
  paymentVerifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  divisions: { division: string }[];
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Registration | null>(null);

  useEffect(() => {
    fetch(`/api/admin/registrations/${params.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      UPLOADED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{data.nama}</h1>
          <p className="text-slate-500 text-sm mt-1">Terdaftar {new Date(data.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBadge(data.paymentStatus)}`}>
          {data.paymentStatus}
        </span>
      </div>

      {/* Info Card */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-5">
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: "NPM", value: data.npm },
            { label: "Prodi", value: data.prodi.replace("_", " ") },
            { label: "Email", value: data.email },
            { label: "WhatsApp", value: data.noWhatsapp },
            { label: "Divisi", value: data.divisions.map((d) => d.division.replace("_", " ")).join(", ") },
            { label: "Plan", value: data.plan },
            { label: "Provider", value: data.paymentProvider || "-" },
            { label: "Upload", value: data.paymentUploadedAt ? new Date(data.paymentUploadedAt).toLocaleString("id-ID") : "-" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-slate-500 text-xs font-medium mb-1">{item.label}</p>
              <p className="text-white text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Proof */}
      {data.paymentProofUrl && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Bukti Pembayaran</h2>
          </div>
          <img
            src={data.paymentProofUrl}
            alt="Bukti bayar"
            className="max-w-sm rounded-xl border border-white/[0.08] shadow-lg"
          />
        </div>
      )}

      {/* Rejection reason */}
      {data.rejectionReason && (
        <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm font-medium">Alasan Reject:</p>
          <p className="text-red-300 text-sm mt-1">{data.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
