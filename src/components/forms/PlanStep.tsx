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
      label: "Gratis",
      price: "Rp 0",
      features: ["Akses semua materi", "Sertifikat digital", "Grup WhatsApp divisi"],
    },
    {
      value: "PAID",
      label: "Berbayar",
      price: "Rp 15.000",
      features: ["Semua benefit Gratis", "Sticker eksklusif", "Gantungan kunci ISCOM"],
      badge: "Best Value",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-2">Pilih Plan</h2>
      <p className="text-sm text-slate-400 mb-4">Pilih paket pendaftaran</p>

      <div className="space-y-3">
        {plans.map((plan) => {
          const selected = data.plan === plan.value;
          return (
            <button
              key={plan.value}
              onClick={() => onChange({ plan: plan.value })}
              className={`w-full p-5 rounded-lg border text-left transition relative ${
                selected
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <p className="text-white font-semibold text-lg">{plan.label}</p>
              <p className="text-blue-400 font-bold text-xl mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-slate-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!data.plan || loading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </div>
    </div>
  );
}
