"use client";

import { useState } from "react";
import DivisionStep from "@/components/forms/DivisionStep";
import WhatsAppBubble from "@/components/WhatsAppBubble";

type Participant = {
  id: string;
  nama: string;
  plan: string;
  divisions: string[];
};

const DIVISION_LABELS: Record<string, string> = {
  PROGRAMMING: "Programming",
  DATA: "Data",
  BUSINESS_PLAN: "Business Plan",
  UI_UX: "UI/UX",
};

export default function EditDivisionClient() {
  // Step: "verify" | "edit" | "success"
  const [step, setStep] = useState<"verify" | "edit" | "success">("verify");
  const [npm, setNpm] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState<{ divisions: string[] }>({ divisions: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!npm.trim() || !noWhatsapp.trim()) {
      setError("NPM/Email dan Nomor WhatsApp wajib diisi");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/divisi/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm: npm.trim(), noWhatsapp: noWhatsapp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengecek data");
        setLoading(false);
        return;
      }

      if (!data.exists) {
        setError(
          data.message ||
            "NPM/Email atau nomor WhatsApp tidak cocok dengan data pendaftaran. Pastikan data yang kamu masukkan sudah benar."
        );
        setLoading(false);
        return;
      }

      setParticipant(data);
      setFormData({ divisions: data.divisions ?? [] });
      setStep("edit");
    } catch {
      setError("Gagal terhubung ke server");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!participant || formData.divisions.length === 0) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/divisi/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npm: npm.trim(),
          noWhatsapp: noWhatsapp.trim(),
          divisions: formData.divisions,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan divisi");
        setSaving(false);
        return;
      }

      setStep("success");
    } catch {
      setError("Gagal terhubung ke server");
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ISCOM" className="h-14 sm:h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Ubah Divisi</h1>
          <p className="text-slate-400 text-sm mt-1">Open Recruitment ISCOM 2026</p>
        </div>

        {/* Card */}
        <div className="bg-[#131825] border border-white/[0.06] rounded-2xl p-5 sm:p-7">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step: Verify */}
          {step === "verify" && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">Verifikasi Data</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Masukkan NPM atau Email dan nomor WhatsApp yang terdaftar
                </p>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">NPM / Email</label>
                <input
                  type="text"
                  value={npm}
                  onChange={(e) => setNpm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="Masukkan NPM atau Email kamu"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={noWhatsapp}
                  onChange={(e) => setNoWhatsapp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/[0.15] transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengecek...
                  </span>
                ) : "Cek Data"}
              </button>

              <p className="text-slate-600 text-xs text-center">
                Belum daftar?{" "}
                <a href="/open-recruitment" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Daftar di sini
                </a>
              </p>
            </div>
          )}

          {/* Step: Edit */}
          {step === "edit" && participant && (
            <DivisionStep
              data={formData}
              onChange={(data) => setFormData((prev) => ({ divisions: data.divisions ?? prev.divisions }))}
              onNext={handleSave}
              onBack={() => {
                setStep("verify");
                setError("");
              }}
              submitLabel="Simpan Divisi"
              loading={saving}
            />
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Divisi Tersimpan!</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Terima kasih{participant?.nama ? `, ${participant.nama}` : ""}! Pilihan divisi kamu telah diperbarui.
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 mx-auto max-w-sm">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">Divisi Kamu</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {formData.divisions.map((div) => (
                    <span
                      key={div}
                      className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium"
                    >
                      {DIVISION_LABELS[div] ?? div}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-slate-400 text-sm">
                Perubahan divisi bisa mempengaruhi grup WhatsApp kamu. Hubungi panitia kalau akses grup belum berubah.
              </p>
            </div>
          )}
        </div>

        <p className="mt-5 text-slate-600 text-xs text-center">&copy; 2026 ISCOM UPN Veteran Jawa Timur</p>
      </div>
      <WhatsAppBubble />
    </main>
  );
}
