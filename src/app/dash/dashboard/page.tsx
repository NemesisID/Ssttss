"use client";

import { useEffect, useState } from "react";

type Stats = {
  total: number;
  free: number;
  paid: number;
  pending: number;
  uploaded: number;
  verified: number;
  rejected: number;
  divisions: Record<string, number>;
};

const DIVISION_LABELS: Record<string, string> = {
  PROGRAMMING: "Programming",
  DATA: "Data",
  BUSINESS_PLAN: "Business Plan",
  UI_UX: "UI/UX",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Peserta", value: stats.total },
    { label: "Plan Gratis", value: stats.free },
    { label: "Plan Berbayar", value: stats.paid },
    { label: "Terverifikasi", value: stats.verified },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview pendaftaran ISCOM 2026</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all duration-200"
          >
            <div className="relative">
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Division Stats + Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per Division */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Per Divisi</h2>
          <div className="space-y-3">
            {Object.entries(stats.divisions).map(([div, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={div}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 text-sm">{DIVISION_LABELS[div] || div}</span>
                    <span className="text-white font-semibold text-sm">{count}</span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.divisions).length === 0 && (
              <p className="text-slate-500 text-sm">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Status Pembayaran</h2>
          <div className="space-y-3">
            {[
              { label: "Menunggu Upload", value: stats.pending, color: "bg-yellow-400" },
              { label: "Sudah Upload", value: stats.uploaded, color: "bg-orange-400" },
              { label: "Terverifikasi", value: stats.verified, color: "bg-emerald-400" },
              { label: "Ditolak", value: stats.rejected, color: "bg-red-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-slate-300 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
