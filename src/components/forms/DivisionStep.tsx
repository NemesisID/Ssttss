"use client";

import type { FormData } from "@/app/(public)/register/page";

type Props = {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const DIVISIONS = [
  { value: "PROGRAMMING", label: "Programming", desc: "Web, Mobile, Backend Development" },
  { value: "DATA", label: "Data", desc: "Data Science, Analytics, Machine Learning" },
  { value: "BUSINESS_PLAN", label: "Business Plan", desc: "Business Strategy & Planning" },
  { value: "UI_UX", label: "UI/UX", desc: "User Interface & Experience Design" },
];

export default function DivisionStep({ data, onChange, onNext, onBack }: Props) {
  const toggle = (division: string) => {
    const current = data.divisions;
    if (current.includes(division)) {
      onChange({ divisions: current.filter((d) => d !== division) });
    } else {
      onChange({ divisions: [...current, division] });
    }
  };

  const canProceed = data.divisions.length > 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-2">Pilih Divisi</h2>
      <p className="text-sm text-slate-400 mb-4">Pilih minimal 1 divisi yang diminati</p>

      <div className="space-y-3">
        {DIVISIONS.map((div) => {
          const selected = data.divisions.includes(div.value);
          return (
            <button
              key={div.value}
              onClick={() => toggle(div.value)}
              className={`w-full p-4 rounded-lg border text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{div.label}</p>
                  <p className="text-slate-400 text-sm">{div.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    selected ? "border-blue-500 bg-blue-500" : "border-white/30"
                  }`}
                >
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
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
          disabled={!canProceed}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
