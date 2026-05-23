"use client";

import type { FormData } from "@/app/(public)/register/page";

type Props = {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const DIVISIONS = [
  { value: "PROGRAMMING", label: "Programming", desc: "Web, Mobile & Backend Dev", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { value: "DATA", label: "Data", desc: "Data Science & Machine Learning", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { value: "BUSINESS_PLAN", label: "Business Plan", desc: "Business Strategy & Planning", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { value: "UI_UX", label: "UI/UX", desc: "User Interface & Experience", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
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
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Pilih Divisi</h2>
        <p className="text-slate-500 text-sm mt-0.5">Pilih minimal 1 divisi yang diminati</p>
      </div>

      <div className="space-y-2.5">
        {DIVISIONS.map((div) => {
          const selected = data.divisions.includes(div.value);
          return (
            <button
              key={div.value}
              onClick={() => toggle(div.value)}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 group ${
                selected
                  ? "border-blue-500/50 bg-blue-500/[0.08] shadow-lg shadow-blue-500/5"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  selected ? "bg-blue-500/20" : "bg-white/[0.05] group-hover:bg-white/[0.08]"
                }`}>
                  <svg className={`w-5 h-5 ${selected ? "text-blue-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={div.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{div.label}</p>
                  <p className="text-slate-500 text-xs">{div.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selected ? "border-blue-500 bg-blue-500" : "border-white/20"
                }`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
          className="flex-1 py-3.5 border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-200 text-sm"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98] text-sm"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
