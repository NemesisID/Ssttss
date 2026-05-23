"use client";

import type { FormData } from "@/app/(public)/register/page";

type Props = {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
};

export default function PlanStep({ data, onChange, onNext, onBack, loading }: Props) {
  const plans = [
    {
      value: "FREE",
      label: "Free",
      price: "Rp 0",
      features: ["Akses semua materi", "Sertifikat digital", "Grup WhatsApp divisi"],
    },
    {
      value: "PAID",
      label: "Premium",
      price: "Rp 15.000",
      features: ["Semua benefit Free", "Sticker eksklusif ISCOM", "Gantungan kunci limited"],
      badge: "Recommended",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Pilih Plan</h2>
        <p className="text-slate-500 text-sm mt-0.5">Pilih paket pendaftaran yang sesuai</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => {
          const selected = data.plan === plan.value;
          const isPaid = plan.value === "PAID";
          return (
            <button
              key={plan.value}
              onClick={() => onChange({ plan: plan.value })}
              className={`w-full p-5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                selected
                  ? isPaid
                    ? "border-blue-500/50 bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.05] shadow-lg shadow-blue-500/5"
                    : "border-blue-500/50 bg-blue-500/[0.08]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
              }`}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected ? "border-blue-500 bg-blue-500" : "border-white/20"
                }`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{plan.label}</p>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-2xl mt-1">{plan.price}</p>
                  <ul className="mt-3 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="text-slate-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-200 text-sm"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!data.plan || loading}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
          ) : "Daftar Sekarang"}
        </button>
      </div>
    </div>
  );
}
