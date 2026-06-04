"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Registration = {
  id: string;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
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

type ConfirmDialog = {
  type: "delete" | "sync";
  id?: string;
  nama?: string;
};

type EditModal = {
  id: string;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
};

export default function RegistrationsPage() {
  const [data, setData] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("date_desc");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const fetchData = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (prodiFilter) params.set("prodi", prodiFilter);
    if (sortFilter) params.set("sort", sortFilter);

    const res = await fetch(`/api/admin/registrations?${params}`);
    const json = await res.json();
    setData(json.data);
    setPagination(json.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, prodiFilter, sortFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  const handleDelete = async () => {
    if (!confirm || confirm.type !== "delete" || !confirm.id) return;
    setActionLoading(true);
    await fetch(`/api/admin/registrations/${confirm.id}`, { method: "DELETE" });
    setConfirm(null);
    setActionLoading(false);
    fetchData(pagination.page);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setActionLoading(true);
    await fetch(`/api/admin/registrations/${editModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: editModal.nama,
        npm: editModal.npm,
        prodi: editModal.prodi,
        email: editModal.email,
        noWhatsapp: editModal.noWhatsapp,
      }),
    });
    setEditModal(null);
    setActionLoading(false);
    fetchData(pagination.page);
  };

  const handleSync = async () => {
    setConfirm(null);
    setActionLoading(true);
    setSyncMsg("");
    const res = await fetch("/api/admin/sync-sheets", { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (json.success) {
      setSyncMsg(`✓ Berhasil sinkronisasi ${json.count} data ke spreadsheet`);
    } else {
      setSyncMsg("✗ Gagal sinkronisasi: " + (json.error || "Unknown error"));
    }
    setTimeout(() => setSyncMsg(""), 5000);
  };


  return (
    <div>
      {/* Custom Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131825] border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {confirm.type === "delete" ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Hapus Peserta</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Tindakan ini tidak bisa dibatalkan</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-5">
                  Yakin ingin menghapus data <span className="text-white font-semibold">{confirm.nama}</span>? Data akan terhapus permanen dari database.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm hover:bg-white/[0.08] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-all disabled:opacity-60"
                  >
                    {actionLoading ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Sinkronisasi Spreadsheet</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Spreadsheet akan dihapus dan diisi ulang</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-5">
                  Semua data di spreadsheet akan <span className="text-yellow-400 font-semibold">dihapus</span> dan diisi ulang dengan seluruh data dari database. Lanjutkan?
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm hover:bg-white/[0.08] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500/90 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-60"
                  >
                    {actionLoading ? "Menyinkronkan..." : "Ya, Sinkronkan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131825] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Edit Data Peserta</h3>
              <button onClick={() => setEditModal(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {([
                { label: "Nama", field: "nama" as keyof EditModal },
                { label: "NPM", field: "npm" as keyof EditModal },
                { label: "Email", field: "email" as keyof EditModal },
                { label: "No WhatsApp", field: "noWhatsapp" as keyof EditModal },
              ] as const).map(({ label, field }) => (
                <div key={field}>
                  <label className="text-slate-400 text-xs font-medium mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={editModal[field]}
                    onChange={(e) => setEditModal({ ...editModal, [field]: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-white/[0.15]"
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1 block">Program Studi</label>
                <select
                  value={editModal.prodi}
                  onChange={(e) => setEditModal({ ...editModal, prodi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none hover:border-white/[0.15] transition-all"
                >
                  <option value="INFORMATIKA">Informatika</option>
                  <option value="SISTEM_INFORMASI">Sistem Informasi</option>
                  <option value="SAINS_DATA">Sains Data</option>
                  <option value="BISNIS_DIGITAL">Bisnis Digital</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm hover:bg-white/[0.08] transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleEditSave}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/90 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-60"
              >
                {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Peserta</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total} total pendaftar</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Sync button */}
          <button
            onClick={() => setConfirm({ type: "sync" })}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Spreadsheet
          </button>
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
      </div>

      {/* Sync feedback */}
      {syncMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${syncMsg.startsWith("✓") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {syncMsg}
        </div>
      )}

      {/* Filters */}
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, NPM, email, atau no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-white/[0.15]"
            />
          </div>
        </form>
        <select
          value={prodiFilter}
          onChange={(e) => setProdiFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none hover:border-white/[0.15] transition-all"
        >
          <option value="">Semua Prodi</option>
          <option value="INFORMATIKA">Informatika</option>
          <option value="SISTEM_INFORMASI">Sistem Informasi</option>
          <option value="SAINS_DATA">Sains Data</option>
          <option value="BISNIS_DIGITAL">Bisnis Digital</option>
        </select>
        <select
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none hover:border-white/[0.15] transition-all"
        >
          <option value="date_desc">Terbaru</option>
          <option value="date_asc">Terlama</option>
          <option value="name_asc">Nama (A-Z)</option>
          <option value="name_desc">Nama (Z-A)</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none hover:border-white/[0.15] transition-all"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="DONE">Done</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Nama</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Nomor HP</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Prodi</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Divisi</th>
              <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Plan</th>
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
                  <td className="p-4 text-slate-300 font-mono text-xs">{r.noWhatsapp}</td>
                  <td className="p-4 text-slate-300 text-xs">
                    {r.prodi?.replace("_", " ")}
                  </td>
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
                      {r.plan === "PAID" ? "Berbayar" : r.plan === "FREE" ? "Gratis" : r.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/dash/registrations/${r.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium hover:underline">
                        Detail
                      </Link>
                      <span className="text-white/10">|</span>
                      <button
                        onClick={() => setEditModal({ id: r.id, nama: r.nama, npm: r.npm, prodi: r.prodi, email: r.email, noWhatsapp: r.noWhatsapp })}
                        className="text-slate-400 hover:text-white text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-white/10">|</span>
                      <button
                        onClick={() => setConfirm({ type: "delete", id: r.id, nama: r.nama })}
                        className="text-red-400/70 hover:text-red-400 text-xs font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
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
