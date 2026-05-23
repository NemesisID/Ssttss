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
    { label: "Total Peserta", value: stats.total, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", gradient: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10" },
    { label: "Plan Gratis", value: stats.free, icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", gradient: "from-emerald-500 to-teal-500", bg: "from-emerald-500/10 to-teal-500/10" },
    { label: "Plan Berbayar", value: stats.paid, icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", gradient: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" },
    { label: "Terverifikasi", value: stats.verified, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-emerald-500 to-green-500", bg: "from-emerald-500/10 to-green-500/10" },
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
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bg} rounded-full blur-2xl -translate-y-8 translate-x-8 opacity-50`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center mb-3`}>
                <svg className={`w-5 h-5 bg-gradient-to-r ${card.gradient} bg-clip-text`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'currentColor' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
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
