"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Registration = {
  id: string;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  plan: string;
  paymentStatus: string;
  createdAt: string;
  divisions: { division: string }[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function RegistrationsPage() {
  const [data, setData] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/registrations?${params}`);
    const json = await res.json();
    setData(json.data);
    setPagination(json.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Peserta</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total} total pendaftar</p>
        </div>
        <a
          href={`/api/admin/export?status=${statusFilter}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, NPM, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-white/[0.15]"
            />
          </div>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none hover:border-white/[0.15] transition-all"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Nama</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">NPM</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Divisi</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Plan</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center">
                <div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada data pendaftar</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{r.nama}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{r.email}</p>
                  </td>
                  <td className="p-4 text-slate-300 font-mono text-xs">{r.npm}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {r.divisions.map((d) => (
                        <span key={d.division} className="px-2 py-0.5 bg-white/[0.05] rounded text-[10px] text-slate-400">
                          {d.division.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${r.plan === "PAID" ? "text-purple-400" : "text-slate-400"}`}>
                      {r.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${statusBadge(r.paymentStatus)}`}>
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/dash/registrations/${r.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium hover:underline">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchData(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                pagination.page === i + 1
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
