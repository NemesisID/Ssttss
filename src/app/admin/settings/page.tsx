"use client";

import { useEffect, useState } from "react";

type Settings = {
  paid_plan_price?: string;
  active_qris_provider?: string;
  gopay_qris_string?: string;
  shopeepay_qris_string?: string;
  registration_open?: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setMessage("Settings berhasil disimpan");
    } else {
      setMessage("Gagal menyimpan settings");
    }
    setSaving(false);
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {message && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pendaftaran</h2>

          <div className="flex items-center justify-between">
            <label className="text-slate-300">Status Pendaftaran</label>
            <button
              onClick={() => setSettings({ ...settings, registration_open: settings.registration_open === "true" ? "false" : "true" })}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                settings.registration_open === "true"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {settings.registration_open === "true" ? "Buka" : "Tutup"}
            </button>
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">Harga Plan Berbayar (Rp)</label>
            <input
              type="number"
              value={settings.paid_plan_price || ""}
              onChange={(e) => setSettings({ ...settings, paid_plan_price: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">QRIS Provider</h2>

          <div>
            <label className="text-slate-300 text-sm block mb-1">Provider Aktif</label>
            <select
              value={settings.active_qris_provider || "GOPAY"}
              onChange={(e) => setSettings({ ...settings, active_qris_provider: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
            >
              <option value="GOPAY">GoPay Merchant</option>
              <option value="SHOPEEPAY">ShopeePay</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">String QRIS GoPay (statis)</label>
            <textarea
              value={settings.gopay_qris_string || ""}
              onChange={(e) => setSettings({ ...settings, gopay_qris_string: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste string QRIS statis dari GoPay Merchant..."
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">String QRIS ShopeePay (statis)</label>
            <textarea
              value={settings.shopeepay_qris_string || ""}
              onChange={(e) => setSettings({ ...settings, shopeepay_qris_string: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste string QRIS statis dari ShopeePay..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium rounded-lg transition"
        >
          {saving ? "Menyimpan..." : "Simpan Settings"}
        </button>
      </div>
    </div>
  );
}
