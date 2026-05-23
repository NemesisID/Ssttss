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
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/registrations/${params.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.id]);

  const handleVerify = async (action: "approve" | "reject") => {
    if (action === "reject" && !reason) {
      alert("Alasan reject wajib diisi");
      return;
    }
    setLoading(true);
    await fetch(`/api/payment/verify/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    router.refresh();
    const res = await fetch(`/api/admin/registrations/${params.id}`);
    setData(await res.json());
    setLoading(false);
  };

  if (!data) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-4">
        &larr; Kembali
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">{data.nama}</h1>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">NPM</p>
            <p className="text-white">{data.npm}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Prodi</p>
            <p className="text-white">{data.prodi}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Email</p>
            <p className="text-white">{data.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">WhatsApp</p>
            <p className="text-white">{data.noWhatsapp}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Divisi</p>
            <p className="text-white">{data.divisions.map((d) => d.division).join(", ")}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Plan</p>
            <p className="text-white">{data.plan}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Status Pembayaran</p>
            <p className="text-white font-medium">{data.paymentStatus}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Provider</p>
            <p className="text-white">{data.paymentProvider || "-"}</p>
          </div>
        </div>
      </div>

      {data.paymentProofUrl && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Bukti Pembayaran</h2>
          <img
            src={data.paymentProofUrl}
            alt="Bukti bayar"
            className="max-w-sm rounded-lg border border-white/10"
          />
          <p className="text-slate-400 text-xs mt-2">
            Diupload: {data.paymentUploadedAt ? new Date(data.paymentUploadedAt).toLocaleString("id-ID") : "-"}
          </p>
        </div>
      )}

      {data.paymentStatus === "UPLOADED" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Verifikasi Pembayaran</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Alasan reject (wajib jika reject)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleVerify("approve")}
                disabled={loading}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium rounded-lg transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleVerify("reject")}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-medium rounded-lg transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
