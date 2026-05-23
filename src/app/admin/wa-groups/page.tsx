"use client";

import { useEffect, useState } from "react";

type WaGroup = {
  id: string;
  division: string;
  link: string;
  isActive: boolean;
};

const DIVISIONS = ["PROGRAMMING", "DATA", "BUSINESS_PLAN", "UI_UX"];
const DIVISION_LABELS: Record<string, string> = {
  PROGRAMMING: "Programming",
  DATA: "Data",
  BUSINESS_PLAN: "Business Plan",
  UI_UX: "UI/UX",
};

export default function WaGroupsPage() {
  const [groups, setGroups] = useState<WaGroup[]>([]);
  const [newDivision, setNewDivision] = useState("");
  const [newLink, setNewLink] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    const res = await fetch("/api/admin/wa-groups");
    setGroups(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleAdd = async () => {
    if (!newDivision || !newLink) return;
    await fetch("/api/admin/wa-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ division: newDivision, link: newLink }),
    });
    setNewDivision("");
    setNewLink("");
    fetchGroups();
  };

  const handleToggle = async (group: WaGroup) => {
    await fetch("/api/admin/wa-groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: group.id, isActive: !group.isActive }),
    });
    fetchGroups();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus grup ini?")) return;
    await fetch("/api/admin/wa-groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchGroups();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const usedDivisions = groups.map((g) => g.division);
  const availableDivisions = DIVISIONS.filter((d) => !usedDivisions.includes(d));

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Grup WhatsApp</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola link grup per divisi</p>
      </div>

      {/* Existing groups */}
      <div className="space-y-3 mb-8">
        {groups.map((group) => (
          <div key={group.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 hover:border-white/[0.1] transition-all">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{DIVISION_LABELS[group.division] || group.division}</p>
              <p className="text-slate-500 text-xs truncate mt-0.5">{group.link}</p>
            </div>
            <button
              onClick={() => handleToggle(group)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                group.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {group.isActive ? "Aktif" : "Nonaktif"}
            </button>
            <button
              onClick={() => handleDelete(group.id)}
              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] border-dashed rounded-xl p-8 text-center">
            <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-slate-500 text-sm">Belum ada grup WhatsApp</p>
            <p className="text-slate-600 text-xs mt-1">Tambahkan link grup untuk setiap divisi</p>
          </div>
        )}
      </div>

      {/* Add new group */}
      {availableDivisions.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Tambah Grup</h2>
          </div>

          <select
            value={newDivision}
            onChange={(e) => setNewDivision(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all"
          >
            <option value="">Pilih Divisi</option>
            {availableDivisions.map((d) => (
              <option key={d} value={d}>{DIVISION_LABELS[d] || d}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="https://chat.whatsapp.com/..."
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newDivision || !newLink}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
          >
            Tambah Grup
          </button>
        </div>
      )}
    </div>
  );
}
