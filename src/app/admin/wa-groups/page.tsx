"use client";

import { useEffect, useState } from "react";

type WaGroup = {
  id: string;
  division: string;
  link: string;
  isActive: boolean;
};

const DIVISIONS = ["PROGRAMMING", "DATA", "BUSINESS_PLAN", "UI_UX"];

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

  if (loading) return <p className="text-slate-400">Loading...</p>;

  const usedDivisions = groups.map((g) => g.division);
  const availableDivisions = DIVISIONS.filter((d) => !usedDivisions.includes(d));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Grup WhatsApp</h1>

      <div className="space-y-3 mb-8">
        {groups.map((group) => (
          <div key={group.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-medium">{group.division.replace("_", " ")}</p>
              <p className="text-slate-400 text-sm truncate">{group.link}</p>
            </div>
            <button
              onClick={() => handleToggle(group)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                group.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {group.isActive ? "Aktif" : "Nonaktif"}
            </button>
            <button
              onClick={() => handleDelete(group.id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Hapus
            </button>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-slate-400 text-sm">Belum ada grup WhatsApp</p>
        )}
      </div>

      {availableDivisions.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Tambah Grup</h2>
          <select
            value={newDivision}
            onChange={(e) => setNewDivision(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
          >
            <option value="">Pilih Divisi</option>
            {availableDivisions.map((d) => (
              <option key={d} value={d}>{d.replace("_", " ")}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Link grup WhatsApp (https://chat.whatsapp.com/...)"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm"
          >
            Tambah
          </button>
        </div>
      )}
    </div>
  );
}
