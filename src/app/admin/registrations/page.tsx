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
      PENDING: "bg-yellow-500/10 text-yellow-400",
      UPLOADED: "bg-orange-500/10 text-orange-400",
      PAID: "bg-green-500/10 text-green-400",
      REJECTED: "bg-red-500/10 text-red-400",
    };
    return map[status] || "bg-slate-500/10 text-slate-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Peserta</h1>
        <a
          href={`/api/admin/export?status=${statusFilter}`}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
        >
          Export CSV
        </a>
      </div>

      <div className="flex gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            placeholder="Cari nama, NPM, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-slate-400 font-medium">Nama</th>
              <th className="text-left p-4 text-slate-400 font-medium">NPM</th>
              <th className="text-left p-4 text-slate-400 font-medium">Divisi</th>
              <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-4 text-slate-400 font-medium">Status</th>
              <th className="text-left p-4 text-slate-400 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-slate-400">Belum ada data</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-white">{r.nama}</td>
                  <td className="p-4 text-slate-300">{r.npm}</td>
                  <td className="p-4 text-slate-300">{r.divisions.map((d) => d.division).join(", ")}</td>
                  <td className="p-4 text-slate-300">{r.plan}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(r.paymentStatus)}`}>
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/registrations/${r.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchData(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                pagination.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
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
