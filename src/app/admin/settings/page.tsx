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
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Gagal menyimpan settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurasi pendaftaran & pembayaran</p>
      </div>

      {message && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {message}
        </div>
      )}

      <div className="space-y-5">
        {/* Registration Settings */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Pendaftaran</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div>
              <p className="text-white text-sm font-medium">Status Pendaftaran</p>
              <p className="text-slate-500 text-xs mt-0.5">Buka atau tutup form pendaftaran</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, registration_open: settings.registration_open === "true" ? "false" : "true" })}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                settings.registration_open === "true" ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                settings.registration_open === "true" ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Harga Plan Berbayar (Rp)</label>
            <input
              type="number"
              value={settings.paid_plan_price || ""}
              onChange={(e) => setSettings({ ...settings, paid_plan_price: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all"
            />
          </div>
        </div>

        {/* QRIS Settings */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">QRIS Provider</h2>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Provider Aktif</label>
            <div className="grid grid-cols-2 gap-3">
              {["GOPAY", "SHOPEEPAY"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSettings({ ...settings, active_qris_provider: p })}
                  className={`p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    settings.active_qris_provider === p
                      ? "border-blue-500/50 bg-blue-500/[0.08] text-blue-400"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/[0.15]"
                  }`}
                >
                  {p === "GOPAY" ? "GoPay" : "ShopeePay"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">String QRIS GoPay (statis)</label>
            <textarea
              value={settings.gopay_qris_string || ""}
              onChange={(e) => setSettings({ ...settings, gopay_qris_string: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all resize-none"
              placeholder="000201010212..."
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">String QRIS ShopeePay (statis)</label>
            <textarea
              value={settings.shopeepay_qris_string || ""}
              onChange={(e) => setSettings({ ...settings, shopeepay_qris_string: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all resize-none"
              placeholder="000201010212..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98]"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </span>
          ) : "Simpan Settings"}
        </button>
      </div>
    </div>
  );
}
