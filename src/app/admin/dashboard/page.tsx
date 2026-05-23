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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-slate-400">Loading...</p>;
  }

  const cards = [
    { label: "Total Peserta", value: stats.total, color: "blue" },
    { label: "Plan Gratis", value: stats.free, color: "green" },
    { label: "Plan Berbayar", value: stats.paid, color: "purple" },
    { label: "Menunggu Upload", value: stats.pending, color: "yellow" },
    { label: "Menunggu Verifikasi", value: stats.uploaded, color: "orange" },
    { label: "Terverifikasi", value: stats.verified, color: "green" },
    { label: "Ditolak", value: stats.rejected, color: "red" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`p-4 rounded-xl border ${colorMap[card.color]}`}
          >
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Per Divisi</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.divisions).map(([div, count]) => (
            <div key={div} className="text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-sm text-slate-400">{div.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
